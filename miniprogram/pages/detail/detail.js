const { request } = require('../../utils/request')
const { formatDate } = require('../../utils/format')
const { getAppSafe, showLoading, hideLoading, showSuccess, showError, vibrate } = require('../../utils/common')

Page({
  data: {
    id: null,
    document: null,
    loading: true,
    loadFailed: false,  // 标记是否加载失败
    isFavorited: false
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

  // 打开PDF
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

    const { pdfUrl } = this.data.document

    if (!pdfUrl) {
      showError('暂无PDF文件')
      return
    }

    // 强制转换为 HTTPS（微信小程序只允许 HTTPS 请求）
    const safeUrl = pdfUrl.replace(/^http:/i, 'https:')

    showLoading('文档加载中...')

    // 用 request + ArrayBuffer 方式下载，绕过开发工具 downloadFile bug
    wx.request({
      url: safeUrl,
      method: 'GET',
      responseType: 'arraybuffer',
      success(res) {
        if (res.statusCode !== 200) {
          hideLoading()
          showError('文件下载失败（状态码 ' + res.statusCode + '）')
          return
        }

        const fs = wx.getFileSystemManager()
        // 用时间戳生成唯一文件名，避免缓存冲突
        const savedPath = `${wx.env.USER_DATA_PATH}/pv_${Date.now()}.pdf`

        fs.writeFile({
          filePath: savedPath,
          data: res.data,
          encoding: 'binary',
          success() {
            hideLoading()
            wx.openDocument({
              filePath: savedPath,
              fileType: 'pdf',
              showMenu: true,
              success() {},
              fail() {
                showError('打开失败，请重试')
              }
            })
          },
          fail() {
            hideLoading()
            showError('文件写入失败，请重试')
          }
        })
      },
      fail(err) {
        hideLoading()
        if (err.errMsg && err.errMsg.includes('domain')) {
          showError('下载失败：该域名未加入小程序合法域名')
        } else {
          showError('下载失败，请检查网络连接')
        }
      }
    })
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
