import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import i18n from 'i18next'
import { normalizeUiConfig, mergeUiConfig } from '../utils/uiConfigNormalizer'
import { DEFAULT_UI_CONFIG } from '../types/ui-config'

const STORAGE_KEY = 'lightnode-ui-preferences'
const PRESETS_KEY = 'lightnode-ui-presets'
const HISTORY_KEY = 'lightnode-ui-history'
const HISTORY_MAX = 5

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

const UiPreferencesContext = createContext(null)

export function UiPreferencesProvider({ children }) {
  const [config, setConfig] = useState(() => {
    const saved = loadFromStorage(STORAGE_KEY, null)
    return saved ? normalizeUiConfig(saved) : { ...DEFAULT_UI_CONFIG }
  })

  const [presets, setPresets] = useState(() =>
    loadFromStorage(PRESETS_KEY, [])
  )

  const [history, setHistory] = useState(() =>
    loadFromStorage(HISTORY_KEY, [])
  )

  const applyConfig = useCallback((patch, options = {}) => {
    const { saveToHistory = true, persist = true } = options
    const prev = { ...config }
    const next = mergeUiConfig(config, patch)

    setConfig(next)

    if (saveToHistory) {
      setHistory((h) => {
        const nextHistory = [{ config: prev, ts: Date.now() }, ...h].slice(
          0,
          HISTORY_MAX
        )
        saveToStorage(HISTORY_KEY, nextHistory)
        return nextHistory
      })
    }

    if (persist) {
      saveToStorage(STORAGE_KEY, next)
    }

    return next
  }, [config])

  const undo = useCallback(() => {
    if (history.length === 0) return null
    const [last, ...rest] = history
    setConfig(last.config)
    setHistory(rest)
    saveToStorage(HISTORY_KEY, rest)
    saveToStorage(STORAGE_KEY, last.config)
    return last.config
  }, [history])

  const restoreFromHistory = useCallback((index) => {
    if (index < 0 || index >= history.length) return null
    const target = history[index]
    setConfig(target.config)
    setHistory(history.slice(index + 1))
    saveToStorage(HISTORY_KEY, history.slice(index + 1))
    saveToStorage(STORAGE_KEY, target.config)
    return target.config
  }, [history])

  const resetToDefault = useCallback(() => {
    setConfig({ ...DEFAULT_UI_CONFIG })
    setHistory([])
    saveToStorage(STORAGE_KEY, DEFAULT_UI_CONFIG)
    saveToStorage(HISTORY_KEY, [])
    return DEFAULT_UI_CONFIG
  }, [])

  const savePreset = useCallback((name) => {
    const preset = {
      id: crypto.randomUUID(),
      name: name || i18n.t('preset.defaultName', { n: presets.length + 1 }),
      config: { ...config },
      createdAt: new Date().toISOString(),
    }
    setPresets((p) => {
      const next = [...p, preset]
      saveToStorage(PRESETS_KEY, next)
      return next
    })
    return preset
  }, [config, presets.length])

  const loadPreset = useCallback((presetId) => {
    const preset = presets.find((p) => p.id === presetId)
    if (!preset) return null
    setConfig(normalizeUiConfig(preset.config))
    saveToStorage(STORAGE_KEY, preset.config)
    return preset.config
  }, [presets])

  const deletePreset = useCallback((presetId) => {
    setPresets((p) => {
      const next = p.filter((x) => x.id !== presetId)
      saveToStorage(PRESETS_KEY, next)
      return next
    })
  }, [])

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-accent', config.accentColor || 'amber')
    root.setAttribute('data-radius', config.borderRadius || 'soft')
  }, [config.accentColor, config.borderRadius])

  return (
    <UiPreferencesContext.Provider
      value={{
        config,
        presets,
        history,
        applyConfig,
        undo,
        restoreFromHistory,
        resetToDefault,
        savePreset,
        loadPreset,
        deletePreset,
      }}
    >
      {children}
    </UiPreferencesContext.Provider>
  )
}

export function useUiPreferences() {
  const ctx = useContext(UiPreferencesContext)
  if (!ctx) throw new Error('useUiPreferences must be used within UiPreferencesProvider')
  return ctx
}
