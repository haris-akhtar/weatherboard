import { ApiError, isAbortError } from '../../utils/errors.js'
import { GEODB, hasGeoDbKey, searchGeoDb } from './geodb.js'
import { OPEN_METEO_GEOCODING, searchOpenMeteoCities } from './openMeteoGeocoding.js'

/**
 * City autocomplete.
 *
 * GeoDB (RapidAPI) is the primary source. Its free tier allows one request per
 * second, so a fast typist can hit HTTP 429 legitimately. When GeoDB is not
 * configured or refuses a request, we fall back to Open-Meteo's keyless
 * geocoder and report which source answered, so the UI never passes one
 * provider's results off as the other's.
 *
 * Returns { cities, source, fallbackFrom } — fallbackFrom is the GeoDB error
 * (or a 'config' error) when the fallback was used.
 */
const cache = new Map()
const CACHE_LIMIT = 60

export async function searchCities(query, { signal } = {}) {
  const key = query.toLowerCase()
  if (cache.has(key)) return cache.get(key)

  let result
  let geoDbError = hasGeoDbKey ? null : new ApiError('config', { provider: GEODB })

  if (hasGeoDbKey) {
    try {
      result = { cities: await searchGeoDb(query, { signal }), source: GEODB, fallbackFrom: null }
    } catch (error) {
      // No point trying a second host when the device itself has no network.
      if (isAbortError(error) || error.kind === 'network') throw error
      geoDbError = error
    }
  }

  if (!result) {
    try {
      const cities = await searchOpenMeteoCities(query, { signal })
      result = { cities, source: OPEN_METEO_GEOCODING, fallbackFrom: geoDbError }
    } catch (error) {
      if (isAbortError(error) || error.kind === 'network') throw error
      throw new ApiError(error.kind, { provider: 'city search', causes: [geoDbError, error] })
    }
  }

  // Two entries for one place (a city and its administrative twin) would share an id.
  const seen = new Set()
  result.cities = result.cities.filter((city) => !seen.has(city.id) && seen.add(city.id))

  // Remember stable answers only. A fallback caused by a rate limit or outage
  // is temporary, and caching it would keep hiding GeoDB after it recovers.
  const transientFallback = result.fallbackFrom && result.fallbackFrom.kind !== 'config'
  if (!transientFallback) {
    if (cache.size >= CACHE_LIMIT) cache.delete(cache.keys().next().value)
    cache.set(key, result)
  }
  return result
}
