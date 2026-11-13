import { createContext, useContext, useEffect, useMemo } from 'react'
import { useStoredState } from '../hooks/useStoredState.js'
import { idbSet } from '../utils/idb.js'
import { KEYS } from '../utils/storage.js'

const PreferencesContext = createContext(null)

const systemTheme = () => (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
const THEME_COLOR = { light: '#f4f3ef', dark: '#0e0f12' }

/** Theme and unit preferences: the only state enough components share to justify context. */
export function PreferencesProvider({ children }) {
  // null = follow the system until the user picks explicitly.
  const [storedTheme, setStoredTheme] = useStoredState(KEYS.theme, null)
  const [units, setUnits] = useStoredState(KEYS.units, 'metric', (v) => (v === 'imperial' ? 'imperial' : 'metric'))
  const theme = storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : systemTheme()

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme])
  }, [theme])

  // The service worker reads units from IndexedDB when it builds a notification.
  useEffect(() => {
    idbSet('units', units)
  }, [units])

  const value = useMemo(
    () => ({
      theme,
      toggleTheme: () => setStoredTheme(theme === 'dark' ? 'light' : 'dark'),
      units,
      setUnits,
    }),
    [theme, units, setStoredTheme, setUnits],
  )

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePreferences() {
  const value = useContext(PreferencesContext)
  if (!value) throw new Error('usePreferences must be used inside <PreferencesProvider>')
  return value
}
