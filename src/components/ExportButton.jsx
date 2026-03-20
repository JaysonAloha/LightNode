import { useTranslation } from 'react-i18next'
import { useStorage } from '../context/StorageContext'
import { useToast } from '../context/ToastContext'

export function ExportButton({ canExport, onUpgrade }) {
  const { t } = useTranslation()
  const { notes } = useStorage()
  const { toast } = useToast()

  const handleExport = () => {
    if (!canExport?.()) {
      onUpgrade ? onUpgrade() : toast(t('export.upgradeHint'), 'info')
      return
    }
    const content = notes
      .map((n) => `# ${t('export.noteHeader')}\n\n${n.content}\n\n---\n${t('export.createdLabel')}${n.created_at || n.createdAt}\n`)
      .join('\n')
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = t('export.filename', { date: new Date().toISOString().slice(0, 10) })
    a.click()
    URL.revokeObjectURL(url)
    toast(t('export.success'), 'success')
  }

  return (
    <button
      onClick={handleExport}
      className="header-action"
    >
      {t('common.export')}
    </button>
  )
}
