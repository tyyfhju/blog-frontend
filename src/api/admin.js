import axios from 'axios'

const api = axios.create({
  baseURL: '',
  timeout: 15000
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('adminToken')
  if (token) config.headers.Authorization = 'Bearer ' + token
  return config
}, error => Promise.reject(error))

// ---------- 文章管理 ----------
export function listArticles(page = 0, size = 10) {
  return api.get('/api/private/articles', { params: { page, size } })
}
export function getArticle(id) {
  return api.get('/api/private/articles/' + id)
}
export function createArticle(data) {
  return api.post('/api/private/articles', data)
}
export function updateArticle(id, data) {
  return api.put('/api/private/articles/' + id, data)
}
export function deleteArticle(id) {
  return api.delete('/api/private/articles/' + id)
}

// ---------- 分类管理 ----------
export function listCategories() {
  return api.get('/api/private/categories')
}
export function createCategory(data) {
  return api.post('/api/private/categories', data)
}
export function deleteCategory(id) {
  return api.delete('/api/private/categories/' + id)
}

// ---------- 标签管理 ----------
export function listTags() {
  return api.get('/api/private/tags')
}
export function createTag(data) {
  return api.post('/api/private/tags', data)
}
export function deleteTag(id) {
  return api.delete('/api/private/tags/' + id)
}

// ---------- 用户管理 ----------
export function listUsers(page = 0, size = 10) {
  return api.get('/api/private/users', { params: { page, size } })
}
export function updateUser(id, data) {
  return api.put('/api/private/users/' + id, data)
}
export function deleteUser(id) {
  return api.delete('/api/private/users/' + id)
}

// ---------- 图片上传 ----------
export function uploadImage(file) {
  const fd = new FormData()
  fd.append('file', file)
  return api.post('/api/private/upload/image', fd)
}

// ---------- 相册管理 ----------
export function listAlbums() {
  return api.get('/api/private/photos/albums')
}
export function createAlbum(data) {
  return api.post('/api/private/photos/albums', data)
}
export function deleteAlbum(id) {
  return api.delete('/api/private/photos/albums/' + id)
}
export function uploadPhotoApi(formData) {
  return api.post('/api/private/photos/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
export function listPhotosAdmin(params) {
  return api.get('/api/private/photos', { params })
}
export function deletePhoto(id) {
  return api.delete('/api/private/photos/' + id)
}


// ---------- 留言管理 ----------
export function listMessages() {
  return api.get('/api/private/messages')
}
export function deleteMessage(id) {
  return api.delete('/api/private/messages/' + id)
}

// ---------- 评论管理 ----------
export function listComments(page = 0, size = 10) {
  return api.get('/api/private/comments', { params: { page, size } })
}
export function deleteComment(id) {
  return api.delete('/api/private/comments/' + id)
}

// ---------- 仪表盘 ----------
export function getDashboardStats() {
  return api.get('/api/private/dashboard/stats')
}

// ---------- 博客设置 ----------
export function getBlogSetting() {
  return api.get('/api/private/blog-setting')
}
export function updateBlogSetting(data) {
  return api.put('/api/private/blog-setting', data)
}

