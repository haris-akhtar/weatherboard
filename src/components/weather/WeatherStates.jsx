import { CloudSun, MapPin, Star, WifiOff } from 'lucide-react'
import { describeError } from '../../utils/errors.js'
import { Button } from '../ui/Button.jsx'
import { Notice } from '../ui/Notice.jsx'

/** First run: no city yet. Says what the app does and what to do next. */
export function EmptyState({ hasFavourites, online }) {
  const Icon = online ? CloudSun : WifiOff
  return (
    <section className="card flex flex-col items-center px-6 py-14 text-center sm:py-20">
      <span className="flex size-14 items-center justify-center rounded-2xl border border-line bg-sunken">
        <Icon aria-hidden="true" strokeWidth={1.5} className="size-7 text-muted" />
      </span>
      <h1 className="mt-5 text-xl font-semibold tracking-tight">
        {online ? 'Where should we look?' : 'You’re offline with nothing saved yet'}
      </h1>
      <p className="mt-1.5 max-w-sm text-muted">
        {online
          ? 'Search for any city to see current conditions and a five-day forecast.'
          : 'Reconnect and search for a city once. After that, its weather stays available offline.'}
      </p>
      <ul className="mt-6 grid gap-2 text-left text-sm text-muted">
        <li className="flex items-center gap-2.5">
          <MapPin aria-hidden="true" className="size-4 text-faint" />
          Type a few letters and pick from the suggestions
        </li>
        <li className="flex items-center gap-2.5">
          <Star aria-hidden="true" className="size-4 text-faint" />
          {hasFavourites ? 'Or jump to one of your favourites' : 'Star up to five cities for one-tap access'}
        </li>
      </ul>
    </section>
  )
}

/** Mirrors the real layout so content doesn't jump when it arrives. */
export function WeatherSkeleton({ city }) {
  return (
    <div role="status" aria-label={`Loading weather for ${city.name}`} className="grid gap-6">
      <div className="card p-5 sm:p-6">
        <div className="skeleton h-3 w-28" />
        <div className="skeleton mt-3 h-7 w-44" />
        <div className="skeleton mt-8 h-20 w-40" />
        <div className="skeleton mt-4 h-4 w-56" />
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {[0, 1, 2, 3, 4, 5].map((tile) => (
            <div key={tile} className="skeleton h-14" />
          ))}
        </div>
      </div>
      <div className="card grid gap-3 p-4 sm:grid-cols-5">
        {[0, 1, 2, 3, 4].map((day) => (
          <div key={day} className="skeleton h-14 sm:h-36" />
        ))}
      </div>
    </div>
  )
}

/** Nothing to show for this city: say why and offer the way out. */
export function WeatherError({ city, error, online, onRetry }) {
  const { title, detail, action } = describeError(error, 'weather')
  return (
    <section className="card p-5 sm:p-6">
      <p className="eyebrow">Current weather</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">{city.name}</h1>
      <Notice
        tone="error"
        title={title}
        className="mt-4"
        action={
          online && (
            <Button onClick={onRetry} className="shrink-0">
              Try again
            </Button>
          )
        }
      >
        <p>{detail}</p>
        <p className="mt-1">{action}</p>
      </Notice>
    </section>
  )
}
