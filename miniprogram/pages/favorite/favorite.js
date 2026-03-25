const { request } = require('../../utils/request')
const { formatDate } = require('../../utils/format')
const { showError } = require('../../utils/common')

Page({
  data: {
    documents: [],
    loading: false
  },

  onLoad() {
    this.loadFavorites()
  },

  // 加载收藏列表
  async loadFavorites() {
    try {
      this.setData({ loading: true })
      const res = await request({
        url: '/documents/favorites/list',
        needAuth: true
      })
      this.setData({
        documents: (res.data || []).map(doc => ({
          ...doc,
          formattedDate: formatDate(doc.createdAt, 'date')
        }))
      })
    } catch {
      showError('加载失败，请重试')
    } finally {
      this.setData({ loading: false })
    }
  },

  // 点击资料卡片
  onDocumentClick(e) {
    wx.navigateTo({
      url: `/pages/detail/detail?id=${e.detail.id}`
    })
  },

  // 下拉刷新
  async onPullDownRefresh() {
    try {
      await this.loadFavorites()
    } finally {
      wx.stopPullDownRefresh()
    }
  }
})
