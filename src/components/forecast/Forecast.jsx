import { Wind } from 'lucide-react'
import { useState } from 'react'
import { usePreferences } from '../../context/PreferencesContext.jsx'
import { dateKey, describeDay } from '../../utils/time.js'
import { formatTemp, formatWind, tempColor } from '../../utils/units.js'
import { WeatherIcon } from '../weather/WeatherIcon.jsx'

/**
 * A day's low–high drawn against the whole period's range, so warmer and
 * cooler days are comparable at a glance. Colour encodes real temperature.
 */
function RangeBar({ day, periodMin, periodMax }) {
  const span = Math.max(periodMax - periodMin, 1)
  const left = ((day.tempMin - periodMin) / span) * 100
  const width = Math.max(((day.tempMax - day.tempMin) / span) * 100, 6)
  return (
    <div aria-hidden="true" className="h-1.5 w-full rounded-full bg-sunken">
      <div
        className="h-full rounded-full"
        style={{
          marginLeft: `${Math.min(left, 94)}%`,
          width: `${Math.min(width, 100 - Math.min(left, 94))}%`,
          backgroundImage: `linear-gradient(90deg, ${tempColor(day.tempMin)}, ${tempColor(day.tempMax)})`,
        }}
      />
    </div>
  )
}

function ForecastDay({ day, label, periodMin, periodMax }) {
  const { units } = usePreferences()
  const wind = formatWind(day.windSpeedMax, units)
  const high = formatTemp(day.tempMax, units)
  const low = formatTemp(day.tempMin, units)

  return (
    <li className="bg-surface p-4">
      {/* Mobile: one compact row per day. From sm: a column card. */}
      <div className="grid grid-cols-[4.25rem_1.75rem_minmax(0,1fr)] items-center gap-x-3 sm:block">
        <p>
          <span className="block font-medium">{label.weekday}</span>
          <span className="block text-sm text-muted">{label.dayMonth}</span>
        </p>
        <WeatherIcon kind={day.condition.kind} className="size-7 text-muted sm:my-4 sm:size-8" />
        <div className="min-w-0">
          <p className="hidden truncate text-sm text-muted sm:block" title={day.condition.label}>
            {day.condition.label}
          </p>
          <div className="tnum flex items-center gap-2 sm:mt-2 sm:block">
            <span className="w-9 text-right text-muted sm:hidden">{low}</span>
            <p className="hidden sm:block">
              <span className="text-xl font-medium">{high}</span>
              <span className="ml-1.5 text-muted">{low}</span>
            </p>
            <div className="min-w-0 flex-1 sm:mt-3">
              <RangeBar day={day} periodMin={periodMin} periodMax={periodMax} />
            </div>
            <span className="w-9 font-medium sm:hidden">{high}</span>
          </div>
        </div>
      </div>
      <p className="mt-2 flex items-center gap-1.5 text-sm text-muted sm:mt-3">
        <span className="truncate sm:hidden">{day.condition.label} ·</span>
        <Wind aria-hidden="true" className="size-3.5 shrink-0" />
        <span className="tnum shrink-0">
          <span className="sr-only">Wind up to </span>
          {wind.value} {wind.unit}
        </span>
      </p>
      <p className="sr-only">
        High {high}, low {low}.
      </p>
    </li>
  )
}

export function Forecast({ report }) {
  // Read the clock once per mount; render must stay pure.
  const [now] = useState(Date.now)
  const today = dateKey(now, report.utcOffsetSeconds)
  const periodMin = Math.min(...report.daily.map((day) => day.tempMin))
  const periodMax = Math.max(...report.daily.map((day) => day.tempMax))

  return (
    <section aria-labelledby="forecast-heading" className="animate-rise" style={{ animationDelay: '60ms' }}>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 id="forecast-heading" className="eyebrow">
          {report.daily.length}-day forecast
        </h2>
        <p className="text-sm text-muted">Daily low – high · max wind</p>
      </div>
      <ol className="card grid gap-px overflow-hidden bg-line sm:grid-cols-5">
        {report.daily.map((day) => (
          <ForecastDay key={day.date} day={day} label={describeDay(day.date, today)} periodMin={periodMin} periodMax={periodMax} />
        ))}
      </ol>
    </section>
  )
}
