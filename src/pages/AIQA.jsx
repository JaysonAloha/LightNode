import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import { useStorage } from '../context/StorageContext'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { NoteCard } from '../components/NoteCard'
import {
  retrieveLocal,
  retrieveHybrid,
  rerank,
  generateAnswer,
} from '../services/ragService'

export function AIQA({ canUseAI, onUpgrade }) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [step, setStep] = useState('idle')
  const [foundCount, setFoundCount] = useState(0)
  const [answer, setAnswer] = useState('')
  const [sources, setSources] = useState([])
  const [loading, setLoading] = useState(false)
  const answerRef = useRef(null)
  const { notes } = useStorage()
  const { user, isPro } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) return

    setLoading(true)
    setAnswer('')
    setSources([])
    setStep('retrieving')

    try {
      let retrieved = []

      if (user && isPro) {
        retrieved = await retrieveHybrid(user.id, q, 5)
        retrieved = retrieved.map((r) => ({ id: r.note_id, content: r.content, created_at: r.created_at }))
        if (retrieved.length > 3) {
          setStep('reranking')
          await new Promise((r) => setTimeout(r, 300))
          retrieved = await rerank(q, retrieved, 3)
        }
      } else {
        retrieved = retrieveLocal(notes, q, 3)
      }

      setFoundCount(retrieved.length)
      setSources(retrieved)
      setStep('found')
      await new Promise((r) => setTimeout(r, 400))

      setStep('generating')
      await generateAnswer(q, retrieved, {
        onChunk: (chunk) => {
          setAnswer((prev) => prev + chunk)
          answerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
        },
        onDone: () => setStep('done'),
      })
    } catch (err) {
      toast(err.message || t('aiqa.generateFailed'), 'error')
      setStep('idle')
    } finally {
      setLoading(false)
    }
  }

  const stepText = {
    retrieving: t('aiqa.retrieving'),
    reranking: t('aiqa.reranking'),
    found: t('aiqa.found', { n: foundCount }),
    generating: t('aiqa.generating'),
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">{t('aiqa.title')}</h1>
      <p className="text-sm mb-6 opacity-80">
        {t('aiqa.desc')}
      </p>

      <form onSubmit={handleSubmit} className="mb-6">
        <div
          className="flex flex-col gap-2 p-4 border"
          style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)' }}
        >
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('aiqa.placeholder')}
            rows={3}
            disabled={loading}
            className="w-full px-3 py-2 bg-transparent resize-none focus:outline-none text-sm"
            style={{ color: 'var(--text-primary)' }}
          />
          <button
            type="submit"
            disabled={loading}
            className="self-end px-4 py-2 text-sm disabled:opacity-50"
            style={{ backgroundColor: 'var(--accent)', color: '#0f0f0f' }}
          >
            {loading ? t('aiqa.processing') : t('aiqa.submit')}
          </button>
        </div>
      </form>

      {step && (
        <div className="mb-4 flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          {step === 'retrieving' && <span className="animate-pulse">🔍 {stepText.retrieving}</span>}
          {step === 'reranking' && <span className="animate-pulse">↻ {stepText.reranking}</span>}
          {step === 'found' && <span>✓ {stepText.found}</span>}
          {step === 'generating' && <span className="animate-pulse">✎ {stepText.generating}</span>}
        </div>
      )}

      {answer && (
        <div ref={answerRef} className="mb-6">
          <h2 className="text-sm font-medium mb-2 opacity-80">{t('aiqa.answer')}</h2>
          <div
            className="p-4 border prose prose-sm max-w-none dark:prose-invert"
            style={{
              borderColor: 'var(--border-color)',
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-primary)',
            }}
          >
            <ReactMarkdown>{answer}</ReactMarkdown>
          </div>
        </div>
      )}

      {sources.length > 0 && (
        <div>
          <h2 className="text-sm font-medium mb-2 opacity-80">{t('aiqa.sources')}</h2>
          <div className="space-y-3">
            {sources.map((note) => (
              <NoteCard key={note.id} note={note} compact />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
