import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudMoon, CloudRain, CloudSnow, CloudSun, Moon, Sun } from 'lucide-react'

// One icon family (Lucide) for every provider, keyed by normalized condition kind.
const ICONS = {
  clear: { day: Sun, night: Moon, motion: 'wx-spin', nightMotion: '' },
  'partly-cloudy': { day: CloudSun, night: CloudMoon, motion: 'wx-drift' },
  cloudy: { day: Cloud, motion: 'wx-drift' },
  fog: { day: CloudFog, motion: 'wx-drift' },
  drizzle: { day: CloudDrizzle, motion: 'wx-fall' },
  rain: { day: CloudRain, motion: 'wx-fall' },
  snow: { day: CloudSnow, motion: 'wx-fall' },
  thunderstorm: { day: CloudLightning, motion: 'wx-flicker' },
}

/** Decorative by default — always pair it with the condition label as text. */
export function WeatherIcon({ kind, isDay = true, animated = false, className = '' }) {
  const entry = ICONS[kind] ?? ICONS.cloudy
  const Icon = (!isDay && entry.night) || entry.day
  const motion = !isDay && entry.nightMotion !== undefined ? entry.nightMotion : entry.motion
  return (
    <Icon
      aria-hidden="true"
      strokeWidth={1.5}
      className={`${animated ? motion : ''} ${kind === 'clear' && isDay ? 'text-sun' : ''} ${className}`}
    />
  )
}
