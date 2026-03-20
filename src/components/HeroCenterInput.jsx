import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useStorage } from '../context/StorageContext'
import { useToast } from '../context/ToastContext'

export function HeroCenterInput({ canAddNote = true, onUpgrade }) {
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
      toast('Captured', 'success')
    } catch (err) {
      toast(err.message || 'Failed', 'error')
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-2 sm:px-0">
      <form onSubmit={handleSubmit} className="relative">
        <div
          className="hero-input flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 sm:py-3.5 border rounded transition-all duration-200"
          style={{
            borderColor: 'var(--border-default)',
            backgroundColor: 'var(--bg-input)',
          }}
        >
          <span
            className="text-base shrink-0"
            style={{ color: 'var(--text-muted)' }}
          >
            ›
          </span>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={t('home.placeholder')}
            className="flex-1 bg-transparent text-base placeholder-opacity-40 focus:outline-none min-w-0"
            style={{
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
            }}
          />
          <span
            className="text-[10px] font-mono shrink-0 hidden sm:inline"
            style={{ color: 'var(--text-muted)' }}
          >
            {t('home.shortcut')}
          </span>
        </div>
      </form>
    </div>
  )
}
