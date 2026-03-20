import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useStorage } from '../context/StorageContext'
import { NoteCard } from '../components/NoteCard'

const DATE_RANGES = [
  { id: 'all', key: 'dateRangeAll' },
  { id: 'today', key: 'dateRangeToday' },
  { id: 'week', key: 'dateRangeWeek' },
  { id: 'month', key: 'dateRangeMonth' },
]

function getNotesInRange(notes, rangeId) {
  if (rangeId === 'all') return notes
  const now = Date.now()
  const day = 24 * 60 * 60 * 1000
  let start
  if (rangeId === 'today') start = now - day
  else if (rangeId === 'week') start = now - 7 * day
  else if (rangeId === 'month') start = now - 30 * day
  else return notes
  const startTs = start
  return notes.filter((n) => new Date(n.created_at || n.createdAt).getTime() >= startTs)
}

function getTags(note) {
  if (note.tags?.length) return note.tags.map((t) => (typeof t === 'string' && t.startsWith('#') ? t.slice(1) : t))
  return (note.content?.match(/(?<!\S)#([^\s#]+)/g) || []).map((m) => (m.startsWith('#') ? m.slice(1) : m))
}

export function AllNotes() {
  const { t } = useTranslation()
  const { notes } = useStorage()
  const [dateRange, setDateRange] = useState('all')
  const [selectedTags, setSelectedTags] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false)

  const allTagsList = useMemo(() => {
    const map = {}
    notes.forEach((n) => {
      getTags(n).forEach((tag) => { map[tag] = (map[tag] || 0) + 1 })
    })
    return Object.entries(map).sort((a, b) => b[1] - a[1]).map(([tag]) => tag)
  }, [notes])

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('lightnode-notes-tag-filter')
      if (stored && allTagsList.includes(stored)) {
        setSelectedTags([stored])
        sessionStorage.removeItem('lightnode-notes-tag-filter')
      }
    } catch (_) {}
  }, [allTagsList])

  const filteredNotes = useMemo(() => {
    let list = getNotesInRange(notes, dateRange)
    if (selectedTags.length > 0) {
      list = list.filter((n) => {
        const noteTags = getTags(n)
        return selectedTags.some((t) => noteTags.includes(t))
      })
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      list = list.filter((n) => {
        const tagsStr = getTags(n).join(' ')
        const content = (n.title || '') + (n.content || '') + ' ' + tagsStr
        return content.toLowerCase().includes(q)
      })
    }
    return list
  }, [notes, dateRange, selectedTags, searchQuery])

  const hasActiveFilters = dateRange !== 'all' || selectedTags.length > 0 || searchQuery.trim()

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const clearFilters = () => {
    setDateRange('all')
    setSelectedTags([])
    setSearchQuery('')
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-2">{t('notes.title')}</h1>
      <p className="text-sm mb-4 opacity-80">{t('notes.count', { count: filteredNotes.length })}</p>

      {/* 筛选栏 */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-3 py-1.5 text-xs border rounded"
          style={{ borderColor: 'var(--border-default)', color: 'var(--text-primary)', backgroundColor: 'var(--bg-input)' }}
        >
          {DATE_RANGES.map((r) => (
            <option key={r.id} value={r.id}>{t(`notes.${r.key}`)}</option>
          ))}
        </select>
        <div className="relative">
          <button
            onClick={() => setTagDropdownOpen((o) => !o)}
            className="px-3 py-1.5 text-xs border rounded flex items-center gap-1"
            style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-panel)' }}
          >
            {t('notes.filterTags')} {selectedTags.length > 0 && `(${selectedTags.length})`}
          </button>
          {tagDropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setTagDropdownOpen(false)} />
              <div
                className="absolute left-0 top-full mt-1 z-20 p-2 rounded border max-h-40 overflow-y-auto flex flex-wrap gap-1 min-w-[120px]"
                style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-panel)' }}
              >
                {allTagsList.length === 0 ? (
                  <span className="text-xs opacity-60">{t('home.noTags')}</span>
                ) : (
                  allTagsList.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`tag-token text-xs ${selectedTags.includes(tag) ? 'ring-1 ring-[var(--accent)]' : ''}`}
                    >
                      {tag}
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('notes.searchPlaceholder')}
          className="px-3 py-1.5 text-xs border rounded flex-1 min-w-[100px] max-w-[180px]"
          style={{ borderColor: 'var(--border-default)', color: 'var(--text-primary)', backgroundColor: 'var(--bg-input)' }}
        />
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-3 py-1.5 text-xs opacity-70 hover:opacity-100"
            style={{ color: 'var(--accent)' }}
          >
            {t('notes.clearFilters')}
          </button>
        )}
      </div>

      <div className="space-y-4">
        {filteredNotes.length === 0 ? (
          <p className="text-sm opacity-60">{t('notes.empty')}</p>
        ) : (
          filteredNotes.map((note) => <NoteCard key={note.id} note={note} />)
        )}
      </div>
    </div>
  )
}
