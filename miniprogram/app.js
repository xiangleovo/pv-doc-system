App({
  // 小程序版本号
  version: '1.3.5',

  globalData: {
    userInfo: null,
    token: null,
    // 联系电话（从后端获取，改号无需重新发版）
    contactPhone: '',
    // 公司名称（从后端获取）
    companyName: '',
    // 筛选参数（用于 filter → library 跳转传递）
    filterParams: null,
    // 线上 API 地址
    baseUrl: 'https://server.qqe4.com/api'
  },

  onLaunch() {
    // 检查本地存储的token
    const token = wx.getStorageSync('token')
    const userInfo = wx.getStorageSync('userInfo')

    if (token) {
      this.globalData.token = token
    }

    if (userInfo) {
      this.globalData.userInfo = userInfo
    }

    // 从后端获取配置
    this.loadConfig()
  },

  // 加载系统配置
  loadConfig() {
    // 批量获取配置
    this.request({
      url: '/configs/values?keys=contact_phone,company_name'
    }).then(res => {
      if (res.data) {
        // 联系电话
        if (res.data.contact_phone) {
          this.globalData.contactPhone = res.data.contact_phone
          wx.setStorageSync('contactPhone', res.data.contact_phone)
        }
        // 公司名称
        if (res.data.company_name) {
          this.globalData.companyName = res.data.company_name
          wx.setStorageSync('companyName', res.data.company_name)
        }
      }
    }).catch(() => {
      // 使用本地缓存作为备用
      const cachedPhone = wx.getStorageSync('contactPhone')
      if (cachedPhone) {
        this.globalData.contactPhone = cachedPhone
      }
      const cachedCompany = wx.getStorageSync('companyName')
      if (cachedCompany) {
        this.globalData.companyName = cachedCompany
      }
    })
  },

  // 网络请求封装
  request(options) {
    const { url, method = 'GET', data = {}, needAuth = false } = options

    return new Promise((resolve, reject) => {
      const header = {
        'content-type': 'application/json'
      }

      // 添加认证token
      if (needAuth && this.globalData.token) {
        header['Authorization'] = `Bearer ${this.globalData.token}`
      }

      wx.request({
        url: this.globalData.baseUrl + url,
        method,
        data,
        header,
        success: (res) => {
          if (res.data.success) {
            resolve(res.data)
          } else {
            // 详情页接口的失败不弹toast，避免闪出错误提示
            if (!options.url.includes('/documents/')) {
              wx.showToast({
                title: res.data.message || '请求失败',
                icon: 'none'
              })
            }
            reject(res.data)
          }
        },
        fail: (err) => {
          wx.showToast({
            title: '网络错误',
            icon: 'none'
          })
          reject(err)
        }
      })
    })
  }
})
