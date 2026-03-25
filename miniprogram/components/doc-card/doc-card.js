Component({
  properties: {
    item: {
      type: Object,
      value: {}
    },
    // 是否显示 panelType 标签（library 场景）
    showPanel: {
      type: Boolean,
      value: true
    },
    // 是否显示 description 副标题（favorite 场景）
    showDesc: {
      type: Boolean,
      value: false
    }
  },

  methods: {
    onTap() {
      const id = this.properties.item && this.properties.item.id
      this.triggerEvent('tap', { id })
    }
  }
})
