import axios from 'axios'

const api = axios.create({
  baseURL: '',
  timeout: 10000
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = 'Bearer ' + token
  return config
})

export function getUserProfile() {
  return api.get('/api/user/profile')
}
export function updateUserProfile(data) {
  return api.put('/api/user/profile', data)
}
export function uploadAvatar(file) {
  const fd = new FormData()
  fd.append('file', file)
  return api.post('/api/user/upload/avatar', fd)
}
