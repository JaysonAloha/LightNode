/**
 * 从正文中提取 #标签
 * 规则：以 # 开头，紧贴文字（# 后无空格），后面为连续非空格非#字符
 * 排除 Markdown 标题：# 标题（# 后有空格）不识别为标签
 * 使用 (?<!\S)# 确保 # 前为空白或行首
 */
function extractTags(text) {
  if (!text || typeof text !== 'string') return []
  try {
    const matches = text.match(/(?<!\S)#([^\s#]+)/g) || []
    return matches.map((m) => (m.startsWith('#') ? m.slice(1) : m))
  } catch {
    const matches = text.match(/#([^\s#]+)/g) || []
    return matches.map((m) => (m.startsWith('#') ? m.slice(1) : m))
  }
}

export function extractHashtagsFromContent(content) {
  return extractTags(content)
}

/**
 * 合并内容提取的标签与已有标签，去重
 * finalTags = [...new Set([...(note.tags || []), ...extractTags(content)])]
 */
export function mergeTags(contentTags, existingTags = []) {
  const existing = Array.isArray(existingTags) ? existingTags : []
  const merged = [...new Set([...existing, ...contentTags])]
  return merged
}
