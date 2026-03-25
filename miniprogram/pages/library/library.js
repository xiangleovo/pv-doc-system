const { request } = require('../../utils/request')
const { formatDate } = require('../../utils/format')
const { showError } = require('../../utils/common')
const {
  PAGE_SIZE,
  REFRESH_DONE_DELAY,
  FADE_ANIMATION_DURATION,
  HORIZONTAL_SCROLL_DEBOUNCE,
  SEARCH_DEBOUNCE_DELAY
} = require('../../utils/constants')

Page({
  data: {
    categories: [],
    brands: [],
    flatCategories: [],
    activeCategoryId: null,
    activeBrandId: null,
    documents: [],
    loading: false,
    loadingMore: false,
    hasMore: true,
    page: 1,
    searchKeyword: '',
    searchFocus: false,
    refreshing: false,
    scrollTop: 0,
    listScrollTop: 0,
    listFading: false,
    pullRefreshDisabled: false,
    currentFilter: {
      category: '',
      brand: ''
    },
    skeletonRowCol: [
      [
        { width: '56rpx', height: '56rpx', borderRadius: '14rpx' },
        { width: '10rpx' },
        { type: 'rect', width: '55%', height: '30rpx', marginTop: '4rpx' },
        { flex: 1 },
        { width: '100rpx', height: '28rpx', borderRadius: '6rpx' }
      ],
      [
        { width: '56rpx', height: '0' },
        { width: '10rpx' },
        { width: '45%', height: '22rpx', marginTop: '10rpx', borderRadius: '4rpx' }
      ],
      [{ width: '100%', height: '12rpx' }],
      [
        { width: '80rpx', height: '26rpx', borderRadius: '6rpx' },
        { width: '8rpx' },
        { width: '64rpx', height: '26rpx', borderRadius: '6rpx' },
        { flex: 1 },
        { width: '60rpx', height: '22rpx', borderRadius: '4rpx' }
      ]
    ],
  },

  onLoad(options) {
    if (options.autoFocus === 'true') {
      this.setData({ searchFocus: true })
    }

    if (options.keyword !== undefined) {
      this.setData({ searchKeyword: options.keyword })
    }

    const app = getApp()
    const filterParams = app.globalData.filterParams

    if (filterParams) {
      this.setData({
        activeCategoryId: filterParams.categoryId,
        activeBrandId: filterParams.brandId,
        currentFilter: {
          category: filterParams.categoryName,
          brand: filterParams.brandName
        }
      })
      app.globalData.filterParams = null
    } else if (options.categoryId || options.brandId) {
      const categoryId = options.categoryId ? parseInt(options.categoryId) : null
      const brandId = options.brandId ? parseInt(options.brandId) : null

      this.setData({
        activeCategoryId: categoryId,
        activeBrandId: brandId,
        currentFilter: {
          category: options.categoryName || '',
          brand: options.brandName || ''
        }
      })
    }

    Promise.all([
      this.loadCategories(),
      this.loadBrands(),
      this.loadDocuments()
    ]).finally(() => { this._loaded = true })
  },

  onReady() {
    wx.nextTick(() => {
      wx.createSelectorQuery().select('.search-wrap').boundingClientRect(r => {
        if (r) this.setData({ scrollTop: r.height })
      }).exec()
    })
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 })
    }

    if (!this._loaded) return

    if (this.cachedDocuments) {
      this.setData({ documents: this.cachedDocuments })
    } else {
      this.loadDocuments()
    }
  },

  onUnload() {
    clearTimeout(this._searchTimer)
    clearTimeout(this._scrollEndTimer)
  },

  // 横向滚动中：禁用下拉刷新
  onHorizontalScroll() {
    if (!this.data.pullRefreshDisabled) {
      this.setData({ pullRefreshDisabled: true })
    }
    clearTimeout(this._scrollEndTimer)
    this._scrollEndTimer = setTimeout(() => {
      this.setData({ pullRefreshDisabled: false })
    }, HORIZONTAL_SCROLL_DEBOUNCE)
  },

  // 构建文档查询参数
  _buildDocParams(page = 1) {
    const { activeCategoryId, activeBrandId, searchKeyword } = this.data
    const params = { page, pageSize: PAGE_SIZE }
    if (activeCategoryId) params.categoryId = activeCategoryId
    if (activeBrandId) params.brandId = activeBrandId
    if (searchKeyword) params.keyword = searchKeyword
    if (!activeCategoryId && !activeBrandId && !searchKeyword) {
      params.sortBy = 'views'
    } else if (!searchKeyword) {
      params.sortBy = 'title'
    }
    return params
  },

  // 格式化文档列表
  _formatDocs(list = []) {
    return list.map(doc => ({ ...doc, formattedDate: formatDate(doc.createdAt, 'date') }))
  },

  // 加载分类
  async loadCategories() {
    try {
      const res = await request({ url: '/categories' })
      if (res.data?.length > 0) {
        this.setData({
          categories: res.data,
          flatCategories: this.flattenCategories(res.data),
        })
      }
    } catch (e) {
      console.error('加载分类失败:', e)
    }
  },

  // 加载品牌
  async loadBrands() {
    try {
      const res = await request({ url: '/brands' })
      if (res.data?.length > 0) this.setData({ brands: res.data })
    } catch (e) {
      console.error('加载品牌失败:', e)
    }
  },

  // 加载资料列表
  async loadDocuments(loadMore = false, fadeSwitch = false) {
    if (loadMore && (!this.data.hasMore || this.data.loadingMore)) return

    const page = loadMore ? this.data.page + 1 : 1

    try {
      if (loadMore) {
        this.setData({ loadingMore: true })
      } else if (fadeSwitch && this.data.documents.length > 0) {
        this.setData({ listFading: true, listScrollTop: 0 })
        await new Promise(r => setTimeout(r, FADE_ANIMATION_DURATION))
        this.setData({ loading: true, page: 1, hasMore: true })
      } else {
        this.setData({ loading: true, page: 1, hasMore: true })
      }

      const res = await request({ url: '/documents', data: this._buildDocParams(page) })
      const list = res.data.list || []
      const formatted = this._formatDocs(list)
      const hasMore = list.length >= PAGE_SIZE

      if (loadMore) {
        const documents = [...this.data.documents, ...formatted]
        this.cachedDocuments = documents
        this.setData({ documents, page, hasMore })
      } else {
        this.cachedDocuments = formatted
        this.setData({ documents: formatted, page: 1, hasMore })
        if (fadeSwitch) {
          wx.nextTick(() => this.setData({ listFading: false }))
        }
      }
    } catch {
      showError('加载失败')
      if (fadeSwitch) this.setData({ listFading: false })
    } finally {
      this.setData({ loading: false, loadingMore: false })
    }
  },

  // 双击底部 tab 回到顶部
  scrollToTop() {
    const comp = this.selectComponent('.pull-refresh')
    if (comp && typeof comp.scrollToTop === 'function') {
      comp.scrollToTop()
    }
  },

  // 滚动到底部加载更多
  onScrollToLower() {
    if (this.data.hasMore && !this.data.loadingMore) {
      this.loadDocuments(true)
    }
  },

  // 下拉刷新状态变更
  onRefreshChange(e) {
    if (!e.detail.value && this.data.refreshing) {
      this.setData({ refreshing: false })
    }
  },

  // 下拉刷新
  async onRefresh() {
    this.setData({ refreshing: true })

    const [catRes, brandRes, docRes] = await Promise.allSettled([
      request({ url: '/categories' }),
      request({ url: '/brands' }),
      request({ url: '/documents', data: this._buildDocParams(1) }),
    ])

    const patch = {}

    if (catRes.status === 'fulfilled' && catRes.value.data?.length > 0) {
      patch.categories = catRes.value.data
      patch.flatCategories = this.flattenCategories(catRes.value.data)
    }
    if (brandRes.status === 'fulfilled' && brandRes.value.data?.length > 0) {
      patch.brands = brandRes.value.data
    }
    if (docRes.status === 'fulfilled') {
      const list = docRes.value.data.list || []
      const formatted = this._formatDocs(list)
      patch.documents = formatted
      patch.page = 1
      patch.hasMore = list.length >= PAGE_SIZE
      this.cachedDocuments = formatted
    }

    this.setData(patch)
    setTimeout(() => this.setData({ refreshing: false }), REFRESH_DONE_DELAY)
  },

  // 扁平化分类树
  flattenCategories(categories) {
    return categories.map(item => ({
      id: item.id,
      name: item.name,
      icon: item.icon
    }))
  },

  // 搜索输入（防抖）
  onSearchInput(e) {
    const keyword = e.detail.value
    this.setData({ searchKeyword: keyword })
    clearTimeout(this._searchTimer)
    this._searchTimer = setTimeout(() => this.loadDocuments(), SEARCH_DEBOUNCE_DELAY)
  },

  // 点击搜索按钮
  onSearch() {
    clearTimeout(this._searchTimer)
    this._searchTimer = null
    if (!this.data.searchKeyword.trim()) {
      showError('请输入搜索关键词')
      return
    }
    this.setData({ activeCategoryId: null, activeBrandId: null })
    this.loadDocuments()
  },

  // 清除搜索
  clearSearch() {
    this.setData({
      searchKeyword: '',
      activeCategoryId: null,
      activeBrandId: null,
      currentFilter: { category: '', brand: '' }
    })
    this.loadDocuments()
  },

  // 返回筛选页面
  goBackToFilter() {
    wx.navigateBack()
  },

  // 点击品牌
  onBrandTap(e) {
    const id = e.currentTarget.dataset.id
    this.setData({
      activeBrandId: this.data.activeBrandId === id ? null : id,
      searchKeyword: ''
    })
    this.loadDocuments(false, true)
  },

  // 点击分类
  onCategoryTap(e) {
    const id = e.currentTarget.dataset.id
    this.setData({
      activeCategoryId: this.data.activeCategoryId === id ? null : id,
      searchKeyword: ''
    })
    this.loadDocuments(false, true)
  },

  // 点击资料卡片
  onDocumentClick(e) {
    const docId = e.detail && e.detail.id
    if (!docId) return  // 静默忽略无效点击

    if (wx.vibrateShort) wx.vibrateShort({ type: 'light' })
    wx.navigateTo({ url: `/pages/detail/detail?id=${docId}` })
  },
})
