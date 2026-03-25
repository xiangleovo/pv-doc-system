/**
 * 格式化日期时间
 * @param {string} dateStr - ISO 8601 格式的日期字符串
 * @param {string} format - 格式类型: 'full', 'date', 'datetime', 'time'
 * @returns {string} 格式化后的日期字符串
 */
function formatDate(dateStr, format = 'datetime') {
  if (!dateStr) return ''

  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  switch (format) {
    case 'full':
      return `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`
    case 'date':
      return `${year}-${month}-${day}`
    case 'datetime':
      return `${year}-${month}-${day} ${hours}:${minutes}`
    case 'time':
      return `${hours}:${minutes}:${seconds}`
    default:
      return `${year}-${month}-${day} ${hours}:${minutes}`
  }
}

module.exports = { formatDate }

