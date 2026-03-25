/**
 * 全局常量配置
 * 集中管理 Magic Numbers，便于维护和修改
 */

/**
 * 分页配置
 */
const PAGE_SIZE = 20

/**
 * 动画延时配置（ms）
 */
const REFRESH_DONE_DELAY = 150    // 下拉刷新回弹延时
const FADE_ANIMATION_DURATION = 120  // 列表切换淡出淡入时长
const HORIZONTAL_SCROLL_DEBOUNCE = 300  // 横向滚动防误触恢复时间

/**
 * 防抖延时配置（ms）
 */
const SEARCH_DEBOUNCE_DELAY = 500  // 搜索输入防抖

/**
 * Toast 显示时长（ms）
 */
const TOAST_DURATION = 1500

/**
 * 默认头像路径
 */
const DEFAULT_AVATAR = '/images/default-avatar.png'

module.exports = {
  // 分页
  PAGE_SIZE,

  // 动画延时
  REFRESH_DONE_DELAY,
  FADE_ANIMATION_DURATION,
  HORIZONTAL_SCROLL_DEBOUNCE,

  // 防抖延时
  SEARCH_DEBOUNCE_DELAY,

  // Toast
  TOAST_DURATION,

  // 默认值
  DEFAULT_AVATAR
}
