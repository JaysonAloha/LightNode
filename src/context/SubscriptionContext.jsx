import { createContext, useContext } from 'react'

const LIMITS = {
  free: { notes: 50, ai: false, sync: false, export: false, graph: false, aiStudio: false },
  pro: { notes: Infinity, ai: true, sync: true, export: true, graph: true, aiStudio: false },
  team: { notes: Infinity, ai: true, sync: true, export: true, graph: true, shared: true, aiStudio: false },
  max: { notes: Infinity, ai: true, sync: true, export: true, graph: true, aiStudio: true },
}

const SubscriptionContext = createContext(null)

export function SubscriptionProvider({ children, tier = 'free' }) {
  const override = typeof localStorage !== 'undefined' && localStorage.getItem('lightnode-tier-override')
  const effectiveTier = override || tier
  const limits = LIMITS[effectiveTier] || LIMITS.free

  const canAddNote = (currentCount) => currentCount < limits.notes
  const canUseAI = () => limits.ai
  const canSync = () => limits.sync
  const canExport = () => limits.export
  const canUseGraph = () => limits.graph
  const canUseAIStudio = () => limits.aiStudio

  return (
    <SubscriptionContext.Provider
      value={{
        tier,
        limits,
        canAddNote,
        canUseAI,
        canSync,
        canExport,
        canUseGraph,
        canUseAIStudio,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext)
  if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider')
  return ctx
}
