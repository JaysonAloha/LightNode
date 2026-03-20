import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export function AIStudioChatPanel({
  messages,
  onSend,
  loading,
  disabled,
  placeholder,
}) {
  const { t } = useTranslation()
  const [input, setInput] = useState('')
  const listRef = useRef(null)

  useEffect(() => {
    listRef.current?.scrollTo(0, listRef.current.scrollHeight)
  }, [messages])

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || loading || disabled) return
    onSend(trimmed)
    setInput('')
  }

  return (
    <div className="flex flex-col h-full">
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto space-y-4 p-4"
        style={{ color: 'var(--text-primary)' }}
      >
        {messages.length === 0 && (
          <div className="text-sm opacity-60 py-8 text-center">
            {t('aiStudio.emptyHint')}
          </div>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] px-4 py-2.5 rounded-xl ${
                m.role === 'user'
                  ? 'rounded-br-md'
                  : 'rounded-bl-md'
              }`}
              style={{
                backgroundColor:
                  m.role === 'user' ? 'var(--accent)' : 'var(--bg-card)',
                color: m.role === 'user' ? '#0f0f0f' : 'var(--text-primary)',
                border: m.role === 'assistant' ? '1px solid var(--border-color)' : 'none',
              }}
            >
              <p className="text-sm whitespace-pre-wrap">{m.content}</p>
              {m.suggestions?.length > 0 && (
                <ul className="mt-2 text-xs opacity-80 space-y-1">
                  {m.suggestions.map((s, i) => (
                    <li key={i}>• {s}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div
              className="px-4 py-2.5 rounded-xl rounded-bl-md animate-pulse"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
              }}
            >
              <span className="text-sm opacity-70">{t('aiStudio.thinking')}</span>
              <span className="inline-block w-2 h-2 ml-1 rounded-full bg-[var(--accent)] animate-bounce" />
            </div>
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t shrink-0" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder || t('aiStudio.placeholder')}
            disabled={loading || disabled}
            className="flex-1 px-4 py-2.5 bg-transparent border text-sm placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 disabled:opacity-50"
            style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
          />
          <button
            type="submit"
            disabled={loading || disabled || !input.trim()}
            className="px-4 py-2.5 text-sm font-medium disabled:opacity-50"
            style={{ backgroundColor: 'var(--accent)', color: '#0f0f0f' }}
          >
            {t('aiStudio.send')}
          </button>
        </div>
      </form>
    </div>
  )
}
