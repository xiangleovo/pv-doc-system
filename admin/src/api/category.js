import request from '@/utils/request'

export const getCategories = () => {
  return request({
    url: '/categories',
    method: 'get'
  })
}

export const getCategoryById = (id) => {
  return request({
    url: `/categories/${id}`,
    method: 'get'
  })
}

export const createCategory = (data) => {
  return request({
    url: '/categories',
    method: 'post',
    data
  })
}

export const updateCategory = (id, data) => {
  return request({
    url: `/categories/${id}`,
    method: 'put',
    data
  })
}

export const deleteCategory = (id) => {
  return request({
    url: `/categories/${id}`,
    method: 'delete'
  })
}
