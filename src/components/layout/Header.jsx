import { Download, Moon, Sun } from 'lucide-react'
import { usePreferences } from '../../context/PreferencesContext.jsx'
import { useInstallPrompt } from '../../hooks/useInstallPrompt.js'
import { Button, IconButton } from '../ui/Button.jsx'

function Logo() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className="size-8">
      <rect width="32" height="32" rx="8" className="fill-ink" />
      <circle cx="20.5" cy="12" r="4.5" fill="#f2b544" />
      <path d="M7 22.5h14.5a4 4 0 0 0 0-8 5.5 5.5 0 0 0-10.6-1.4A4.75 4.75 0 0 0 7 22.5Z" className="fill-bg" />
    </svg>
  )
}

function UnitToggle() {
  const { units, setUnits } = usePreferences()
  return (
    <div role="group" aria-label="Temperature unit" className="flex rounded-lg border border-line bg-sunken p-0.5">
      {[
        ['metric', '°C', 'Celsius'],
        ['imperial', '°F', 'Fahrenheit'],
      ].map(([value, label, name]) => (
        <button
          key={value}
          type="button"
          aria-pressed={units === value}
          aria-label={name}
          onClick={() => setUnits(value)}
          className={`tnum h-11 min-w-11 rounded-md px-2.5 text-sm font-medium transition-colors ${
            units === value ? 'bg-surface text-ink shadow-card' : 'text-muted hover:text-ink'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

export function Header() {
  const { theme, toggleTheme } = usePreferences()
  const install = useInstallPrompt()
  return (
    // Wraps rather than overflows: in the narrow desktop sidebar (and on small
    // phones once the Install button appears) the controls drop to a second row.
    <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
      <a href="/" className="flex min-h-11 items-center gap-2.5 rounded-lg" aria-label="WeatherBoard home">
        <Logo />
        <span className="text-[17px] font-semibold tracking-tight">WeatherBoard</span>
      </a>
      <div className="flex items-center gap-1">
        {install.available && (
          <Button variant="ghost" onClick={install.prompt} className="px-3">
            <Download aria-hidden="true" className="size-4" />
            Install
          </Button>
        )}
        <UnitToggle />
        <IconButton label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'} onClick={toggleTheme}>
          {theme === 'dark' ? <Sun aria-hidden="true" className="size-[18px]" /> : <Moon aria-hidden="true" className="size-[18px]" />}
        </IconButton>
      </div>
    </header>
  )
}
