import axios from 'axios'

const api = axios.create({
  baseURL: '',
  timeout: 10000
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = 'Bearer ' + token
  return config
}, error => Promise.reject(error))

export function getCaptcha() {
  return api.get('/api/captcha/generate')
}
export function sendEmailCode(email) {
  return api.post('/api/auth/send-email-code', null, { params: { email } })
}
export function register(data) {
  return api.post('/api/auth/register', data)
}
export function login(data) {
  return api.post('/api/auth/login', data)
}
export function sendForgotPasswordCode(email) {
  return api.post('/api/auth/forgot-password', { email })
}
export function resetPassword(data) {
  return api.post('/api/auth/reset-password', data)
}
