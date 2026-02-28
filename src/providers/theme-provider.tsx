'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

type Theme = 'light' | 'dark'
type ThemeSetting = Theme | 'system'

interface ThemeContextValue {
  theme: Theme
  setting: ThemeSetting
  setSetting: (setting: ThemeSetting) => void
  toggleTheme: () => void
}

const STORAGE_KEY = 'pm_theme_setting'

const ThemeContext = createContext<ThemeContextValue | null>(null)

function resolveTheme(setting: ThemeSetting): Theme {
  if (setting === 'system') {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    return 'light'
  }
  return setting
}

function applyThemeToDocument(theme: Theme) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.dataset.theme = theme
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [setting, setSettingState] = useState<ThemeSetting>(() => {
    if (typeof window === 'undefined') return 'system'
    const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeSetting | null
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored
    }
    return 'system'
  })
  const theme = useMemo(() => resolveTheme(setting), [setting])

  useEffect(() => {
    applyThemeToDocument(theme)
  }, [theme])

  useEffect(() => {
    if (typeof window === 'undefined' || setting !== 'system') return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => applyThemeToDocument(resolveTheme('system'))
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [setting])

  const setSetting = (next: ThemeSetting) => {
    setSettingState(next)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, next)
    }
  }

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setSetting(next)
  }

  return (
    <ThemeContext.Provider value={{ theme, setting, setSetting, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return ctx
}
