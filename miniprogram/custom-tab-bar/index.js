Component({
  data: {
    selected: 0,
    list: [
      { pagePath: 'pages/filter/filter', text: '资料库' },
      { pagePath: 'pages/mine/mine', text: '我的' }
    ]
  },

  methods: {
    onTabTap(e) {
      const index = +e.currentTarget.dataset.index
      const path  = e.currentTarget.dataset.path

      const pages = getCurrentPages()
      const currentRoute = pages[pages.length - 1]?.route

      if (currentRoute === path) {
        this.setData({ selected: index })
        const now = Date.now()
        if (now - (this._lastTapTime || 0) < 300 && this._lastTapPath === path) {
          this._lastTapTime = 0
          const page = pages[pages.length - 1]
          if (typeof page.scrollToTop === 'function') {
            page.scrollToTop()
          }
        } else {
          this._lastTapTime = now
          this._lastTapPath = path
        }
        return
      }

      this._lastTapTime = 0
      this.setData({ selected: index })
      wx.switchTab({ url: '/' + path })
    },

    setSelected(index) {
      this.setData({ selected: index })
    }
  }
})
