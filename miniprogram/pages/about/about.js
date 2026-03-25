const { getAppSafe, vibrate } = require('../../utils/common')

Page({
  data: {
    contactPhone: '',
    companyName: '',
    panelBrands: [
      { name: '隆基', initial: '隆', logo: 'https://image.qqe4.com/wp-content/uploads/2026/03/20260324020501540.png' },
      { name: '晶科', initial: '晶', logo: 'https://image.qqe4.com/wp-content/uploads/2026/03/20260324020325476.png' },
      { name: '晶澳', initial: '晶', logo: 'https://image.qqe4.com/wp-content/uploads/2026/03/20260324021429217.png' },
      { name: '天合', initial: '天', logo: 'https://image.qqe4.com/wp-content/uploads/2026/03/20260324023724307.png' },
      { name: '协鑫', initial: '阿', logo: 'https://image.qqe4.com/wp-content/uploads/2026/03/20260324023931985.png' },
      { name: '正泰', initial: '正', logo: 'https://image.qqe4.com/wp-content/uploads/2026/03/20260324023650707.png' },
      { name: '通威', initial: '通', logo: 'https://image.qqe4.com/wp-content/uploads/2026/03/20260324023339703.png' }
    ],
    inverterBrands: [
      { name: '华为', initial: '华', logo: '' },
      { name: '阳光电源', initial: '阳', logo: '' },
      { name: '固德威', initial: '固', logo: '' },
      { name: '锦浪', initial: '锦', logo: '' },
      { name: '爱仕唯', initial: '爱', logo: '' },
      { name: '古瑞瓦特', initial: '古', logo: '' }
    ]
  },

  onShow() {
    const app = getAppSafe()
    // 优先使用全局数据，其次使用本地缓存
    let phone = app.globalData?.contactPhone
    if (!phone) {
      phone = wx.getStorageSync('contactPhone')
    }
    let company = app.globalData?.companyName
    if (!company) {
      company = wx.getStorageSync('companyName')
    }
    this.setData({
      contactPhone: phone || '请联系管理员',
      companyName: company || '安徽中浩能源电力有限公司'
    })
  },

  onCallPhone() {
    vibrate()
    const phone = this.data.contactPhone
    if (!phone || phone === '请联系管理员') return
    wx.makePhoneCall({ phoneNumber: phone })
  },

  onShareAppMessage() {
    return {
      title: this.data.companyName || '安徽中浩能源电力有限公司',
      path: '/pages/library/library'
    }
  }
})
