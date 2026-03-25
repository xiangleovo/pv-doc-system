import request from '@/utils/request'

export const getBrands = () => {
  return request({
    url: '/brands',
    method: 'get'
  })
}

export const createBrand = (data) => {
  return request({
    url: '/brands',
    method: 'post',
    data
  })
}

export const updateBrand = (id, data) => {
  return request({
    url: `/brands/${id}`,
    method: 'put',
    data
  })
}

export const deleteBrand = (id) => {
  return request({
    url: `/brands/${id}`,
    method: 'delete'
  })
}
