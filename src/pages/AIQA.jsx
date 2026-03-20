import { useState, useRef } from 'react'
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

const STEPS = {
  idle: null,
  retrieving: '正在从本地知识库检索相关笔记...',
  found: (n) => `找到 ${n} 条相关卡片`,
  reranking: '正在重排序...',
  generating: '正在生成回答...',
  done: null,
}

export function AIQA({ canUseAI, onUpgrade }) {
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
      toast(err.message || '生成失败', 'error')
      setStep('idle')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">AI 智能问答</h1>
      <p className="text-sm mb-6 opacity-80">
        基于知识库的 RAG 问答。输入问题后，系统会先检索相关笔记，再生成回答。
      </p>

      <form onSubmit={handleSubmit} className="mb-6">
        <div
          className="flex flex-col gap-2 p-4 border"
          style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)' }}
        >
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="向知识库提问，例如：我记过哪些关于 React 的笔记？"
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
            {loading ? '处理中...' : '提问'}
          </button>
        </div>
      </form>

      {step && (
        <div className="mb-4 flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          {step === 'retrieving' && <span className="animate-pulse">🔍 {STEPS.retrieving}</span>}
          {step === 'reranking' && <span className="animate-pulse">↻ {STEPS.reranking}</span>}
          {step === 'found' && <span>✓ {STEPS.found(foundCount)}</span>}
          {step === 'generating' && <span className="animate-pulse">✎ {STEPS.generating}</span>}
        </div>
      )}

      {answer && (
        <div ref={answerRef} className="mb-6">
          <h2 className="text-sm font-medium mb-2 opacity-80">回答</h2>
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
          <h2 className="text-sm font-medium mb-2 opacity-80">引用来源</h2>
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
