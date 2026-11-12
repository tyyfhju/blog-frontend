import axios from 'axios'
import { handleSessionExpired } from './session'

const api = axios.create({
  baseURL: '',
  timeout: 10000
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = 'Bearer ' + token
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    handleSessionExpired(err)
    return Promise.reject(err)
  }
)

export function getComments(articleId) {
  return api.get('/api/comments', { params: { articleId } })
}
export function postComment(data) {
  return api.post('/api/comments', data)
}
