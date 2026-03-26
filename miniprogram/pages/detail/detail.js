const { request } = require('../../utils/request')
const { formatDate } = require('../../utils/format')
const { getAppSafe, showLoading, hideLoading, showSuccess, showError, vibrate } = require('../../utils/common')

Page({
  data: {
    id: null,
    document: null,
    loading: true,
    loadFailed: false,
    isFavorited: false,
    downloading: false,      // 下载中状态
    downloadProgress: 0,    // 下载进度
    cachedPdfPath: null,    // 缓存的 PDF 路径
    preloading: false       // 是否正在预加载
  },

  onLoad(options) {
    // 如果已经有数据且不是首次加载，直接忽略
    if (this.data.document && this.data.document.id) {
      return
    }

    // 兜底处理：过滤无效的 id
    let rawId = options && options.id
    if (rawId === 'undefined' || rawId === 'null' || !rawId) {
      this.setData({ loading: false })
      return
    }

    // 强制转为整数
    const id = parseInt(rawId, 10)

    // 简单校验
    if (!id || id <= 0 || isNaN(id)) {
      this.setData({ loading: false })
      return
    }

    this.setData({ id })
    this.loadDocument(id)
    this.loadFavoriteStatus(id)
  },

  onUnload() {
    // 页面卸载时清理缓存文件（可选）
    const { cachedPdfPath } = this.data
    if (cachedPdfPath) {
      // 不删除，因为其他页面可能还在用
    }
  },

  // 加载资料详情（带自动重试）
  async loadDocument(id, retryCount = 0) {
    try {
      this.setData({ loading: true })
      const res = await request({
        url: `/documents/${id}`
      })

      const docData = res.data
      if (!docData || !docData.id) {
        if (retryCount < 2) {
          setTimeout(() => {
            this.loadDocument(id, retryCount + 1)
          }, 500)
          return
        }
        return
      }

      docData.formattedDate = formatDate(docData.createdAt, 'date')

      // 只有数据完整（有 category）才关闭 loading，避免闪出空状态
      if (docData && docData.category) {
        this.setData({ document: docData, loading: false })
      } else {
        this.setData({ document: docData })
      }

      const app = getAppSafe()
      if (app.globalData.token) {
        request({
          url: '/documents/view/record',
          method: 'POST',
          data: { documentId: id },
          needAuth: true
        }).catch(() => {})
      }

      // 预加载 PDF（静默下载，提升首次打开速度）
      this.preloadPdf(docData)
    } catch (error) {
      // 最多重试 2 次，重试期间保持 loading: true
      if (retryCount < 2) {
        setTimeout(() => {
          this.loadDocument(id, retryCount + 1)
        }, 500)
        return
      }
      // 重试次数用完才显示失败
      this.setData({ loading: false, loadFailed: true })
      showError('加载失败，请返回重试')
    }
  },

  // 预加载 PDF（静默下载，用户点击时直接打开）
  preloadPdf(docData) {
    let { pdfUrl, id } = docData
    if (!pdfUrl) return

    const cacheKey = `pdf_cache_${id}`
    const cachedPath = wx.getStorageSync(cacheKey)
    
    // 已有缓存，不重复下载
    if (cachedPath) {
      this.setData({ cachedPdfPath: cachedPath })
      return
    }

    // 检查是否正在预加载
    if (this.data.preloading) return

    // 先清理旧缓存，确保不超过 5 个文件
    this.clearOldCache(() => {
      this.doPreloadPdf(pdfUrl, cacheKey)
    })
  },

  // 执行预加载
  doPreloadPdf(pdfUrl, cacheKey) {
    // 强制转换为 HTTPS 并编码 URL（与正式下载保持一致）
    pdfUrl = pdfUrl.replace(/^http:/i, 'https:')
    try {
      const urlObj = pdfUrl.match(/^(https?:\/\/[^/?#]+)([^?#]*)(\?[^#]*)?(#.*)?$/)
      if (urlObj) {
        const [, origin, pathname, search = '', hash = ''] = urlObj
        const encodedPath = pathname.split('/').map(seg => {
          try { return encodeURIComponent(decodeURIComponent(seg)) } catch { return encodeURIComponent(seg) }
        }).join('/')
        pdfUrl = origin + encodedPath + search + hash
      }
    } catch (e) {
      // 编码失败使用原始 URL
    }

    this.setData({ preloading: true })

    // 静默下载，不显示 loading
    const downloadTask = wx.downloadFile({
      url: pdfUrl,
      filePath: `${wx.env.USER_DATA_PATH}/pv_${Date.now()}.pdf`,
      timeout: 120000, // 2分钟超时
      success: (res) => {
        if (res.statusCode === 200) {
          const filePath = res.filePath || res.tempFilePath
          wx.setStorageSync(cacheKey, filePath)
          this.setData({ 
            cachedPdfPath: filePath,
            preloading: false 
          })
        }
      },
      fail: () => {
        // 预加载失败静默处理，不影响用户体验
        this.setData({ preloading: false })
      }
    })

    // 监听进度（可选，用于调试）
    downloadTask.onProgressUpdate((res) => {
      // 预加载进度不显示给用户，可以在这里打日志
      // console.log('预加载进度:', res.progress + '%')
    })
  },

  // 清理旧缓存，只保留最近 5 个 PDF 文件
  clearOldCache(callback, isAutoCleanup = false) {
    const fs = wx.getFileSystemManager()
    const userDataPath = wx.env.USER_DATA_PATH
    const MAX_CACHE_COUNT = 5
    
    try {
      // 读取所有文件
      const files = fs.readdirSync(userDataPath)
      const pdfFiles = files.filter(f => f.startsWith('pv_') && f.endsWith('.pdf'))
      
      // 如果文件数量未超过限制，无需清理
      if (pdfFiles.length <= MAX_CACHE_COUNT) {
        if (callback) callback()
        return
      }
      
      // 获取文件信息并按时间排序（最旧的在前）
      const fileInfos = pdfFiles.map(filename => {
        try {
          const stat = fs.statSync(`${userDataPath}/${filename}`)
          return { name: filename, createTime: stat.createTime || 0 }
        } catch (e) {
          return { name: filename, createTime: 0 }
        }
      }).sort((a, b) => a.createTime - b.createTime)
      
      // 删除多余的文件，只保留最近的 5 个
      const deleteCount = fileInfos.length - MAX_CACHE_COUNT
      let deleted = 0
      
      fileInfos.slice(0, deleteCount).forEach(fileInfo => {
        try {
          fs.unlinkSync(`${userDataPath}/${fileInfo.name}`)
          deleted++
          // 同时清理对应的缓存记录
          const keys = wx.getStorageInfoSync().keys
          keys.forEach(key => {
            if (key.startsWith('pdf_cache_')) {
              const cachedPath = wx.getStorageSync(key)
              if (cachedPath && cachedPath.includes(fileInfo.name)) {
                wx.removeStorageSync(key)
              }
            }
          })
        } catch (e) {
          console.error('删除文件失败:', fileInfo.name, e)
        }
      })
      
      console.log(`自动清理完成，删除了 ${deleted} 个旧文件，保留最近 ${MAX_CACHE_COUNT} 个`)
      
      // 清理完成后执行回调（无感，不显示 loading）
      if (callback) {
        callback()
      }
    } catch (e) {
      console.error('清理缓存失败:', e)
      showError('缓存清理失败，请手动清理')
    }
  },

  // 查询当前资料的收藏状态
  async loadFavoriteStatus(id) {
    try {
      const app = getAppSafe()
      if (!app.globalData.token) return

      const res = await request({
        url: '/documents/favorites/list',
        needAuth: true
      })
      const favorites = res.data || []
      const isFavorited = favorites.some(doc => doc.id === id)
      this.setData({ isFavorited })
    } catch (error) {
      // 保持默认未收藏状态
    }
  },

  // 打开PDF（优化版：使用 downloadFile + 进度显示）
  openPDF() {
    const app = getAppSafe()
    if (!app.globalData.token) {
      wx.showModal({
        title: '提示',
        content: '查看资料需要先登录',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            wx.switchTab({ url: '/pages/mine/mine' })
          }
        }
      })
      return
    }

    const { pdfUrl, id } = this.data.document

    if (!pdfUrl) {
      showError('暂无PDF文件')
      return
    }

    // 检查是否已有缓存（优先使用预加载的缓存）
    const cacheKey = `pdf_cache_${id}`
    const cachedPath = this.data.cachedPdfPath || wx.getStorageSync(cacheKey)
    
    if (cachedPath) {
      // 验证缓存文件是否存在
      const fs = wx.getFileSystemManager()
      try {
        fs.accessSync(cachedPath)
        // 缓存存在，直接打开
        wx.openDocument({
          filePath: cachedPath,
          fileType: 'pdf',
          showMenu: true,
          success: () => {
            // 静默成功，不提示
          },
          fail: (err) => {
            // 缓存文件失效，重新下载
            console.log('缓存文件失效，重新下载')
            wx.removeStorageSync(cacheKey)
            this.downloadAndOpenPdf(pdfUrl, cacheKey)
          }
        })
        return
      } catch (e) {
        // 文件不存在，重新下载
        wx.removeStorageSync(cacheKey)
        this.downloadAndOpenPdf(pdfUrl, cacheKey)
        return
      }
    }

    // 没有缓存，下载并打开
    this.downloadAndOpenPdf(pdfUrl, cacheKey)
  },

  // 下载并打开 PDF
  downloadAndOpenPdf(pdfUrl, cacheKey) {
    const { downloading } = this.data
    if (downloading) {
      showError('正在下载中，请稍候')
      return
    }

    // 强制转换为 HTTPS
    let safeUrl = pdfUrl.replace(/^http:/i, 'https:')

    // 对 URL 路径中的中文/特殊字符做编码（兼容旧数据中未编码的 URL）
    try {
      // 只对 path 部分编码，保留 scheme://host 和 query/hash
      const urlObj = safeUrl.match(/^(https?:\/\/[^/?#]+)([^?#]*)(\?[^#]*)?(#.*)?$/)
      if (urlObj) {
        const [, origin, pathname, search = '', hash = ''] = urlObj
        // 对路径每一段单独编码，已编码的不重复编码
        const encodedPath = pathname.split('/').map(seg => {
          try { return encodeURIComponent(decodeURIComponent(seg)) } catch { return encodeURIComponent(seg) }
        }).join('/')
        safeUrl = origin + encodedPath + search + hash
      }
    } catch (e) {
      // 编码失败则使用原始 URL
    }

    // 显示下载提示
    wx.showLoading({ title: '正在打开文档...', mask: true })
    this.setData({ downloading: true, downloadProgress: 0 })

    // 使用 downloadFile API（微信官方推荐的文件下载方式）
    const downloadTask = wx.downloadFile({
      url: safeUrl,
      filePath: `${wx.env.USER_DATA_PATH}/pv_${Date.now()}.pdf`,
      timeout: 60000, // 60秒超时
      success: (res) => {
        wx.hideLoading()
        this.setData({ downloading: false, downloadProgress: 0 })

        if (res.statusCode === 200) {
          // 如果指定了 filePath，使用 filePath；否则使用 tempFilePath
          const filePath = res.filePath || res.tempFilePath
          
          if (!filePath) {
            showError('下载失败：无法获取文件路径')
            return
          }
          
          // 缓存文件路径
          wx.setStorageSync(cacheKey, filePath)

          // 打开文档
          wx.openDocument({
            filePath: filePath,
            fileType: 'pdf',
            showMenu: true,
            success: () => {
              // 静默成功
            },
            fail: (err) => {
              console.error('打开文档失败:', err)
              // 清理缓存
              wx.removeStorageSync(cacheKey)
              if (err.errMsg && err.errMsg.includes('file not found')) {
                showError('文件已过期，请重新下载')
              } else {
                showError('打开失败，请重试')
              }
            }
          })
        } else {
          showError('下载失败（状态码 ' + res.statusCode + '）')
        }
      },
      fail: (err) => {
        wx.hideLoading()
        this.setData({ downloading: false, downloadProgress: 0 })

        console.error('下载失败:', err)

        if (err.errMsg) {
          if (err.errMsg.includes('timeout')) {
            showError('下载超时，文件较大或网络较慢，请重试')
          } else if (err.errMsg.includes('domain')) {
            showError('下载失败：该域名未加入小程序合法域名')
          } else if (err.errMsg.includes('fail cancel')) {
            // 用户取消，不提示
          } else if (err.errMsg.includes('maximum size') || err.errMsg.includes('storage limit')) {
            // 小程序文件存储配额超限，尝试清理后重试
            console.log('存储配额超限，尝试清理缓存')
            this.clearOldCache(() => {
              // 清理完成后重试下载
              this.downloadAndOpenPdf(pdfUrl, cacheKey)
            })
            return
          } else {
            // 记录具体错误以便排查
            console.error('下载失败详情:', err.errMsg, err)
            showError('下载失败，请检查网络后重试')
          }
        } else {
          showError('下载失败，请重试')
        }
      }
    })

    // 监听下载进度
    downloadTask.onProgressUpdate((res) => {
      const progress = res.progress
      this.setData({ downloadProgress: progress })
      
      // 更新 loading 提示（保持文字长度一致，避免字体大小变化）
      if (progress < 100) {
        wx.showLoading({ title: `正在打开文档 ${progress}%`, mask: true })
      }
    })
  },

  // 取消下载
  cancelDownload() {
    const { downloading } = this.data
    if (downloading) {
      this.setData({ downloading: false })
      wx.hideLoading()
      showError('已取消下载')
    }
  },

  // 收藏/取消收藏
  async toggleFavorite() {
    const app = getAppSafe()
    if (!app.globalData.token) {
      showError('请先登录')
      return
    }

    vibrate()

    try {
      const res = await request({
        url: '/documents/favorite/toggle',
        method: 'POST',
        data: { documentId: this.data.id },
        needAuth: true
      })

      const isFavorited = res.data.isFavorite
      this.setData({ isFavorited })

      wx.showToast({
        title: isFavorited ? '收藏成功' : '取消收藏',
        icon: isFavorited ? 'success' : 'none',
        duration: 1500
      })
    } catch {
      showError('操作失败，请重试')
    }
  },

  // 返回资料库首页
  goBack() {
    wx.switchTab({
      url: '/pages/library/library'
    })
  },

  // 分享
  onShareAppMessage() {
    return {
      title: this.data.document?.title || '光伏资料',
      path: `/pages/detail/detail?id=${this.data.id}`
    }
  }
})
