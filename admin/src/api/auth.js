import request from '@/utils/request'

export const adminLogin = (data) => {
  return request({
    url: '/auth/admin/login',
    method: 'post',
    data
  })
}

export const getUserInfo = () => {
  return request({
    url: '/auth/user/info',
    method: 'get'
  })
}
