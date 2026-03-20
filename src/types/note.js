/**
 * Note 数据结构：内容 + 场景 + 媒体 + AI
 *
 * 内容：标题、正文、标签
 * 场景：创建时间、星期、地点、天气、来源
 * 媒体：图片、OCR 文本、图片说明
 * AI：摘要、标签建议、关联笔记、问答来源
 */

/** @typedef {'text'|'image'|'quote'|'metadata'|'ai_summary'} BlockType */

/**
 * @typedef {Object} ImageBlock
 * @property {'image'} type
 * @property {string} id
 * @property {string} url
 * @property {string} [caption]
 * @property {string} [ocrText]
 * @property {string} createdAt
 * @property {number} [width]
 * @property {number} [height]
 */

/**
 * @typedef {Object} MetadataBlock
 * @property {'metadata'} type
 * @property {string} [location]
 * @property {string} [weather]
 * @property {string} [mood]
 */

/**
 * @typedef {Object} AiSummaryBlock
 * @property {'ai_summary'} type
 * @property {string} content
 */

/**
 * @typedef {Object} WeatherSnapshot
 * @property {number} temp
 * @property {string} condition
 * @property {string} recordedAt - 记录当天的天气快照时间
 */

/**
 * @typedef {Object} NoteMetadata
 * @property {string} [summary]
 * @property {boolean} [favorite]
 * @property {string} [layoutType] - standard | split | collage
 * @property {{ name: string, lat?: number, lng?: number }} [location]
 * @property {WeatherSnapshot} [weatherSnapshot] - 写笔记当天的天气快照，不实时更新
 * @property {string} [mood]
 */

/**
 * @typedef {Object} Note
 * @property {string} id
 * @property {string} content - 主文本内容
 * @property {string} created_at
 * @property {string} [createdAt]
 * @property {string} [updated_at]
 * @property {NoteMetadata} [metadata]
 * @property {Array<{type: BlockType, [key: string]: any}>} [blocks]
 */

export const BLOCK_TYPES = ['text', 'image', 'quote', 'metadata', 'ai_summary']
