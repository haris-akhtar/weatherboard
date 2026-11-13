import { fetchJson } from '../http.js'
import { dateKey } from '../../utils/time.js'
import { conditionFromOwm } from './conditions.js'

const KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const BASE = 'https://api.openweathermap.org/data/2.5'

export const OPENWEATHERMAP = 'OpenWeatherMap'
export const hasOpenWeatherKey = Boolean(KEY)

/**
 * The free tier has no daily endpoint: /forecast returns 3-hourly slots for
 * five days. We group slots by the city's local calendar day and derive each
 * day's min/max, strongest wind, and the condition of the slot nearest midday.
 * Exported for unit tests.
 */
export function aggregateDaily(slots, utcOffsetSeconds, days = 5) {
  const byDate = new Map()
  for (const slot of slots) {
    const ms = slot.dt * 1000
    const date = dateKey(ms, utcOffsetSeconds)
    const localHour = new Date(ms + utcOffsetSeconds * 1000).getUTCHours()
    const day = byDate.get(date) ?? { date, tempMin: Infinity, tempMax: -Infinity, windSpeedMax: 0, noonGap: Infinity, condition: null }
    day.tempMin = Math.min(day.tempMin, slot.main.temp_min)
    day.tempMax = Math.max(day.tempMax, slot.main.temp_max)
    day.windSpeedMax = Math.max(day.windSpeedMax, slot.wind?.speed ?? 0)
    const gap = Math.abs(localHour - 12)
    if (gap < day.noonGap) {
      day.noonGap = gap
      day.condition = conditionFromOwm(slot.weather?.[0]?.id, slot.weather?.[0]?.description)
    }
    byDate.set(date, day)
  }
  return [...byDate.values()]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, days)
    .map(({ date, tempMin, tempMax, windSpeedMax, condition }) => ({ date, tempMin, tempMax, windSpeedMax, condition }))
}

export function normalizeOpenWeather(current, forecast) {
  const utcOffsetSeconds = current.timezone ?? 0
  const weather = current.weather?.[0] ?? {}
  const condition = conditionFromOwm(weather.id, weather.description)
  let daily = aggregateDaily(forecast.list ?? [], utcOffsetSeconds)

  // The forecast only covers the *rest* of today, so fold the current reading
  // into today's range; otherwise "now" could sit outside today's min/max.
  const todayKey = dateKey(current.dt * 1000, utcOffsetSeconds)
  const today = daily.find((day) => day.date === todayKey)
  if (today) {
    today.tempMin = Math.min(today.tempMin, current.main.temp)
    today.tempMax = Math.max(today.tempMax, current.main.temp)
  } else {
    // Late in the evening the next 3-hour slot already belongs to tomorrow, so
    // the forecast has no entry for today at all. Build one from the current
    // reading rather than letting tomorrow pose as today.
    const now = { date: todayKey, tempMin: current.main.temp, tempMax: current.main.temp, windSpeedMax: current.wind?.speed ?? 0, condition }
    daily = [now, ...daily].slice(0, 5)
  }
  return {
    source: OPENWEATHERMAP,
    utcOffsetSeconds,
    current: {
      observedAt: current.dt * 1000,
      temp: current.main.temp,
      feelsLike: current.main.feels_like,
      humidity: current.main.humidity,
      pressure: current.main.pressure,
      windSpeed: current.wind?.speed ?? 0,
      windDeg: current.wind?.deg ?? null,
      visibility: current.visibility ?? null,
      sunrise: current.sys?.sunrise ? current.sys.sunrise * 1000 : null,
      sunset: current.sys?.sunset ? current.sys.sunset * 1000 : null,
      isDay: weather.icon ? weather.icon.endsWith('d') : true,
      condition,
    },
    daily,
  }
}

export async function fetchOpenWeather(city, { signal } = {}) {
  const params = new URLSearchParams({ lat: city.lat, lon: city.lon, units: 'metric', appid: KEY })
  const options = { signal, provider: OPENWEATHERMAP }
  const [current, forecast] = await Promise.all([
    fetchJson(`${BASE}/weather?${params}`, options),
    fetchJson(`${BASE}/forecast?${params}`, options),
  ])
  const cachedAt = current.cachedAt ?? forecast.cachedAt
  return { ...normalizeOpenWeather(current.data, forecast.data), cachedAt }
}
