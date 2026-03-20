import { useState } from 'react'
import { useStorage } from '../context/StorageContext'
import { useToast } from '../context/ToastContext'

export function QuickCapture({ canAddNote = true, onUpgrade }) {
  const [value, setValue] = useState('')
  const { addNote, notes } = useStorage()
  const { toast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return
    if (!canAddNote(notes.length)) {
      onUpgrade?.()
      return
    }
    try {
      await addNote(trimmed)
      setValue('')
      toast('已快速收录', 'success')
    } catch (err) {
      toast(err.message || '添加失败', 'error')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex-1 max-w-2xl">
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Quick capture · Paste link · Markdown · Or ask AI…"
        className="w-full px-4 py-2.5 bg-transparent border text-sm font-mono placeholder-opacity-40 focus:outline-none input-glow"
        style={{
          borderColor: 'var(--border-default)',
          backgroundColor: 'var(--bg-input)',
          color: 'var(--text-primary)',
        }}
      />
    </form>
  )
}
