import axios from 'axios'

const api = axios.create({
  baseURL: '',
  timeout: 15000
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = 'Bearer ' + token
  }
  return config
}, error => Promise.reject(error))

api.interceptors.response.use(
  res => res,
  err => Promise.reject(err)
)

export function getRecommendedArticles() {
  return api.get('/api/articles/recommended')
}
export function getArticles(page = 0, size = 9, categoryId = null, tagId = null) {
  const params = { page, size }
  if (categoryId) params.categoryId = categoryId
  if (tagId) params.tagId = tagId
  return api.get('/api/articles', { params })
}
export function getArticle(id) {
  return api.get('/api/articles/' + id)
}
export function getArticleDetail(id) {
  return api.get('/api/articles/' + id)
}
export function likeArticle(id) {
  return api.post('/api/articles/' + id + '/like')
}
export function unlikeArticle(id) {
  return api.delete('/api/articles/' + id + '/like')
}
export function getCategories() {
  return api.get('/api/categories')
}
export function getMessages() {
  return api.get('/api/messages')
}
export function postMessage(data) {
  return api.post('/api/messages', data)
}
export function getPhotos(params = {}) {
  return api.get('/api/photos', { params })
}
export function getPhotoAlbums() {
  return api.get('/api/photo-albums')
}
export function getBlogSetting() {
  return api.get('/api/blog-setting')
}
export function getArchives() {
  return api.get('/api/articles', { params: { page: 0, size: 1000 } })
}
export function getHomeCounts() {
  return api.get('/api/home/counts')
}
export function searchArticles(q, page = 0, size = 10) {
  return api.get('/api/articles/search', { params: { q, page, size } })
}
