import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { Sidebar } from './components/Sidebar'
import { Header } from './components/Header'
import { QuickCapture } from './components/QuickCapture'
import { SettingsModal } from './components/SettingsModal'
import { AuthModal } from './components/AuthModal'
import { UpgradeModal } from './components/UpgradeModal'
import { MigratePrompt } from './components/MigratePrompt'
import { Home } from './pages/Home'
import { AllNotes } from './pages/AllNotes'
import { AIQA } from './pages/AIQA'
import { RandomReview } from './pages/RandomReview'
import { KnowledgeGraph } from './pages/KnowledgeGraph'
import { Pricing } from './pages/Pricing'
import { AIStudioPage } from './pages/AIStudioPage'
import { UiPreferencesProvider } from './store/uiPreferencesStore'
import { AuthProvider, useAuth } from './context/AuthContext'
import { SubscriptionProvider, useSubscription } from './context/SubscriptionContext'
import { useSidebar } from './store/sidebarStore'
import * as StorageContext from './context/StorageContext'

const PAGES = {
  home: Home,
  notes: AllNotes,
  ai: AIQA,
  graph: KnowledgeGraph,
  random: RandomReview,
}

function MigratePromptWrapper({ onClose }) {
  const { migrateLocalToCloud } = StorageContext.useStorage()
  const handleMigrate = async () => {
    await migrateLocalToCloud()
    onClose()
  }
  return <MigratePrompt onMigrate={handleMigrate} onDismiss={onClose} />
}

function AppLayout() {
  const [page, setPage] = useState('home')
  const [showSettings, setShowSettings] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [upgradeFeature, setUpgradeFeature] = useState('ai')
  const [showMigrate, setShowMigrate] = useState(true)
  const { user } = useAuth()
  const { canAddNote, canUseAI, canUseGraph, canExport } = useSubscription()
  const { collapsed, mobileOpen, closeMobile, toggleCollapsed, toggleMobile } = useSidebar()

  const PageComponent = PAGES[page]

  const handleNavigate = (id) => {
    if (id === 'ai' && !canUseAI?.()) {
      setUpgradeFeature('ai')
      setShowUpgrade(true)
      return
    }
    if (id === 'graph' && !canUseGraph?.()) {
      setUpgradeFeature('graph')
      setShowUpgrade(true)
      return
    }
    setPage(id)
    closeMobile()
  }

  return (
    <div className="min-h-screen h-screen flex">
      {/* 移动端遮罩 */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 md:hidden transition-opacity duration-200 ${
          mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeMobile}
        aria-hidden="true"
      />
      {/* Sidebar: 桌面端可折叠，移动端为 drawer */}
      <aside
        className={`
          fixed md:relative inset-y-0 left-0 z-50 shrink-0 flex flex-col
          transform transition-all duration-200 ease-out
          md:transform-none
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${collapsed ? 'md:w-14' : 'md:w-52'}
          w-52 h-screen
        `}
      >
        <Sidebar
          collapsed={collapsed}
          page={page}
          onNavigate={handleNavigate}
          onOpenSettings={() => {
            setShowSettings(true)
            closeMobile()
          }}
          onOpenAuth={() => {
            setShowAuth(true)
            closeMobile()
          }}
          user={user}
          onSidebarToggle={() => {
            if (typeof window !== 'undefined' && window.innerWidth < 768) {
              toggleMobile()
            } else {
              toggleCollapsed()
            }
          }}
        />
      </aside>
      <main className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header
          page={page}
          onOpenSettings={() => setShowSettings(true)}
          onOpenAuth={() => setShowAuth(true)}
          user={user}
          canExport={canExport}
          onUpgrade={() => {
            setUpgradeFeature('export')
            setShowUpgrade(true)
          }}
        />
        {page !== 'home' && (
          <div
            className="px-3 sm:px-4 py-2 border-b shrink-0"
            style={{ borderColor: 'var(--border-default)' }}
          >
            <QuickCapture
              canAddNote={canAddNote}
              onUpgrade={() => {
                setUpgradeFeature('sync')
                setShowUpgrade(true)
              }}
            />
          </div>
        )}
        <div className="flex-1 overflow-auto p-3 sm:p-4 md:p-6">
          {user && showMigrate && <MigratePromptWrapper onClose={() => setShowMigrate(false)} />}
          <PageComponent
            onUpgrade={(f) => {
              setUpgradeFeature(f)
              setShowUpgrade(true)
            }}
            canUseAI={canUseAI}
            canUseGraph={canUseGraph}
            onNavigate={handleNavigate}
            canAddNote={canAddNote}
          />
        </div>
      </main>
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} feature={upgradeFeature} />}
    </div>
  )
}

function AIStudioLayout() {
  const { t } = useTranslation()
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside
        className="w-full md:w-52 shrink-0 border-b md:border-b-0 md:border-r p-4 md:p-0"
        style={{
          borderColor: 'var(--border-default)',
          backgroundColor: 'var(--bg-sidebar)',
        }}
      >
        <div className="p-4 border-b md:border-b-0" style={{ borderColor: 'var(--border-default)' }}>
          <Link
            to="/"
            className="text-lg font-semibold"
            style={{ color: 'var(--accent)' }}
          >
            LightNode
          </Link>
        </div>
        <nav className="p-2">
          <Link
            to="/"
            className="block px-3 py-2 text-sm opacity-70 hover:opacity-100"
          >
            {t('aiStudio.backHome')}
          </Link>
          <Link
            to="/pricing"
            className="block px-3 py-2 text-sm opacity-70 hover:opacity-100"
          >
            💎 {t('nav.pricing')}
          </Link>
        </nav>
      </aside>
      <main className="flex-1 flex flex-col min-w-0 p-4 md:p-6 overflow-auto">
        <AIStudioPage />
      </main>
    </div>
  )
}

function AppContent() {
  const { t } = useTranslation()
  const { user, profile, loading } = useAuth()
  const tier = profile?.subscription_tier || 'max'

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ color: 'var(--text-secondary)' }}
      >
        {t('app.loading')}
      </div>
    )
  }

  return (
    <SubscriptionProvider tier={tier}>
      <StorageContext.StorageProvider user={user}>
        <UiPreferencesProvider>
          <Routes>
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/ai-studio" element={<AIStudioLayout />} />
            <Route path="/*" element={<AppLayout />} />
          </Routes>
        </UiPreferencesProvider>
      </StorageContext.StorageProvider>
    </SubscriptionProvider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  )
}
