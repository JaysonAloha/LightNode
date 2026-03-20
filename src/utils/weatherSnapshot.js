/**
 * 天气快照逻辑：天气应记录"写这条笔记当天的天气快照"，而不是实时天气。
 *
 * 正确逻辑：
 * 1. 新建笔记时，如果开启自动记录位置/天气：获取当前位置、拉取当时天气，写入 note.metadata.weatherSnapshot
 * 2. 笔记保存后：天气作为历史上下文保留，不再自动刷新
 * 3. 编辑笔记时：默认保留原天气数据，不自动刷新
 * 4. 只有用户主动点击"更新上下文"时，才允许重新获取天气
 *
 * @typedef {Object} WeatherSnapshot
 * @property {number} temp
 * @property {string} condition
 * @property {string} recordedAt
 */

export function createWeatherSnapshot(temp, condition) {
  return {
    temp,
    condition,
    recordedAt: new Date().toISOString(),
  }
}

/**
 * 获取天气展示文案，支持多种格式
 */
export function getDisplayWeather(note) {
  const snap = note.metadata?.weatherSnapshot || note.weather
  if (!snap) return null
  if (typeof snap !== 'object') return String(snap)
  const temp = snap.temperature ?? snap.temp
  const text = snap.text || snap.condition || ''
  if (temp != null) return `${text} ${temp}°C`.trim()
  return text || snap.condition || null
}

/**
 * 获取位置展示文案
 */
export function getDisplayLocation(note) {
  const loc = note.metadata?.location ?? note.location
  if (!loc) return null
  return typeof loc === 'string' ? loc : loc?.name || null
}

/**
 * 获取位置 + 天气组合展示，如 "深圳·南山区 · 晴天 24°C"
 */
export function getLocationWeatherLine(note) {
  const loc = getDisplayLocation(note)
  const weather = getDisplayWeather(note)
  const parts = [loc, weather].filter(Boolean)
  return parts.length > 0 ? parts.join(' · ') : null
}
