import { validateUiConfig } from '../../utils/uiConfigValidator'
import { mockChat } from './mockAiStudioProvider'
import { buildUserPrompt, buildOutputFormatInstruction, SYSTEM_PROMPT } from './promptBuilders'

function extractJsonFromResponse(text) {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/) || text.match(/\{[\s\S]*\}/)
  if (match) {
    const raw = match[1] || match[0]
    try {
      return JSON.parse(raw)
    } catch {
      try {
        return JSON.parse(raw.replace(/\n/g, ' ').replace(/\s+/g, ' '))
      } catch { /* ignore */ }
    }
  }
  return null
}

function tryParseAiResponse(text) {
  const parsed = extractJsonFromResponse(text)
  if (!parsed) return null

  const result = {
    explanation: parsed.explanation || '配置已生成',
    ui_config: parsed.ui_config || parsed.uiConfig || {},
    optional_suggestions: parsed.optional_suggestions || parsed.optionalSuggestions || [],
  }

  const validated = validateUiConfig(result.ui_config)
  if (Object.keys(validated).length === 0 && Object.keys(result.ui_config).length > 0) {
    return null
  }

  result.ui_config = validated
  return result
}

export async function chatWithAI(userMessage, currentConfig, { onChunk, onDone } = {}) {
  const hasApiKey = !!localStorage.getItem('lightnode-api-key')

  if (!hasApiKey) {
    throw new Error('请先设置api-key')
  }

  const baseUrl = localStorage.getItem('lightnode-api-base') || 'https://api.openai.com/v1'
  const model = localStorage.getItem('lightnode-api-model') || 'Qwen3-MAX'
  const apiKey = localStorage.getItem('lightnode-api-key')

  const userPrompt = buildUserPrompt(userMessage, currentConfig) + buildOutputFormatInstruction()

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
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

  let result = tryParseAiResponse(full)

  if (!result && full.trim()) {
    result = {
      explanation: full.slice(0, 200),
      ui_config: {},
      optional_suggestions: [],
    }
  }

  if (!result) {
    result = await mockChat(userMessage, currentConfig)
  }

  onDone?.(result)
  return result
}
