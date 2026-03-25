import request from '@/utils/request'

export const getDocuments = (params) => {
  return request({
    url: '/documents',
    method: 'get',
    params
  })
}

export const getDocumentById = (id) => {
  return request({
    url: `/documents/${id}`,
    method: 'get'
  })
}

export const createDocument = (data) => {
  return request({
    url: '/documents',
    method: 'post',
    data
  })
}

export const updateDocument = (id, data) => {
  return request({
    url: `/documents/${id}`,
    method: 'put',
    data
  })
}

export const deleteDocument = (id) => {
  return request({
    url: `/documents/${id}`,
    method: 'delete'
  })
}
