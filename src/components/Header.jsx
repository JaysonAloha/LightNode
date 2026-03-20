import { useTranslation } from 'react-i18next'
import { ThemeToggle } from './ThemeToggle'
import { LanguageToggle } from './LanguageToggle'
import { ExportButton } from './ExportButton'
export function Header({
  page,
  onOpenSettings,
  onOpenAuth,
  user,
  canExport,
  onUpgrade,
}) {
  const { t } = useTranslation()

  return (
    <header
      className="h-16 shrink-0 flex items-center justify-end gap-2 sm:gap-3 px-3 sm:px-4 md:px-6 border-b transition-colors duration-200"
      style={{
        borderColor: 'var(--border-default)',
        backgroundColor: 'var(--bg-sidebar)',
      }}
    >
      <div className="flex-1 min-w-0" />
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        <LanguageToggle />
        <ThemeToggle />
        {user ? (
          <span
            className="text-xs font-mono truncate max-w-[80px] sm:max-w-[120px] py-1.5"
            style={{ color: 'var(--text-muted)', lineHeight: '1.25rem' }}
          >
            {user.email}
          </span>
        ) : (
          <button onClick={onOpenAuth} className="header-action">
            {t('common.login')}
          </button>
        )}
        <ExportButton canExport={canExport} onUpgrade={onUpgrade} />
        <button onClick={onOpenSettings} className="header-action">
          {t('common.settings')}
        </button>
      </div>
    </header>
  )
}
