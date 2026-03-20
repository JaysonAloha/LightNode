export function SectionHeader({ children }) {
  return (
    <h2
      className="text-[11px] font-mono uppercase tracking-widest mb-4"
      style={{ color: 'var(--text-muted)' }}
    >
      {children}
    </h2>
  )
}
