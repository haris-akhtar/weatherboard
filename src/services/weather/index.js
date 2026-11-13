import { ApiError, isAbortError } from '../../utils/errors.js'
import { fetchOpenMeteo } from './openMeteo.js'
import { OPENWEATHERMAP, fetchOpenWeather, hasOpenWeatherKey } from './openWeatherMap.js'

/**
 * @typedef {Object} WeatherReport  Provider-independent weather, always metric
 *   (°C, m/s, hPa, metres). Unit conversion happens at display time.
 * @property {string} source            Provider that produced *all* of this data.
 * @property {ApiError|null} fallbackFrom  Why the primary provider was skipped, if it was.
 * @property {number} fetchedAt         When the data left the provider (ms).
 * @property {boolean} cached           True when served from an offline cache.
 * @property {number} utcOffsetSeconds  City's offset, for local-time display.
 * @property {Object} current
 * @property {Array<{date:string,tempMin:number,tempMax:number,windSpeedMax:number,condition:Object}>} daily
 */

/**
 * OpenWeatherMap first; Open-Meteo when OpenWeatherMap is not configured,
 * rate-limited, or otherwise failing. A report always comes wholly from one
 * provider — the two are never blended.
 *
 * @returns {Promise<WeatherReport>}
 */
export async function getWeather(city, { signal } = {}) {
  let primaryError = hasOpenWeatherKey ? null : new ApiError('config', { provider: OPENWEATHERMAP })

  if (hasOpenWeatherKey) {
    try {
      return finalize(await fetchOpenWeather(city, { signal }), null)
    } catch (error) {
      if (isAbortError(error)) throw error
      primaryError = error
    }
  }

  try {
    return finalize(await fetchOpenMeteo(city, { signal }), primaryError)
  } catch (error) {
    if (isAbortError(error)) throw error
    // Report the provider that was actually expected to work first.
    const causes = primaryError.kind === 'config' ? [error] : [primaryError, error]
    const kind = causes.every((cause) => cause.kind === causes[0].kind) ? causes[0].kind : 'request'
    throw new ApiError(kind, { provider: 'weather', causes })
  }
}

function finalize({ cachedAt, ...report }, fallbackFrom) {
  return {
    ...report,
    fallbackFrom: fallbackFrom ? { kind: fallbackFrom.kind, status: fallbackFrom.status } : null,
    fetchedAt: cachedAt ?? Date.now(),
    cached: Boolean(cachedAt),
  }
}
