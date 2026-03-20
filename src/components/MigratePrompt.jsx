const LOCAL_STORAGE_KEY = 'lightnode-notes'

function getLocalNotesCount() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr.length : 0
  } catch {
    return 0
  }
}

export function MigratePrompt({ onMigrate, onDismiss }) {
  const localCount = getLocalNotesCount()
  if (localCount === 0) return null

  return (
    <div
      className="mb-4 p-4 border flex items-center justify-between gap-4"
      style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}
    >
      <div>
        <p className="text-sm font-medium">
          检测到 {localCount} 条本地笔记，登录后可一键迁移至云端
        </p>
        <p className="text-xs mt-1 opacity-70">多端同步，永不丢失</p>
      </div>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={onMigrate}
          className="px-3 py-1.5 text-sm"
          style={{ backgroundColor: 'var(--accent)', color: '#0f0f0f' }}
        >
          迁移
        </button>
        <button
          onClick={onDismiss}
          className="px-3 py-1.5 text-sm opacity-70 hover:opacity-100"
        >
          暂不
        </button>
      </div>
    </div>
  )
}
