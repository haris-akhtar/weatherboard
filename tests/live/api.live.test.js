/**
 * Live integration checks — one real request per endpoint, no fixtures.
 * Run with `npm run test:live` after putting keys in .env.local.
 * Not part of `npm test`: they need the network and spend free-tier quota.
 */
import { describe, expect, it } from 'vitest'
import { hasGeoDbKey, searchGeoDb } from '../../src/services/cities/geodb.js'
import { searchCities } from '../../src/services/cities/index.js'
import { searchOpenMeteoCities } from '../../src/services/cities/openMeteoGeocoding.js'
import { getWeather } from '../../src/services/weather/index.js'
import { fetchOpenMeteo } from '../../src/services/weather/openMeteo.js'
import { fetchOpenWeather, hasOpenWeatherKey } from '../../src/services/weather/openWeatherMap.js'

const KARACHI = { id: '24.86,67.01', name: 'Karachi', lat: 24.8608, lon: 67.0104 }

function expectValidReport(report, source) {
  expect(report.source).toBe(source)
  const { current, daily } = report
  for (const field of ['temp', 'feelsLike', 'humidity', 'pressure', 'windSpeed']) {
    expect(Number.isFinite(current[field]), `current.${field}`).toBe(true)
  }
  expect(current.temp).toBeGreaterThan(-60)
  expect(current.temp).toBeLessThan(60)
  expect(current.sunrise).toBeLessThan(current.sunset)
  expect(current.condition.label.length).toBeGreaterThan(2)
  expect(daily).toHaveLength(5)
  for (const day of daily) {
    expect(day.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(day.tempMin).toBeLessThanOrEqual(day.tempMax)
  }
  // Five consecutive calendar days.
  const gaps = daily.slice(1).map((day, i) => (Date.parse(day.date) - Date.parse(daily[i].date)) / 86_400_000)
  expect(gaps).toEqual([1, 1, 1, 1])
  console.log(`  ${source}: ${current.temp}°C, ${current.condition.label}, days ${daily[0].date} → ${daily[4].date}`)
}

function expectValidCities(cities) {
  expect(cities.length).toBeGreaterThan(0)
  const karachi = cities.find((city) => city.name === 'Karachi' && city.countryCode === 'PK')
  expect(karachi, 'Karachi, Pakistan in results').toBeTruthy()
  expect(karachi.lat).toBeCloseTo(24.86, 0)
  expect(karachi.lon).toBeCloseTo(67.01, 0)
  expect(karachi.region).toBeTruthy()
  return karachi
}

describe('OpenWeatherMap (needs VITE_OPENWEATHER_API_KEY)', () => {
  it.skipIf(!hasOpenWeatherKey)('returns current weather and a five-day forecast', async () => {
    expectValidReport(await fetchOpenWeather(KARACHI), 'OpenWeatherMap')
  })
  it.skipIf(!hasOpenWeatherKey)('is the source the app actually uses', async () => {
    const report = await getWeather(KARACHI)
    expect(report.source).toBe('OpenWeatherMap')
    expect(report.fallbackFrom).toBeNull()
  })
})

describe('GeoDB Cities (needs VITE_RAPIDAPI_KEY)', () => {
  it.skipIf(!hasGeoDbKey)('autocompletes Karachi', async () => {
    const karachi = expectValidCities(await searchGeoDb('Karachi'))
    console.log(`  GeoDB: ${karachi.name}, ${karachi.region}, ${karachi.country}`)
  })
  it.skipIf(!hasGeoDbKey)('is the source the app actually uses', async () => {
    // GeoDB's free tier allows one request per second.
    await new Promise((resolve) => setTimeout(resolve, 1500))
    const result = await searchCities('Lahore')
    expect(result.source).toBe('GeoDB Cities')
    expect(result.fallbackFrom).toBeNull()
  })
})

describe('Open-Meteo (no key)', () => {
  it('returns current weather and a five-day forecast', async () => {
    expectValidReport(await fetchOpenMeteo(KARACHI), 'Open-Meteo')
  })
  it('geocodes Karachi', async () => {
    expectValidCities(await searchOpenMeteoCities('Karachi'))
  })
})
