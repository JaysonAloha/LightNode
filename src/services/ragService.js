/**
 * RAG 服务：向量嵌入 + 混合检索 + Reranking + 流式生成
 * Pro 用户：完整链路；Free/游客：Jaccard 模拟 + 生成
 */

import i18n from 'i18next'
import { supabase } from '../lib/supabase'

const EMBEDDING_MODEL = 'text-embedding-3-small'
const EMBEDDING_DIM = 1536

/* ---------- 嵌入 ---------- */

export async function embedText(text) {
  const apiKey = localStorage.getItem('lightnode-api-key')
  const baseUrl = localStorage.getItem('lightnode-api-base') || 'https://api.openai.com/v1'
  if (!apiKey) throw new Error(i18n.t('error.apiKeyRequired'))

  const res = await fetch(`${baseUrl}/embeddings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: text.slice(0, 8000),
    }),
  })
  if (!res.ok) throw new Error(`Embedding 错误: ${res.status}`)
  const json = await res.json()
  return json.data?.[0]?.embedding
}

export async function upsertNoteEmbedding(noteId, embedding) {
  const { error } = await supabase.from('note_embeddings').upsert(
    { note_id: noteId, embedding },
    { onConflict: 'note_id' }
  )
  if (error) throw error
}

/* ---------- 混合检索（Pro） ---------- */

export async function retrieveHybrid(userId, query, topK = 5) {
  const embedding = await embedText(query)
  const { data, error } = await supabase.rpc('search_notes_hybrid', {
    p_user_id: userId,
    p_query: query,
    p_query_embedding: embedding,
    p_limit: topK,
  })
  if (error) throw error
  return data || []
}

/* ---------- 本地 Jaccard 检索（Free/游客） ---------- */

function tokenize(text) {
  return text
    .replace(/[^\w\u4e00-\u9fff\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => t.toLowerCase())
}

function jaccardSimilarity(a, b) {
  const setA = new Set(tokenize(a))
  const setB = new Set(tokenize(b))
  const intersection = [...setA].filter((x) => setB.has(x)).length
  const union = setA.size + setB.size - intersection
  return union === 0 ? 0 : intersection / union
}

export function retrieveLocal(notes, query, topK = 3) {
  if (!notes?.length || !query?.trim()) return []
  const scored = notes.map((n) => ({
    ...n,
    score: jaccardSimilarity(n.content, query),
  }))
  return scored
    .filter((n) => n.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
}

/* ---------- Reranking ---------- */

export async function rerank(query, candidates, topK = 3) {
  const apiKey = localStorage.getItem('lightnode-api-key')
  const baseUrl = localStorage.getItem('lightnode-api-base') || 'https://api.openai.com/v1'
  const model = localStorage.getItem('lightnode-api-model') || 'Qwen3-MAX'
  if (!apiKey || !candidates?.length) return candidates?.slice(0, topK) || []

  const prompt = `你是一个相关性评分助手。对以下每条笔记与用户问题的相关性打分（0-10），只返回 JSON 数组，如 [8,3,7]。

用户问题：${query}

笔记列表：
${candidates.map((c, i) => `[${i}] ${c.content?.slice(0, 200)}...`).join('\n')}

返回格式：[分数1,分数2,...]`

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
    }),
  })
  if (!res.ok) return candidates.slice(0, topK)

  const json = await res.json()
  const content = json.choices?.[0]?.message?.content || '[]'
  let scores
  try {
    const match = content.match(/\[[\s\S]*?\]/)
    scores = match ? JSON.parse(match[0]) : []
  } catch {
    return candidates.slice(0, topK)
  }
  if (!Array.isArray(scores)) return candidates.slice(0, topK)

  const indexed = candidates.map((c, i) => ({ ...c, _score: scores[i] ?? 5 }))
  return indexed
    .sort((a, b) => (b._score ?? 0) - (a._score ?? 0))
    .slice(0, topK)
}

/* ---------- 生成回答 ---------- */

function buildPrompt(query, retrievedNotes) {
  const context = retrievedNotes
    .map((n, i) => `[${i + 1}] ${n.content}`)
    .join('\n\n')
  return `你是一个基于个人知识库的智能助手。请根据以下笔记内容回答用户问题。如果笔记中没有相关信息，请如实说明。

## 相关笔记
${context || '（无相关笔记）'}

## 用户问题
${query}

## 回答要求
- 简洁、有条理
- 可引用笔记编号 [1][2][3]
- 若无法从笔记中回答，请说明并给出建议`
}

export async function generateAnswer(query, retrievedNotes, { onChunk, onDone }) {
  const apiKey = localStorage.getItem('lightnode-api-key')
  const baseUrl = localStorage.getItem('lightnode-api-base') || 'https://api.openai.com/v1'
  const model = localStorage.getItem('lightnode-api-model') || 'Qwen3-MAX'

  if (!apiKey) throw new Error(i18n.t('error.apiKeyRequired'))

  const prompt = buildPrompt(query, retrievedNotes)

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      stream: true,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`API 错误: ${res.status} ${err}`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let full = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const chunk = decoder.decode(value, { stream: true })
    const lines = chunk.split('\n').filter((l) => l.startsWith('data: '))
    for (const line of lines) {
      const data = line.slice(6)
      if (data === '[DONE]') continue
      try {
        const parsed = JSON.parse(data)
        const delta = parsed.choices?.[0]?.delta?.content
        if (delta) {
          full += delta
          onChunk?.(delta)
        }
      } catch (_) {}
    }
  }

  onDone?.(full)
  return full
}
