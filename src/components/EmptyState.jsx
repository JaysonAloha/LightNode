export function EmptyState({ title, desc, action }) {
  return (
    <div
      className="p-8 rounded border border-dashed text-center transition-colors duration-200"
      style={{
        borderColor: 'var(--border-default)',
        backgroundColor: 'var(--bg-input)',
      }}
    >
      <p
        className="text-sm font-mono mb-1"
        style={{ color: 'var(--text-primary)' }}
      >
        {title}
      </p>
      <p
        className="text-xs mb-4"
        style={{ color: 'var(--text-muted)' }}
      >
        {desc}
      </p>
      {action}
    </div>
  )
}
