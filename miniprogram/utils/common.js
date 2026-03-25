function getAppSafe() {
  return getApp() || {}
}

function resolveAvatar(avatar, req) {
  if (!avatar) return ''
  if (avatar.startsWith('http')) return avatar

  const app = getAppSafe()
  const globalData = app.globalData || {}
  const baseUrl = globalData.baseUrl || 'https://server.qqe4.com/api'
  const serverRoot = baseUrl.replace(/\/api$/, '')

  if (req && process.env.NODE_ENV !== 'production') {
    const protocol = req.protocol || 'http'
    const host = req.get('host') || 'localhost:3001'
    return `${protocol}://${host}${avatar}`
  }

  return serverRoot + avatar
}

function checkNetwork() {
  return new Promise((resolve) => {
    if (typeof wx.getNetworkType === 'function') {
      wx.getNetworkType({
        success(res) {
          resolve(res.networkType !== 'none')
        },
        fail() {
          resolve(false)
        }
      })
    } else {
      resolve(true)
    }
  })
}

function showLoading(title = '加载中...') {
  if (typeof wx.showLoading === 'function') {
    wx.showLoading({ title, mask: true })
  }
}

function hideLoading() {
  if (typeof wx.hideLoading === 'function') {
    wx.hideLoading()
  }
}

function showSuccess(title = '成功') {
  if (typeof wx.showToast === 'function') {
    wx.showToast({ title, icon: 'success' })
  }
}

function showError(title = '操作失败') {
  if (typeof wx.showToast === 'function') {
    wx.showToast({ title, icon: 'none' })
  }
}

function vibrate(type = 'light') {
  if (typeof wx.vibrateShort === 'function') {
    wx.vibrateShort({ type })
  }
}

module.exports = {
  getAppSafe,
  resolveAvatar,
  checkNetwork,
  showLoading,
  hideLoading,
  showSuccess,
  showError,
  vibrate
}
