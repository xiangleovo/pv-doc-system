const { request } = require('../../utils/request')
const { getAppSafe, resolveAvatar, vibrate, showLoading, hideLoading, showSuccess, showError } = require('../../utils/common')

Page({
  data: {
    userInfo: null,
    isLogin: false,
    contactPhone: '',
    stats: {
      favorites: 0,
      views: 0
    },
    showProfileModal: false,
    tempAvatar: '',
    tempNickname: '',
    tempPhone: '',
    appVersion: ''
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setSelected(1)
    }

    const app = getAppSafe()
    // 优先使用全局数据，其次使用本地缓存
    let phone = app.globalData?.contactPhone
    if (!phone) {
      phone = wx.getStorageSync('contactPhone')
    }
    this.setData({ 
      contactPhone: phone || '',
      appVersion: app.version || '1.0.0'
    })

    this.checkLogin(() => {
      if (this.data.isLogin) {
        this.loadStats()
      }
    })
  },

  // 空操作（用于未登录时头像点击的占位绑定）
  noop() {},

  // 检查登录状态
  checkLogin(callback) {
    const app = getAppSafe()
    const token = app.globalData?.token
    const userInfo = app.globalData?.userInfo

    if (userInfo && userInfo.avatar) {
      userInfo.avatar = resolveAvatar(userInfo.avatar)
    }

    this.setData({ isLogin: !!token, userInfo }, () => {
      if (callback) callback()
    })
  },

  // 加载统计数据
  async loadStats() {
    if (!this.data.isLogin) return
    try {
      const [favRes, viewRes] = await Promise.all([
        request({ url: '/documents/favorites/list', needAuth: true }),
        request({ url: '/documents/view/count', needAuth: true })
      ])
      this.setData({
        'stats.favorites': (favRes.data || []).length,
        'stats.views': viewRes.data?.count || 0
      })
    } catch (error) {
      console.error('加载统计数据失败:', error)
    }
  },

  // 手机号授权登录
  async onGetPhoneNumber(e) {
    const { code, errno, errMsg } = e.detail || {}

    // 只要 code 有值就是授权成功，不依赖 errno（各基础库版本行为不一致）
    if (!code) {
      console.log('手机号授权失败:', errno, errMsg)
      wx.showToast({ title: '需要授权手机号才能登录', icon: 'none', duration: 2000 })
      return
    }

    const phoneCode = code

    try {
      showLoading('登录中...')

      // 同时获取微信登录 code
      const loginRes = await new Promise((resolve, reject) => {
        wx.login({ success: resolve, fail: reject })
      })

      if (!loginRes.code) throw new Error('获取登录凭证失败')

      const res = await request({
        url: '/auth/wx/login',
        method: 'POST',
        data: { code: loginRes.code, phoneCode }
      })

      const app = getAppSafe()
      app.globalData.token = res.data.token
      app.globalData.userInfo = res.data.user
      wx.setStorageSync('token', res.data.token)
      wx.setStorageSync('userInfo', res.data.user)

      const displayUser = { ...res.data.user, avatar: resolveAvatar(res.data.user.avatar) }
      this.setData({ isLogin: true, userInfo: displayUser })

      hideLoading()

      const nickname = res.data.user.nickname || ''
      const isNewUser = !nickname || nickname === '微信用户' || /^\d{3}\*{4}\d{4}$/.test(nickname)
      if (isNewUser) {
        setTimeout(() => this.onEditProfile(), 300)
        wx.showToast({ title: '登录成功，可设置昵称', icon: 'none' })
      } else {
        showSuccess('登录成功')
      }

      this.loadStats()

    } catch (error) {
      hideLoading()
      showError(error.message || '登录失败')
    }
  },

  // 点击头像/昵称区域，打开修改资料浮层
  onEditProfile() {
    const { userInfo } = this.data
    this.setData({
      showProfileModal: true,
      tempAvatar: userInfo?.avatar || '',
      tempNickname: userInfo?.nickname === '微信用户' ? '' : (userInfo?.nickname || ''),
      tempPhone: userInfo?.phone || ''
    })
  },

  // 选择头像回调
  onChooseAvatar(e) {
    this.setData({ tempAvatar: e.detail.avatarUrl })
  },

  // 头像加载失败
  onAvatarError() {
    this.setData({ 'userInfo.avatar': '/images/default-avatar.png' })
  },

  // 弹层头像加载失败
  onTempAvatarError() {
    this.setData({ tempAvatar: '/images/default-avatar.png' })
  },

  // 昵称输入
  onNicknameInput(e) {
    this.setData({ tempNickname: e.detail.value })
  },

  // 弹层显隐变化
  onPopupChange(e) {
    if (!e.detail.visible) {
      this.setData({ showProfileModal: false, tempAvatar: '', tempNickname: '' })
    }
  },

  // 取消修改
  onCancelProfile() {
    this.setData({ showProfileModal: false, tempAvatar: '', tempNickname: '' })
  },

  // 确认保存资料（手机号通过微信授权获取，无需手动填写）
  async onConfirmProfile() {
    const { tempAvatar, tempNickname } = this.data

    if (!tempNickname.trim()) {
      showError('请输入昵称')
      return
    }

    try {
      showLoading('保存中...')

      let finalAvatar = tempAvatar
      const currentAvatar = this.data.userInfo?.avatar || ''
      const needUpload = tempAvatar && tempAvatar !== currentAvatar

      if (needUpload) {
        finalAvatar = await this.uploadAvatar(tempAvatar)
      }

      const requestData = {
        nickname: tempNickname.trim(),
        avatar: finalAvatar
      }
      // 手机号通过微信授权自动获取并绑定，无需手动处理

      await request({
        url: '/auth/user/profile',
        method: 'PUT',
        data: requestData,
        needAuth: true
      })

      const app = getAppSafe()
      const displayAvatar = (needUpload && tempAvatar) ? tempAvatar : resolveAvatar(finalAvatar)

      const newUserInfo = {
        ...app.globalData?.userInfo,
        nickname: tempNickname.trim(),
        avatar: finalAvatar,
        phone: app.globalData?.userInfo?.phone
      }
      app.globalData.userInfo = newUserInfo
      wx.setStorageSync('userInfo', newUserInfo)

      this.setData({
        showProfileModal: false,
        userInfo: { ...newUserInfo, avatar: displayAvatar },
        tempAvatar: '',
        tempNickname: ''
      })

      hideLoading()
      showSuccess('保存成功')

    } catch (error) {
      hideLoading()
      console.error('保存资料失败:', error)
      showError('保存失败，请重试')
    }
  },

  // 上传头像到服务器
  uploadAvatar(tempPath) {
    return new Promise((resolve, reject) => {
      const app = getAppSafe()
      const token = app.globalData?.token
      const baseUrl = app.globalData?.baseUrl || 'https://server.qqe4.com/api'
      const serverRoot = baseUrl.replace(/\/api$/, '')

      wx.uploadFile({
        url: baseUrl + '/auth/user/avatar',
        filePath: tempPath,
        name: 'avatar',
        header: { Authorization: 'Bearer ' + token },
        success(res) {
          try {
            const data = JSON.parse(res.data)
            if (data.success && data.data?.url) {
              const url = data.data.url
              resolve(url.startsWith('http') ? url : serverRoot + url)
            } else {
              reject(new Error(data.message || '上传失败'))
            }
          } catch (e) {
            reject(new Error('解析响应失败'))
          }
        },
        fail(err) {
          console.error('头像上传失败:', err)
          reject(new Error('头像上传失败'))
        }
      })
    })
  },

  // 我的收藏
  onFavorite() {
    vibrate()
    if (!this.data.isLogin) {
      showError('请先登录')
      return
    }
    wx.navigateTo({ url: '/pages/favorite/favorite' })
  },

  // 联系电话
  onContact() {
    vibrate()
    wx.showModal({
      title: '联系电话',
      content: this.data.contactPhone,
      confirmText: '拨打',
      success: (res) => {
        if (res.confirm) wx.makePhoneCall({ phoneNumber: this.data.contactPhone })
      }
    })
  },

  // 关于我们
  onAbout() {
    vibrate()
    wx.navigateTo({ url: '/pages/about/about' })
  },

  // 用户协议和隐私政策
  onPrivacy() {
    vibrate()
    wx.showModal({
      title: '用户协议和隐私政策',
      content: '本小程序尊重并保护用户隐私，登录所需手机号仅用于账号绑定，不会泄露给第三方。',
      confirmText: '我知道了',
      showCancel: false
    })
  },

  // 退出登录
  onLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗?',
      success: (res) => {
        if (res.confirm) {
          const app = getAppSafe()
          app.globalData.token = null
          app.globalData.userInfo = null
          wx.removeStorageSync('token')
          wx.removeStorageSync('userInfo')
          this.setData({ isLogin: false, userInfo: null, stats: { favorites: 0, views: 0 } })
          showSuccess('已退出登录')
        }
      }
    })
  }
})
