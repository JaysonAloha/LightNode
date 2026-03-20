import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import { useStorage } from '../context/StorageContext'
import { useTheme } from '../context/ThemeContext'

export function NoteCard({ note, compact = false, onSelect }) {
  const { t } = useTranslation()
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState(note.content)
  const { updateNote, deleteNote } = useStorage()
  const { theme } = useTheme()
  const isCozy = theme === 'cozy'

  const handleSave = () => {
    const trimmed = editContent.trim()
    if (trimmed !== note.content) {
      updateNote(note.id, { content: trimmed })
    }
    setEditing(false)
  }

  const locale = typeof navigator !== 'undefined' ? navigator.language : 'zh-CN'
  const date = new Date(note.created_at || note.createdAt).toLocaleString(locale.startsWith('zh') ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const cardClass = [
    'p-4 border overflow-hidden transition-all duration-150',
    isCozy ? 'rounded-2xl glass' : 'rounded card-panel',
  ].filter(Boolean).join(' ')

  if (compact) {
    return (
      <div
        className={`${cardClass} cursor-pointer hover:opacity-90 transition-all duration-150`}
        style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-panel)' }}
        onClick={() => onSelect?.(note)}
      >
        <p className="text-sm line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
          {(note.title ? note.title + ' · ' : '') + (note.content || '').slice(0, 100)}{(note.content || '').length > 100 ? '...' : ''}
        </p>
        <p className="text-xs mt-1 font-mono opacity-60">{date}</p>
      </div>
    )
  }

  if (editing) {
    return (
      <div className={cardClass} style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-panel)' }}>
        <textarea
          value={editContent}
          onChange={e => setEditContent(e.target.value)}
          className="w-full min-h-[120px] p-2 bg-transparent resize-none focus:outline-none text-sm"
          style={{ color: 'var(--text-primary)', borderColor: 'var(--border-default)' }}
          autoFocus
        />
        <div className="flex justify-end gap-2 mt-2">
          <button onClick={() => setEditing(false)} className="text-sm opacity-70">{t('common.cancel')}</button>
          <button onClick={handleSave} className="text-sm" style={{ color: 'var(--accent)' }}>{t('common.save')}</button>
        </div>
      </div>
    )
  }

  const snap = note.metadata?.weatherSnapshot
  const loc = note.metadata?.location
  const locStr = typeof loc === 'string' ? loc : loc?.name
  const weatherStr = snap && `${snap.text || snap.condition || ''} ${snap.temperature != null ? snap.temperature + '°C' : ''}`.trim()
  const locationWeatherLine = [locStr, weatherStr].filter(Boolean).join(' · ')

  const tags = note.tags?.length ? note.tags : (note.content || '').match(/(?<!\S)#([^\s#]+)/g)?.map((m) => (m.startsWith('#') ? m.slice(1) : m)) || []

  return (
    <div className={cardClass} style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-panel)' }}>
      <div className="flex justify-between items-start gap-2">
        <p className="text-xs font-mono opacity-60">{date}</p>
        <div className="flex gap-2 shrink-0">
          <button onClick={() => setEditing(true)} className="text-xs opacity-60 hover:opacity-100 transition-opacity">{t('noteCard.edit')}</button>
          <button onClick={() => deleteNote(note.id)} className="text-xs opacity-60 hover:opacity-100 text-red-400 transition-opacity">{t('noteCard.delete')}</button>
        </div>
      </div>
      {locationWeatherLine && (
        <p className="text-[10px] font-mono mt-1" style={{ color: 'var(--text-muted)' }}>
          {locationWeatherLine}
        </p>
      )}
      {(note.title || (note.blocks?.some((b) => b.type === 'image') && (note.content || '').trim() === '[图片]')) && (
        <h3 className="mt-2 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          {note.title || note.blocks?.find((b) => b.type === 'image')?.caption || t('notePreview.imageTitle')}
        </h3>
      )}
      {note.blocks?.filter((b) => b.type === 'image').map((b) => (
        <div key={b.id || b.url} className={`rounded overflow-hidden ${note.title ? 'mt-1' : 'mt-2'}`}>
          <img
            src={b.url}
            alt={b.caption || '图片'}
            className="w-full max-h-64 object-contain bg-black/5"
          />
          {b.caption && (
            <p className="text-[10px] font-mono mt-1 opacity-70" style={{ color: 'var(--text-muted)' }}>{b.caption}</p>
          )}
        </div>
      ))}
      {note.content && note.content.trim() !== '[图片]' && (
        <div className={`prose prose-sm max-w-none dark:prose-invert ${(note.title || note.blocks?.length) ? 'mt-1' : 'mt-2'}`} style={{ color: 'var(--text-primary)' }}>
          <ReactMarkdown>{note.content}</ReactMarkdown>
        </div>
      )}
      {tags.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {tags.map((t) => (
            <span key={t} className="tag-token">{t}</span>
          ))}
        </div>
      )}
    </div>
  )
}
