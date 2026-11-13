import { describe, expect, it } from 'vitest'
import { ApiError, describeError, kindFromStatus } from '../src/utils/errors.js'
import { MAX_FAVOURITES, addFavourite, removeFavourite, sanitizeFavourites } from '../src/utils/favourites.js'
import { isReminderDue } from '../src/utils/reminder.js'
import { dateKey, describeDay } from '../src/utils/time.js'
import { compassPoint, formatTemp, formatVisibility, formatWind } from '../src/utils/units.js'
import { validateCityQuery, validateReminderTime } from '../src/utils/validation.js'

const city = (n) => ({ id: `${n}.00,${n}.00`, name: `City ${n}`, region: '', country: '', countryCode: '', lat: n, lon: n })

describe('favourites', () => {
  it('adds a city', () => {
    const result = addFavourite([], city(1))
    expect(result.ok).toBe(true)
    expect(result.list).toHaveLength(1)
  })

  it('refuses a duplicate', () => {
    expect(addFavourite([city(1)], city(1))).toMatchObject({ ok: false, reason: 'duplicate' })
  })

  it('refuses a sixth city', () => {
    const full = Array.from({ length: MAX_FAVOURITES }, (_, i) => city(i))
    const result = addFavourite(full, city(99))
    expect(result).toMatchObject({ ok: false, reason: 'limit' })
    expect(result.list).toHaveLength(MAX_FAVOURITES)
  })

  it('removes by id', () => {
    expect(removeFavourite([city(1), city(2)], city(1).id)).toEqual([city(2)])
  })

  it('discards corrupted storage contents', () => {
    expect(sanitizeFavourites('nonsense')).toEqual([])
    expect(sanitizeFavourites([city(1), null, { id: 'x' }])).toEqual([city(1)])
    expect(sanitizeFavourites(Array.from({ length: 9 }, (_, i) => city(i)))).toHaveLength(MAX_FAVOURITES)
  })
})

describe('validation', () => {
  it('rejects empty, symbol-only, too-short and too-long city queries', () => {
    expect(validateCityQuery('   ')).toMatch(/Enter a city name/)
    expect(validateCityQuery('123')).toMatch(/letters/)
    expect(validateCityQuery('L')).toMatch(/at least 2/)
    expect(validateCityQuery('a'.repeat(81))).toMatch(/too long/)
  })

  it('accepts real city names, including non-Latin ones', () => {
    for (const name of ['Lahore', 'São Paulo', 'کراچی', '東京', "N'Djamena"]) expect(validateCityQuery(name)).toBeNull()
  })

  it('validates reminder times', () => {
    expect(validateReminderTime('')).toMatch(/Choose a time/)
    expect(validateReminderTime('25:00')).toMatch(/hours and minutes/)
    expect(validateReminderTime('07:30')).toBeNull()
  })
})

describe('reminder scheduling rule', () => {
  const at = (h, m) => new Date(2026, 10, 12, h, m)
  const reminder = { enabled: true, time: '07:30' }

  it('is not due before the chosen time', () => expect(isReminderDue(reminder, null, at(7, 29))).toBe(false))
  it('is due at and after the chosen time', () => {
    expect(isReminderDue(reminder, null, at(7, 30))).toBe(true)
    expect(isReminderDue(reminder, '2026-11-11', at(15, 0))).toBe(true)
  })
  it('fires at most once per day', () => expect(isReminderDue(reminder, '2026-11-12', at(9, 0))).toBe(false))
  it('never fires when disabled', () => expect(isReminderDue({ ...reminder, enabled: false }, null, at(9, 0))).toBe(false))
})

describe('units and time', () => {
  it('converts for display only', () => {
    expect(formatTemp(20, 'metric')).toBe('20°')
    expect(formatTemp(20, 'imperial')).toBe('68°')
    expect(formatWind(10, 'metric')).toEqual({ value: 36, unit: 'km/h' })
    expect(formatWind(10, 'imperial')).toEqual({ value: 22, unit: 'mph' })
    expect(formatVisibility(10000, 'metric')).toEqual({ value: 10, unit: 'km' })
    expect(formatVisibility(null, 'metric')).toBeNull()
    expect(compassPoint(350)).toBe('N')
    expect(compassPoint(225)).toBe('SW')
  })

  it('computes dates in the city’s time zone', () => {
    const ms = Date.parse('2026-11-12T20:00:00Z')
    expect(dateKey(ms, 5 * 3600)).toBe('2026-11-13')
    expect(dateKey(ms, -8 * 3600)).toBe('2026-11-12')
    expect(describeDay('2026-11-13', '2026-11-13').weekday).toBe('Today')
  })
})

describe('error messages', () => {
  it('classifies HTTP statuses', () => {
    expect([401, 404, 429, 503, 400].map(kindFromStatus)).toEqual(['auth', 'not-found', 'rate-limit', 'server', 'request'])
  })

  it('always says what failed and what to do next', () => {
    const kinds = ['network', 'timeout', 'rate-limit', 'auth', 'not-found', 'server', 'request', 'invalid', 'no-cache']
    for (const kind of kinds) {
      const message = describeError(new ApiError(kind, { provider: 'Open-Meteo', status: 500 }), 'weather')
      expect(message.title.length).toBeGreaterThan(10)
      expect(message.detail.length).toBeGreaterThan(10)
      expect(message.action.length).toBeGreaterThan(10)
      expect(JSON.stringify(message)).not.toMatch(/something went wrong/i)
    }
  })

  it('names every provider that failed', () => {
    const error = new ApiError('rate-limit', {
      provider: 'weather',
      causes: [new ApiError('rate-limit', { provider: 'OpenWeatherMap', status: 429 }), new ApiError('rate-limit', { provider: 'Open-Meteo', status: 429 })],
    })
    expect(describeError(error, 'weather').detail).toMatch(/OpenWeatherMap.*Open-Meteo/)
  })
})
