import { useState, useRef, useImperativeHandle, forwardRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useStorage } from '../context/StorageContext'
import { useToast } from '../context/ToastContext'

export const HeroCenterInput = forwardRef(function HeroCenterInput({ canAddNote = true, onUpgrade }, ref) {
  const { t } = useTranslation()
  const [value, setValue] = useState('')
  const [pendingImages, setPendingImages] = useState([])
  const fileInputRef = useRef(null)
  const { addNote, notes } = useStorage()
  const { toast } = useToast()

  useImperativeHandle(ref, () => ({
    triggerFileSelect: () => fileInputRef.current?.click(),
  }))

  const handleFileChange = async (e) => {
    const files = e.target.files
    if (!files?.length) return
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast(t('homeToast.selectImage'), 'error')
        continue
      }
      const dataUrl = await new Promise((resolve, reject) => {
        const r = new FileReader()
        r.onload = () => resolve(r.result)
        r.onerror = reject
        r.readAsDataURL(file)
      })
      setPendingImages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), url: dataUrl, caption: file.name },
      ])
    }
    e.target.value = ''
  }

  const removePendingImage = (id) => {
    setPendingImages((prev) => prev.filter((p) => p.id !== id))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmed = value.trim()
    const hasImages = pendingImages.length > 0
    if (!trimmed && !hasImages) return
    if (!canAddNote(notes.length)) {
      onUpgrade?.()
      return
    }
    try {
      const content = trimmed || '[图片]'
      const blocks = hasImages
        ? pendingImages.map((p) => ({
            type: 'image',
            id: p.id,
            url: p.url,
            caption: p.caption,
            createdAt: new Date().toISOString(),
          }))
        : undefined
      await addNote(content, {
        ...(blocks && { blocks, hasImage: true }),
      })
      setValue('')
      setPendingImages([])
      toast(t('quickCapture.captured'), 'success')
    } catch (err) {
      toast(err.message || t('quickCapture.addFailed'), 'error')
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-2 sm:px-0">
      <form onSubmit={handleSubmit} className="relative">
        {pendingImages.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {pendingImages.map((p) => (
              <div
                key={p.id}
                className="relative rounded overflow-hidden border shrink-0"
                style={{
                  width: 64,
                  height: 64,
                  borderColor: 'var(--border-default)',
                }}
              >
                <img
                  src={p.url}
                  alt={p.caption}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePendingImage(p.id)}
                  className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 text-white text-xs flex items-center justify-center hover:bg-black/80"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <div
          className="hero-input flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 sm:py-3.5 border rounded transition-all duration-200"
          style={{
            borderColor: 'var(--border-default)',
            backgroundColor: 'var(--bg-input)',
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
            title={t('home.uploadImage')}
          >
            🖼
          </button>
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
})
