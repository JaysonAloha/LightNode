import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'lightnode-sidebar-collapsed'

function getInitialCollapsed() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved === 'true'
  } catch {}
  return false
}

const SidebarContext = createContext(null)

export function SidebarProvider({ children }) {
  const [collapsed, setCollapsed] = useState(getInitialCollapsed)
  const [mobileOpen, setMobileOpen] = useState(false)

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem(STORAGE_KEY, String(next))
      } catch {}
      return next
    })
  }, [])

  const openMobile = useCallback(() => setMobileOpen(true), [])
  const closeMobile = useCallback(() => setMobileOpen(false), [])
  const toggleMobile = useCallback(() => setMobileOpen((p) => !p), [])

  return (
    <SidebarContext.Provider
      value={{
        collapsed,
        mobileOpen,
        toggleCollapsed,
        openMobile,
        closeMobile,
        toggleMobile,
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const ctx = useContext(SidebarContext)
  if (!ctx) throw new Error('useSidebar must be used within SidebarProvider')
  return ctx
}
