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
export function getRelatedArticles(id) {
  return api.get('/api/articles/' + id + '/related')
}
export function likeArticle(id) {
  return api.post('/api/articles/' + id + '/like')
}
export function unlikeArticle(id) {
  return api.delete('/api/articles/' + id + '/like')
}
export function subscribeEmail(email) {
  return api.post('/api/subscribe', { email })
}
export function getCategories() {
  return api.get('/api/categories')
}
export function getTags() {
  return api.get('/api/tags')
}
export function getFriendLinks() {
  return api.get('/api/friend-links')
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
export function getTalks(page = 0, size = 10) {
  return api.get('/api/talks', { params: { page, size } })
}
export function getArchives() {
  return api.get('/api/articles', { params: { page: 0, size: 1000 } })
}
export function getHomeCounts() {
  return api.get('/api/home/counts')
}
export function applyFriendLink(data) {
  return api.post('/api/user/friend-links/apply', data)
}
export function uploadPublicImage(file) {
  const fd = new FormData()
  fd.append('file', file)
  return api.post('/api/upload/image', fd, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
export function getPreviousArticle(id) {
  return api.get('/api/articles/' + id + '/previous')
}
export function getNextArticle(id) {
  return api.get('/api/articles/' + id + '/next')
}
export function searchArticles(q, page = 0, size = 10) {
  return api.get('/api/articles/search', { params: { q, page, size } })
}
export function chatWithAI(message) {
  return api.post('/api/ai/chat', { message })
}
export function getRandomDialogue() {
  return api.get('/api/ai/dialogues/random')
}
