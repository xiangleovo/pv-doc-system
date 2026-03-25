import request from '@/utils/request'

export const getUsers = (params) => {
  return request({
    url: '/users',
    method: 'get',
    params
  })
}

export const getUserById = (id) => {
  return request({
    url: `/users/${id}`,
    method: 'get'
  })
}

export const updateUserStatus = (id, status) => {
  return request({
    url: `/users/${id}/status`,
    method: 'put',
    data: { status }
  })
}
