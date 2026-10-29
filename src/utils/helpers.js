/**
 * 清除 HTML 标签和 Markdown 标记，提取纯文本
 * @param {string} html - 原始内容
 * @param {number} maxLength - 截取长度，0 表示不截取
 */
export function cleanHtml(html, maxLength = 0) {
  if (!html) return ''
  let text = html
    .replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, '')
    .replace(/<pre[\s\S]*?<\/pre>/gi, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/~~~[\s\S]*?~~~/g, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/`[^`]*`/g, ' ')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[-+*]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/[*_~]/g, '')
    .replace(/[#>|]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (maxLength > 0) {
    text = text.substring(0, maxLength)
  }
  return text
}

/**
 * 补全 URL 的 https:// 前缀
 */
export function fixUrl(url) {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  return 'https://' + url.replace(/^\/+/, '')
}

/**
 * 解析 JWT payload（仅用于读取前端展示信息，不做签名校验）
 */
export function decodeJwt(token) {
  try {
    const part = String(token || '').split('.')[1]
    if (!part) return {}
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
    const binary = atob(padded)
    const json = decodeURIComponent(
      binary.split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    )
    return JSON.parse(json)
  } catch (e) {
    return {}
  }
}
