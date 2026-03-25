const { request } = require('../../utils/request')
const { getAppSafe, showError, vibrate } = require('../../utils/common')

Page({
  data: {
    categories: [],
    flatCategories: [],
    currentCategory: null,
    brands: [],
    filteredBrands: [],
    loading: false
  },

  onLoad() {
    this.loadData()
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setSelected(0)
    }
  },

  // 加载数据
  async loadData() {
    try {
      this.setData({ loading: true })

      const [categoryRes, brandRes] = await Promise.all([
        request({ url: '/categories' }),
        request({ url: '/brands' })
      ])

      const patch = {}

      if (categoryRes.data?.length > 0) {
        patch.categories = categoryRes.data
        patch.flatCategories = this.flattenCategories(categoryRes.data)
        if (!this.data.currentCategory) {
          patch.currentCategory = {
            id: categoryRes.data[0].id,
            name: categoryRes.data[0].name
          }
        }
      }

      if (brandRes.data?.length > 0) {
        patch.brands = brandRes.data
      }

      this.setData(patch)

      wx.nextTick(() => {
        if (this.data.currentCategory) {
          this.filterBrands()
        }
      })

    } catch {
      showError('加载失败，请重试')
    } finally {
      this.setData({ loading: false })
    }
  },

  // 分类点击
  onCategoryTap(e) {
    vibrate()
    const category = e.currentTarget.dataset.category
    this.setData({ currentCategory: category })
    wx.nextTick(() => this.filterBrands())
  },

  // 过滤品牌列表
  filterBrands() {
    const { currentCategory, brands } = this.data

    if (!currentCategory || !brands.length) {
      this.setData({ filteredBrands: [] })
      return
    }

    const filtered = brands.filter(brand => {
      const categoryIds = brand.categoryIds || []
      return categoryIds.includes(currentCategory.id)
    })

    const animatedBrands = filtered.map((brand, index) => ({
      ...brand,
      docCount: brand.categoryDocCounts?.[currentCategory.id] || 0,
      _animationDelay: Math.min(index * 30, 300)
    }))

    this.setData({ filteredBrands: animatedBrands })
  },

  // 品牌点击
  onBrandTap(e) {
    vibrate()
    const brand = e.currentTarget.dataset.brand

    const app = getAppSafe()
    app.globalData.filterParams = {
      categoryId: this.data.currentCategory.id,
      categoryName: this.data.currentCategory.name,
      brandId: brand.id,
      brandName: brand.name
    }

    setTimeout(() => {
      wx.navigateTo({
        url: `/pages/library/library?categoryId=${this.data.currentCategory.id}&categoryName=${encodeURIComponent(this.data.currentCategory.name)}&brandId=${brand.id}&brandName=${encodeURIComponent(brand.name)}`
      })
    }, 150)
  },

  // 扁平化分类
  flattenCategories(categories) {
    return categories.map(item => ({
      id: item.id,
      name: item.name,
      icon: item.icon
    }))
  },

  // 搜索框点击
  onSearchTap() {
    vibrate()
    wx.navigateTo({
      url: '/pages/library/library?autoFocus=true'
    })
  }
})
