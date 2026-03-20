import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

const STORAGE_KEY = 'lightnode-theme'
const VALID_THEMES = ['default', 'cozy', 'dark']

function getInitialTheme() {
  try {
    let saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'code' || saved === 'minimalist') saved = 'dark'
    if (VALID_THEMES.includes(saved)) return saved
  } catch {}
  return 'default'
}

function applyTheme(theme) {
  const value = VALID_THEMES.includes(theme) ? theme : 'default'
  document.documentElement.setAttribute('data-theme', value)
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const setThemeDirect = (nextTheme) => {
    const value = VALID_THEMES.includes(nextTheme) ? nextTheme : 'default'
    setTheme(value)
    applyTheme(value)
    try {
      localStorage.setItem(STORAGE_KEY, value)
    } catch {}
  }

  const toggleTheme = () => {
    setTheme((prev) => {
      const order = ['default', 'cozy', 'dark']
      const idx = order.indexOf(prev)
      const next = order[(idx + 1) % order.length]
      applyTheme(next)
      try {
        localStorage.setItem(STORAGE_KEY, next)
      } catch {}
      return next
    })
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme: setThemeDirect }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
