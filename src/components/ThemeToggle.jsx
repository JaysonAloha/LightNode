import { useTranslation } from 'react-i18next'
import { useTheme } from '../context/ThemeContext'

const THEMES = ['default', 'cozy', 'dark']

export function ThemeToggle() {
  const { t } = useTranslation()
  const { theme, setTheme } = useTheme()

  return (
    <div
      className="flex rounded overflow-hidden border"
      style={{
        borderColor: 'var(--border-default)',
        backgroundColor: 'var(--bg-input)',
      }}
    >
      {THEMES.map((id) => (
        <button
          key={id}
          onClick={() => setTheme(id)}
          className={`
            px-2.5 py-1 text-[11px] font-mono transition-all
            ${theme === id ? 'opacity-100' : 'opacity-60 hover:opacity-80'}
          `}
          style={{
            color: theme === id ? 'var(--accent)' : 'var(--text-secondary)',
            backgroundColor: theme === id ? 'var(--accent-soft-bg)' : 'transparent',
          }}
          title={t('theme.switchNext')}
        >
          {t(`theme.${id}`)}
        </button>
      ))}
    </div>
  )
}
