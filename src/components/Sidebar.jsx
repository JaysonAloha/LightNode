import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { useStorage } from '../context/StorageContext'

const navConfig = [
  { id: 'home', labelKey: 'nav.home', icon: '⌂' },
  { id: 'notes', labelKey: 'nav.notes', icon: '📚' },
  { id: 'ai', labelKey: 'nav.ai', icon: '💬' },
  { id: 'graph', labelKey: 'nav.graph', icon: '🕸' },
  { id: 'random', labelKey: 'nav.random', icon: '↻' },
]

export function Sidebar({ collapsed, page, onNavigate, onOpenSettings, onOpenAuth, user, onSidebarToggle }) {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { notes } = useStorage()
  const { signOut } = useAuth()
  const useBorderStyle = theme === 'dark' || theme === 'default'
  const useAccentBg = theme === 'cozy'

  return (
    <aside
      className="w-full h-full flex flex-col border-r transition-colors duration-200"
      style={{
        borderColor: 'var(--border-default)',
        backgroundColor: 'var(--bg-sidebar)',
      }}
    >
      <div
        className={`h-16 shrink-0 border-b flex items-center ${collapsed ? 'flex-col justify-center gap-0.5 py-2' : 'justify-between px-3'}`}
        style={{ borderColor: 'var(--border-default)' }}
      >
        {collapsed ? (
          <span
            className="text-sm font-mono font-semibold"
            style={{ color: 'var(--accent)' }}
          >
            L
          </span>
        ) : (
          <h1
            className="text-sm font-mono tracking-wider"
            style={{ color: 'var(--accent)' }}
          >
            LightNode
          </h1>
        )}
        {onSidebarToggle && (
          <button
            onClick={onSidebarToggle}
            className="p-1.5 rounded opacity-70 hover:opacity-100 transition-opacity shrink-0"
            aria-label={t('menu.open')}
            title={collapsed ? t('menu.expand') : t('menu.collapse')}
          >
            <span className="text-sm font-mono">☰</span>
          </button>
        )}
      </div>
      <nav className="flex-1 min-h-0 overflow-y-auto p-2">
        {navConfig.map(({ id, labelKey, icon }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={`
              w-full flex items-center gap-3 px-3 py-2 text-left text-sm
              transition-all duration-150 rounded
              nav-item
              ${page === id ? 'nav-item-active' : ''}
              ${collapsed ? 'justify-center px-2' : ''}
            `}
            style={{
              borderLeft: page === id && useBorderStyle ? '3px solid var(--accent)' : '3px solid transparent',
              color: page === id && useAccentBg ? '#0f0f0f' : 'var(--text-primary)',
              backgroundColor: page === id && useAccentBg ? 'var(--accent)' : 'transparent',
            }}
            title={collapsed ? t(labelKey) : undefined}
          >
            <span className="text-base opacity-80 shrink-0">{icon}</span>
            {!collapsed && <span className="truncate">{t(labelKey)}</span>}
          </button>
        ))}
      </nav>
      <div
        className="shrink-0 border-t space-y-0.5 p-2"
        style={{ borderColor: 'var(--border-default)' }}
      >
        <Link
          to="/ai-studio"
          className={`flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity rounded ${collapsed ? 'justify-center px-2 py-2' : 'px-3 py-2'}`}
          style={{ color: 'var(--text-secondary)' }}
          title={collapsed ? t('nav.aiStudio') : undefined}
        >
          <span>✨</span>
          {!collapsed && <span className="text-xs font-mono">{t('nav.aiStudio')}</span>}
        </Link>
        <Link
          to="/pricing"
          className={`flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity rounded ${collapsed ? 'justify-center px-2 py-2' : 'px-3 py-2'}`}
          style={{ color: 'var(--text-secondary)' }}
          title={collapsed ? t('nav.pricing') : undefined}
        >
          <span>💎</span>
          {!collapsed && <span className="text-xs font-mono">{t('nav.pricing')}</span>}
        </Link>
        {user && (
          <button
            onClick={() => signOut()}
            className={`w-full text-left flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity rounded ${collapsed ? 'justify-center px-2 py-2' : 'px-3 py-2'}`}
            style={{ color: 'var(--text-secondary)' }}
            title={collapsed ? t('common.logout') : undefined}
          >
            {collapsed ? <span>←</span> : <span className="text-xs font-mono">{t('common.logout')}</span>}
          </button>
        )}
      </div>
      {!collapsed && (
        <div
          className="shrink-0 px-3 py-2 text-[10px] font-mono tracking-wider"
          style={{ color: 'var(--text-muted)' }}
        >
          {notes.length > 0
            ? t('sidebar.indexedNotes', { count: notes.length })
            : t('sidebar.localFirstWorkspace')}
        </div>
      )}
    </aside>
  )
}
