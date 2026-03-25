import request from '@/utils/request'

// 获取 COS 配置状态
export const getCosConfig = () => {
  return request({ url: '/settings/cos', method: 'get' })
}

// 保存 COS 配置
export const saveCosConfig = (data) => {
  return request({ url: '/settings/cos', method: 'post', data })
}

// 测试 COS 连接
export const testCosConnection = () => {
  return request({ url: '/settings/cos/test', method: 'post' })
}

// 上传 PDF 到 COS（FormData）
export const uploadPdfToCos = (formData, onProgress) => {
  return request({
    url: '/settings/cos/upload-pdf',
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 300000, // 5 分钟超时
    onUploadProgress: onProgress
  })
}
