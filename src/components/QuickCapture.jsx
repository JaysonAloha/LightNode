import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useStorage } from '../context/StorageContext'
import { useToast } from '../context/ToastContext'

export function QuickCapture({ canAddNote = true, onUpgrade }) {
  const { t } = useTranslation()
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
      toast(t('quickCapture.captured'), 'success')
    } catch (err) {
      toast(err.message || t('quickCapture.addFailed'), 'error')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex-1 max-w-2xl">
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder={t('home.placeholder')}
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
