import { useTranslation } from 'react-i18next'
import { useStorage } from '../context/StorageContext'
import { useToast } from '../context/ToastContext'

export function ExportButton({ canExport, onUpgrade }) {
  const { t } = useTranslation()
  const { notes } = useStorage()
  const { toast } = useToast()

  const handleExport = () => {
    if (!canExport?.()) {
      onUpgrade ? onUpgrade() : toast('升级 Pro 解锁数据导出', 'info')
      return
    }
    const content = notes
      .map((n) => `# 笔记\n\n${n.content}\n\n---\n创建时间: ${n.created_at || n.createdAt}\n`)
      .join('\n')
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `轻知笔记导出-${new Date().toISOString().slice(0, 10)}.md`
    a.click()
    URL.revokeObjectURL(url)
    toast('已导出 Markdown', 'success')
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
