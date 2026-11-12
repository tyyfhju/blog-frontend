import { Message } from 'element-ui'

let kicked = false

/**
 * 账号在另一台设备登录后，后端返回 401 + SESSION_REPLACED。
 * 这里统一清掉本地登录态，并提示后刷新/回登录页。
 */
export function handleSessionExpired(error, admin = false) {
  const response = error && error.response
  if (!response || response.status !== 401) return false

  const data = response.data || {}
  if (data.code !== 'SESSION_REPLACED') return false

  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('adminToken')

  if (kicked) return true
  kicked = true

  Message.warning(data.message || '账号已在其他设备登录，请重新登录')

  setTimeout(() => {
    if (admin || window.location.pathname.indexOf('/cpanel') === 0) {
      window.location.href = '/secret-login'
    } else {
      window.location.reload()
    }
  }, 800)

  return true
}
