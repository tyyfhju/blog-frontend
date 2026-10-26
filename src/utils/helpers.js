/**
 * 清除 HTML 标签和 Markdown 标记，提取纯文本
 * @param {string} html - 原始内容
 * @param {number} maxLength - 截取长度，0 表示不截取
 */
export function cleanHtml(html, maxLength = 0) {
  if (!html) return ''
  let text = html
    .replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/[#*`>|]/g, '')
    .replace(/\n{2,}/g, ' ')
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
