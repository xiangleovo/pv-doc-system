import request from '@/utils/request'

export const getAdmins = () => {
  return request({
    url: '/admins',
    method: 'get'
  })
}

export const getAdminById = (id) => {
  return request({
    url: `/admins/${id}`,
    method: 'get'
  })
}

export const createAdmin = (data) => {
  return request({
    url: '/admins',
    method: 'post',
    data
  })
}

export const updateAdmin = (id, data) => {
  return request({
    url: `/admins/${id}`,
    method: 'put',
    data
  })
}

export const deleteAdmin = (id) => {
  return request({
    url: `/admins/${id}`,
    method: 'delete'
  })
}
