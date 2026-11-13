import { fetchJson } from '../http.js'
import { conditionFromWmo } from './conditions.js'

export const OPEN_METEO = 'Open-Meteo'

const CURRENT = [
  'temperature_2m', 'relative_humidity_2m', 'apparent_temperature', 'is_day', 'weather_code',
  'pressure_msl', 'wind_speed_10m', 'wind_direction_10m', 'visibility',
].join(',')
const DAILY = [
  'weather_code', 'temperature_2m_max', 'temperature_2m_min', 'wind_speed_10m_max', 'sunrise', 'sunset',
].join(',')

export function normalizeOpenMeteo(data) {
  const utcOffsetSeconds = data.utc_offset_seconds ?? 0
  // With timezone=auto, Open-Meteo returns wall-clock strings in the city's
  // local time ("2026-11-12T06:41"). Convert them back to real instants.
  const toMs = (localIso) => (localIso ? Date.parse(`${localIso}Z`) - utcOffsetSeconds * 1000 : null)

  const { current, daily } = data
  return {
    source: OPEN_METEO,
    utcOffsetSeconds,
    current: {
      observedAt: toMs(current.time),
      temp: current.temperature_2m,
      feelsLike: current.apparent_temperature,
      humidity: current.relative_humidity_2m,
      pressure: current.pressure_msl,
      windSpeed: current.wind_speed_10m,
      windDeg: current.wind_direction_10m ?? null,
      visibility: current.visibility ?? null,
      sunrise: toMs(daily.sunrise?.[0]),
      sunset: toMs(daily.sunset?.[0]),
      isDay: current.is_day !== 0,
      condition: conditionFromWmo(current.weather_code),
    },
    daily: daily.time.map((date, i) => ({
      date,
      tempMin: daily.temperature_2m_min[i],
      tempMax: daily.temperature_2m_max[i],
      windSpeedMax: daily.wind_speed_10m_max[i],
      condition: conditionFromWmo(daily.weather_code[i]),
    })),
  }
}

export async function fetchOpenMeteo(city, { signal } = {}) {
  const params = new URLSearchParams({
    latitude: city.lat,
    longitude: city.lon,
    current: CURRENT,
    daily: DAILY,
    timezone: 'auto',
    forecast_days: '5',
    wind_speed_unit: 'ms', // match OpenWeatherMap's metric units
  })
  const { data, cachedAt } = await fetchJson(`https://api.open-meteo.com/v1/forecast?${params}`, {
    signal,
    provider: OPEN_METEO,
  })
  return { ...normalizeOpenMeteo(data), cachedAt }
}
