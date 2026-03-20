import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export function AIStudioConfigInspector({ config, onApply }) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)
  const [editJson, setEditJson] = useState(JSON.stringify(config, null, 2))

  useEffect(() => {
    setEditJson(JSON.stringify(config, null, 2))
  }, [config])

  const handleApply = () => {
    try {
      const parsed = JSON.parse(editJson)
      onApply?.(parsed)
    } catch (e) {
      alert(t('aiStudio.jsonError'))
    }
  }

  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)' }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-2 text-sm"
        style={{ color: 'var(--text-secondary)' }}
      >
        <span>{t('aiStudio.configEditor')}</span>
        <span>{expanded ? '▼' : '▶'}</span>
      </button>
      {expanded && (
        <div className="p-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <textarea
            value={editJson}
            onChange={(e) => setEditJson(e.target.value)}
            className="w-full h-40 p-3 text-xs font-mono bg-transparent resize-none focus:outline-none"
            style={{
              color: 'var(--text-primary)',
              borderColor: 'var(--border-color)',
              border: '1px solid',
            }}
          />
          <button
            onClick={handleApply}
            className="mt-2 px-3 py-1.5 text-xs"
            style={{ backgroundColor: 'var(--accent)', color: '#0f0f0f' }}
          >
            {t('aiStudio.apply')}
          </button>
        </div>
      )}
    </div>
  )
}
