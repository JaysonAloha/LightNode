import { useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useStorage } from '../context/StorageContext'
import { HeroCenterInput } from '../components/HeroCenterInput'
import { NotePreviewCard } from '../components/NotePreviewCard'
import { SectionHeader } from '../components/SectionHeader'
import { EmptyState } from '../components/EmptyState'

export function Home({
  canAddNote,
  onUpgrade,
  onNavigate,
  canUseAI,
}) {
  const { t } = useTranslation()
  const { notes } = useStorage()
  const heroInputRef = useRef(null)
  const recent = notes.slice(0, 6)

  const { allTags, tagCount, thisWeekCount } = useMemo(() => {
    const map = {}
    let weekCount = 0
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    notes.forEach((n) => {
      const ts = new Date(n.created_at || n.createdAt).getTime()
      if (ts >= weekAgo) weekCount++
      const tags = n.tags?.length ? n.tags : (n.content?.match(/(?<!\S)#([^\s#]+)/g) || []).map((m) => (m.startsWith('#') ? m.slice(1) : m))
      tags.forEach((t) => {
        const norm = typeof t === 'string' ? t.replace(/^#/, '') : String(t)
        map[norm] = (map[norm] || 0) + 1
      })
    })
    const tags = Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag]) => tag)
    return { allTags: tags, tagCount: Object.keys(map).length, thisWeekCount: weekCount }
  }, [notes])

  const handleUploadImage = () => {
    if (!canAddNote?.(notes.length)) {
      onUpgrade?.()
      return
    }
    heroInputRef.current?.triggerFileSelect?.()
  }

  const oldNote = useMemo(() => {
    if (notes.length === 0) return null
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    const old = notes.find((n) => new Date(n.created_at || n.createdAt).getTime() < weekAgo)
    return old || notes[notes.length - 1]
  }, [notes])

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero 中心区 */}
      <section className="py-12 sm:py-20 md:py-28">
        <h1
          className="text-2xl sm:text-3xl md:text-4xl font-semibold text-center mb-2 sm:mb-3 tracking-tight px-2"
          style={{
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-sans)',
          }}
        >
          {t('home.title')}
        </h1>
        <p
          className="text-sm sm:text-base text-center mb-8 sm:mb-12 max-w-xl mx-auto px-4"
          style={{ color: 'var(--text-secondary)' }}
        >
          {t('home.subtitle')}
        </p>

        <div className="mb-8">
          <HeroCenterInput ref={heroInputRef} canAddNote={canAddNote} onUpgrade={onUpgrade} />
        </div>

        {/* 快捷操作 */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center gap-2 max-w-md sm:max-w-none mx-auto">
          <QuickActionButton
            label={t('home.newNote')}
            onClick={() => onNavigate?.('notes')}
            icon="+"
          />
          <QuickActionButton
            label={t('home.uploadImage')}
            onClick={handleUploadImage}
            icon="🖼"
          />
          <QuickActionButton
            label={t('home.aiAsk')}
            onClick={() => (canUseAI?.() ? onNavigate?.('ai') : onUpgrade?.('ai'))}
            icon="◆"
          />
          <QuickActionButton
            label={t('home.randomReview')}
            onClick={() => onNavigate?.('random')}
            icon="↻"
          />
        </div>

        {/* 数据统计面板 */}
        <div className="mt-8 grid grid-cols-3 gap-3 max-w-2xl mx-auto">
          <StatCard icon="📚" label={t('home.statsTotal')} value={notes.length} />
          <StatCard icon="↗" label={t('home.statsThisWeek')} value={thisWeekCount} />
          <StatCard icon="#" label={t('home.statsTags')} value={tagCount} />
        </div>
        {allTags.length > 0 && (
          <div className="mt-4 max-w-2xl mx-auto">
            <p className="text-xs opacity-60 mb-2">{t('home.hotTags')}</p>
            <div className="flex flex-wrap gap-2">
              {allTags.slice(0, 5).map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    try { sessionStorage.setItem('lightnode-notes-tag-filter', tag) } catch (_) {}
                    onNavigate?.('notes')
                  }}
                  className="tag-token hover:opacity-100 opacity-90 transition-opacity"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
        {allTags.length === 0 && notes.length > 0 && (
          <p className="mt-4 text-xs opacity-50 text-center">{t('home.noTags')}</p>
        )}
      </section>

      {/* 内容区 */}
      <section className="pt-16 border-t" style={{ borderColor: 'var(--border-default)' }}>
        {/* 最近笔记 */}
        <div className="mb-14">
          <SectionHeader>{t('home.recentNotes')}</SectionHeader>
          {recent.length === 0 ? (
            <EmptyState
              title={t('home.emptyNotes')}
              desc={t('home.emptyHint')}
              action={
                <button
                  onClick={() => onNavigate?.('notes')}
                  className="text-xs font-mono opacity-70 hover:opacity-100"
                  style={{ color: 'var(--accent)' }}
                >
                  {t('home.createFirst')}
                </button>
              }
            />
          ) : (
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
              {recent.map((note) => (
                <NotePreviewCard
                  key={note.id}
                  note={note}
                  onClick={() => onNavigate?.('notes')}
                />
              ))}
            </div>
          )}
        </div>

        {/* 今日回顾 */}
        <div className="mb-14">
          <SectionHeader>{t('home.todayReview')}</SectionHeader>
          <div
            className="p-6 rounded border border-dashed text-center transition-colors duration-200"
            style={{
              borderColor: 'var(--border-default)',
              backgroundColor: 'var(--bg-input)',
            }}
          >
            <p
              className="text-xs font-mono mb-1"
              style={{ color: 'var(--text-muted)' }}
            >
              {t('home.weekAgo')}
            </p>
            {oldNote ? (
              <p
                className="text-sm mb-3 line-clamp-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                {oldNote.content.slice(0, 120)}…
              </p>
            ) : (
              <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
                {t('home.worthReview')}
              </p>
            )}
            <button
              onClick={() => onNavigate?.('random')}
              className="text-xs font-mono opacity-80 hover:opacity-100 transition-opacity"
              style={{ color: 'var(--accent)' }}
            >
              {t('home.startRandom')}
            </button>
          </div>
        </div>

        {/* AI Suggestion */}
        <div className="mb-14">
          <SectionHeader>{t('home.aiSuggestion')}</SectionHeader>
          <div
            className="p-4 rounded border"
            style={{
              borderColor: 'var(--border-default)',
              backgroundColor: 'var(--bg-panel)',
            }}
          >
            {notes.length >= 3 ? (
              <>
                <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                  {t('home.aiSuggestionMany')}
                </p>
                <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                  {t('home.aiSuggestionTagsPrefix')}{allTags.length > 0 ? allTags.slice(0, 5).join(' · ') : t('home.aiSuggestionTagsDefault')}
                </p>
              </>
            ) : (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {t('home.aiSuggestionFew')}
              </p>
            )}
          </div>
        </div>

        {/* 常用标签 */}
        {allTags.length > 0 && (
          <div className="mb-14">
            <SectionHeader>{t('home.commonTags')}</SectionHeader>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    try { sessionStorage.setItem('lightnode-notes-tag-filter', tag) } catch (_) {}
                    onNavigate?.('notes')
                  }}
                  className="tag-token hover:opacity-100 opacity-90 transition-opacity"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

function StatCard({ icon, label, value }) {
  return (
    <div
      className="flex items-center gap-3 p-4 rounded-lg border"
      style={{
        borderColor: 'var(--border-default)',
        backgroundColor: 'var(--bg-panel)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
      }}
    >
      <span className="text-xl opacity-80">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-xs opacity-70 truncate" style={{ color: 'var(--text-secondary)' }}>{label}</p>
        <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{value}</p>
      </div>
    </div>
  )
}

function QuickActionButton({ label, onClick, icon }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 text-xs font-mono border rounded transition-all duration-150 opacity-80 hover:opacity-100"
      style={{
        borderColor: 'var(--border-default)',
        color: 'var(--text-secondary)',
        backgroundColor: 'var(--bg-panel)',
      }}
    >
      <span className="mr-1.5 opacity-70">{icon}</span>
      {label}
    </button>
  )
}
