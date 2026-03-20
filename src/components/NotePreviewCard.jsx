import { useTranslation } from 'react-i18next'
import { useTheme } from '../context/ThemeContext'

function getTitle(note) {
  if (note.title) return note.title
  const firstLine = (note.content || '').split('\n')[0]?.trim() || ''
  return firstLine.slice(0, 60) + (firstLine.length > 60 ? '…' : '')
}

function extractSummary(note) {
  if (note.metadata?.summary || note.summary) return note.metadata?.summary || note.summary
  const content = (note.content || '').replace(/#{1,6}\s/g, '').replace(/\n/g, ' ').trim()
  return content.slice(0, 80) + (content.length > 80 ? '…' : '')
}

function hasImageBlock(note) {
  return note.blocks?.some((b) => b.type === 'image') || note.hasImage
}

function getTags(note) {
  if (note.tags && note.tags.length > 0) return note.tags
  const matches = (note.content || '').match(/(?<!\S)#([^\s#]+)/g) || []
  return [...new Set(matches.map((m) => (m.startsWith('#') ? m.slice(1) : m)))]
}

export function NotePreviewCard({ note, onClick }) {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const isCozy = theme === 'cozy'

  const title = getTitle(note)
  const summary = extractSummary(note)
  const tags = getTags(note)
  const showImageIcon = hasImageBlock(note)
  const locale = typeof navigator !== 'undefined' ? navigator.language : 'zh-CN'
  const date = new Date(note.created_at || note.createdAt).toLocaleDateString(locale.startsWith('zh') ? 'zh-CN' : 'en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div
      onClick={onClick}
      className={`
        p-4 cursor-pointer transition-all duration-150 rounded
        card-panel
        ${isCozy ? 'rounded-2xl' : ''}
      `}
      style={{
        borderColor: 'var(--border-default)',
        backgroundColor: 'var(--bg-panel)',
      }}
    >
      <div className="flex justify-between items-start gap-2 mb-1.5">
        <h3
          className="text-sm font-medium line-clamp-1 flex-1 min-w-0"
          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}
        >
          {title || 'Untitled'}
        </h3>
        <div className="flex items-center gap-1 shrink-0">
          {showImageIcon && (
            <span className="text-[10px] opacity-70" title={t('notePreview.hasImage')}>🖼</span>
          )}
          <span
            className="text-[10px] font-mono"
            style={{ color: 'var(--text-muted)' }}
          >
            {date}
          </span>
        </div>
      </div>
      {summary && (
        <p
          className="text-xs line-clamp-2 mb-2"
          style={{ color: 'var(--text-secondary)' }}
        >
          {summary}
        </p>
      )}
      <div className="flex items-center gap-2 flex-wrap">
        {tags.slice(0, 5).map((t) => (
          <span key={t} className="tag-token">
            {t}
          </span>
        ))}
      </div>
      {(() => {
        const snap = note.metadata?.weatherSnapshot
        const loc = note.metadata?.location
        const locStr = typeof loc === 'string' ? loc : loc?.name
        const weatherStr = snap && `${snap.text || snap.condition || ''} ${snap.temperature != null ? snap.temperature + '°C' : ''}`.trim()
        const line = [locStr, weatherStr].filter(Boolean).join(' · ')
        return line ? (
          <p className="mt-2 text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
            {line}
          </p>
        ) : null
      })()}
    </div>
  )
}
