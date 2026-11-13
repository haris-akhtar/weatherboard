import { describe, expect, it } from 'vitest'
import { conditionFromOwm, conditionFromWmo } from '../src/services/weather/conditions.js'
import { normalizeOpenMeteo } from '../src/services/weather/openMeteo.js'
import { aggregateDaily, normalizeOpenWeather } from '../src/services/weather/openWeatherMap.js'

// These are *test fixtures* shaped like each provider's documented response.
// They exercise the normalizers only; the app itself never ships sample data.

const slot = (iso, min, max, wind, id = 800, description = 'clear sky') => ({
  dt: Date.parse(iso) / 1000,
  main: { temp_min: min, temp_max: max },
  wind: { speed: wind },
  weather: [{ id, description }],
})

describe('condition mapping', () => {
  it('maps WMO codes to shared kinds', () => {
    expect(conditionFromWmo(0)).toEqual({ kind: 'clear', label: 'Clear sky' })
    expect(conditionFromWmo(63).kind).toBe('rain')
    expect(conditionFromWmo(95).kind).toBe('thunderstorm')
    expect(conditionFromWmo(1234).kind).toBe('cloudy') // unknown code degrades safely
  })

  it('maps OpenWeatherMap ids to the same kinds and capitalises the label', () => {
    expect(conditionFromOwm(800, 'clear sky')).toEqual({ kind: 'clear', label: 'Clear sky' })
    expect(conditionFromOwm(802, 'scattered clouds').kind).toBe('partly-cloudy')
    expect(conditionFromOwm(804, 'overcast clouds').kind).toBe('cloudy')
    expect(conditionFromOwm(501, 'moderate rain').kind).toBe('rain')
    expect(conditionFromOwm(741, 'fog').kind).toBe('fog')
  })
})

describe('OpenWeatherMap 3-hourly → daily aggregation', () => {
  it('groups slots by the city’s local day, not UTC', () => {
    // Karachi is UTC+5: 20:00 UTC on the 12th is already 01:00 on the 13th there.
    const days = aggregateDaily(
      [slot('2026-11-12T12:00:00Z', 24, 26, 3), slot('2026-11-12T20:00:00Z', 18, 19, 5)],
      5 * 3600,
    )
    expect(days.map((day) => day.date)).toEqual(['2026-11-12', '2026-11-13'])
  })

  it('takes min, max and strongest wind across a day, and the midday condition', () => {
    const [day] = aggregateDaily(
      [
        slot('2026-11-12T03:00:00Z', 9, 11, 2, 500, 'light rain'),
        slot('2026-11-12T12:00:00Z', 15, 18, 7, 800, 'clear sky'),
        slot('2026-11-12T21:00:00Z', 10, 12, 4, 803, 'broken clouds'),
      ],
      0,
    )
    expect(day).toEqual({
      date: '2026-11-12',
      tempMin: 9,
      tempMax: 18,
      windSpeedMax: 7,
      condition: { kind: 'clear', label: 'Clear sky' },
    })
  })

  it('returns at most five days', () => {
    const slots = Array.from({ length: 7 }, (_, i) => slot(`2026-11-${12 + i}T12:00:00Z`, 1, 2, 1))
    expect(aggregateDaily(slots, 0)).toHaveLength(5)
  })

  it('widens today’s range to include the current reading', () => {
    const report = normalizeOpenWeather(
      {
        dt: Date.parse('2026-11-12T09:00:00Z') / 1000,
        timezone: 0,
        main: { temp: 21, feels_like: 20, humidity: 40, pressure: 1012 },
        wind: { speed: 3, deg: 90 },
        visibility: 10000,
        sys: { sunrise: 1, sunset: 2 },
        weather: [{ id: 800, description: 'clear sky', icon: '01n' }],
      },
      { list: [slot('2026-11-12T12:00:00Z', 15, 18, 2)] },
    )
    expect(report.daily[0]).toMatchObject({ tempMin: 15, tempMax: 21 })
    expect(report.current.isDay).toBe(false)
    expect(report.source).toBe('OpenWeatherMap')
  })
})

describe('OpenWeatherMap late-evening edge case', () => {
  it('adds a "today" entry when the forecast already starts tomorrow', () => {
    // 23:30 local: the next 3-hour slot (00:00) belongs to the following day.
    const report = normalizeOpenWeather(
      {
        dt: Date.parse('2026-11-12T23:30:00Z') / 1000,
        timezone: 0,
        main: { temp: 12, feels_like: 11, humidity: 70, pressure: 1010 },
        wind: { speed: 4 },
        weather: [{ id: 500, description: 'light rain', icon: '10n' }],
      },
      { list: Array.from({ length: 6 }, (_, i) => slot(`2026-11-${13 + i}T12:00:00Z`, 5, 15, 2)) },
    )
    expect(report.daily).toHaveLength(5)
    expect(report.daily[0]).toMatchObject({ date: '2026-11-12', tempMin: 12, tempMax: 12, condition: { kind: 'rain' } })
    expect(report.daily[1].date).toBe('2026-11-13')
  })
})

describe('Open-Meteo normalization', () => {
  const payload = {
    utc_offset_seconds: 18000,
    current: {
      time: '2026-11-12T14:00', temperature_2m: 27.4, relative_humidity_2m: 38, apparent_temperature: 28.1,
      is_day: 1, weather_code: 2, pressure_msl: 1014.2, wind_speed_10m: 3.1, wind_direction_10m: 250, visibility: 24140,
    },
    daily: {
      time: ['2026-11-12', '2026-11-13'],
      weather_code: [2, 61],
      temperature_2m_max: [29, 25],
      temperature_2m_min: [17, 16],
      wind_speed_10m_max: [5.2, 6.8],
      sunrise: ['2026-11-12T06:28', '2026-11-13T06:29'],
      sunset: ['2026-11-12T17:05', '2026-11-13T17:04'],
    },
  }

  it('produces the same shape as the OpenWeatherMap normalizer', () => {
    const report = normalizeOpenMeteo(payload)
    expect(report.source).toBe('Open-Meteo')
    expect(report.daily[1]).toEqual({
      date: '2026-11-13', tempMin: 16, tempMax: 25, windSpeedMax: 6.8, condition: { kind: 'rain', label: 'Light rain' },
    })
    expect(Object.keys(report.current).sort()).toEqual(
      ['condition', 'feelsLike', 'humidity', 'isDay', 'observedAt', 'pressure', 'sunrise', 'sunset', 'temp', 'visibility', 'windDeg', 'windSpeed'],
    )
  })

  it('converts local wall-clock strings back to real instants', () => {
    const { current } = normalizeOpenMeteo(payload)
    // 14:00 at UTC+5 is 09:00 UTC.
    expect(new Date(current.observedAt).toISOString()).toBe('2026-11-12T09:00:00.000Z')
    expect(new Date(current.sunrise).toISOString()).toBe('2026-11-12T01:28:00.000Z')
  })
})
