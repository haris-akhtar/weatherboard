import { RefreshCw, Star } from 'lucide-react'
import { usePreferences } from '../../context/PreferencesContext.jsx'
import { formatCityTime, formatLocalStamp } from '../../utils/time.js'
import { compassPoint, formatTemp, formatVisibility, formatWind, tempUnitLabel } from '../../utils/units.js'
import { IconButton } from '../ui/Button.jsx'
import { Notice } from '../ui/Notice.jsx'
import { StatusDot } from '../ui/StatusDot.jsx'
import { WeatherIcon } from './WeatherIcon.jsx'

const FALLBACK_REASON = {
  config: 'OpenWeatherMap key not configured',
  'rate-limit': 'OpenWeatherMap is rate-limited',
  auth: 'OpenWeatherMap rejected the API key',
}

/** Where this data came from and how fresh it is — always visible, never implied. */
function SourceStatus({ report, refreshing }) {
  const updated = formatLocalStamp(report.fetchedAt)
  let tone = 'ok'
  let text = `Live · ${report.source} · updated ${updated}`
  if (report.cached) {
    tone = 'idle'
    text = refreshing ? `Saved copy from ${updated} · updating…` : `Saved copy · ${report.source} · ${updated}`
  } else if (report.fallbackFrom) {
    tone = 'warn'
    text = `Live · ${report.source} (fallback: ${FALLBACK_REASON[report.fallbackFrom.kind] ?? 'OpenWeatherMap is unavailable'}) · updated ${updated}`
  }
  return (
    <p className="flex items-start gap-2 text-sm text-muted">
      <span className="mt-1.5">
        <StatusDot tone={tone} pulse={tone === 'ok'} />
      </span>
      <span>{text}</span>
    </p>
  )
}

function Metric({ label, value, unit, detail }) {
  return (
    <div className="bg-surface p-4">
      <dt className="eyebrow">{label}</dt>
      <dd className="mt-1.5">
        <span className="tnum text-xl font-medium text-ink">{value}</span>
        {unit && <span className="ml-1 text-sm text-muted">{unit}</span>}
        {detail && <span className="mt-0.5 block text-sm text-muted">{detail}</span>}
      </dd>
    </div>
  )
}

export function CurrentWeather({ city, report, refreshing, online, isFavourite, favouriteNotice, onToggleFavourite, onRefresh }) {
  const { units } = usePreferences()
  const { current, utcOffsetSeconds } = report
  const today = report.daily[0]
  const wind = formatWind(current.windSpeed, units)
  const visibility = formatVisibility(current.visibility, units)
  const tint = current.condition.kind === 'clear' ? (current.isDay ? 'clear-day' : 'clear-night') : current.condition.kind

  return (
    <section aria-labelledby="current-heading" data-tint={tint} className="card animate-rise overflow-hidden">
      <div className="hero-tint p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="eyebrow">Current weather</p>
            <h1 id="current-heading" className="mt-1 truncate text-2xl font-semibold tracking-tight">
              {city.name}
            </h1>
            <p className="truncate text-muted">{[city.region, city.country].filter(Boolean).join(', ')}</p>
          </div>
          <div className="-mr-2 -mt-2 flex">
            <IconButton
              label={refreshing ? 'Updating weather' : 'Refresh weather'}
              onClick={onRefresh}
              disabled={!online || refreshing}
            >
              <RefreshCw aria-hidden="true" className={`size-[18px] ${refreshing ? 'animate-spin' : ''}`} />
            </IconButton>
            <IconButton
              label={isFavourite ? `Remove ${city.name} from favourites` : `Add ${city.name} to favourites`}
              aria-pressed={isFavourite}
              onClick={onToggleFavourite}
            >
              <Star aria-hidden="true" className={`size-[18px] ${isFavourite ? 'fill-sun text-sun' : ''}`} />
            </IconButton>
          </div>
        </div>

        {favouriteNotice && (
          <Notice tone="warn" className="mt-3">
            {favouriteNotice}
          </Notice>
        )}

        <div className="mt-6 flex items-end justify-between gap-4">
          <div>
            <p className="tnum flex items-start text-7xl font-medium leading-none tracking-tighter sm:text-8xl">
              {formatTemp(current.temp, units).slice(0, -1)}
              <span className="ml-1 mt-1.5 text-2xl font-normal tracking-normal text-muted sm:text-3xl">{tempUnitLabel(units)}</span>
            </p>
            <p className="mt-3 text-lg font-medium">{current.condition.label}</p>
            <p className="tnum text-muted">
              {today
                ? `High ${formatTemp(today.tempMax, units)} · Low ${formatTemp(today.tempMin, units)}`
                : `Feels like ${formatTemp(current.feelsLike, units)}`}
            </p>
          </div>
          <WeatherIcon kind={current.condition.kind} isDay={current.isDay} animated className="size-20 shrink-0 text-muted sm:size-28" />
        </div>

        <div className="mt-5">
          <SourceStatus report={report} refreshing={refreshing} />
        </div>
      </div>

      {/* 1px gaps over a line-coloured background draw the dividers between tiles. */}
      <dl className="grid grid-cols-2 gap-px border-t border-line bg-line sm:grid-cols-3 xl:grid-cols-6">
        <Metric label="Feels like" value={formatTemp(current.feelsLike, units)} />
        <Metric label="Humidity" value={Math.round(current.humidity)} unit="%" />
        <Metric label="Wind" value={wind.value} unit={[wind.unit, compassPoint(current.windDeg)].filter(Boolean).join(' ')} />
        <Metric label="Pressure" value={Math.round(current.pressure)} unit="hPa" />
        <Metric label="Visibility" value={visibility ? visibility.value : '—'} unit={visibility ? visibility.unit : 'not reported'} />
        <Metric
          label="Sunrise"
          value={current.sunrise ? formatCityTime(current.sunrise, utcOffsetSeconds) : '—'}
          detail={current.sunset ? `Sunset ${formatCityTime(current.sunset, utcOffsetSeconds)}` : 'Sunset not reported'}
        />
      </dl>
    </section>
  )
}
