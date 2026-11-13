import { useCallback, useEffect, useMemo, useState } from 'react'
import { getWeather } from '../services/weather/index.js'
import { ApiError, isAbortError } from '../utils/errors.js'
import { readSnapshot, saveSnapshot } from '../utils/snapshots.js'

/**
 * Weather for one city, with offline restoration.
 *
 * Returns { status, report, error, refreshing, refresh }:
 *  - status 'idle'     no city selected
 *  - status 'loading'  first load, nothing to show yet
 *  - status 'success'  `report` is displayable. `report.cached` means it came
 *                      from a saved copy; `error` then says why it isn't live.
 *  - status 'error'    nothing to show; `error` explains why
 * `refreshing` is true while a saved report is on screen and a live one is loading.
 */
export function useWeather(city, online) {
  const [attempt, setAttempt] = useState(0)
  const [settled, setSettled] = useState({ key: null, report: null, error: null })

  const cityId = city?.id ?? null
  const key = cityId ? `${cityId}#${attempt}#${online}` : null

  useEffect(() => {
    if (!city) return
    const snapshot = readSnapshot(city.id)

    if (!online) {
      // Don't fire a request that cannot succeed — restore the saved copy.
      setSettled(
        snapshot
          ? { key, report: { ...snapshot, cached: true }, error: null }
          : { key, report: null, error: new ApiError('no-cache') },
      )
      return
    }

    const controller = new AbortController()
    getWeather(city, { signal: controller.signal })
      .then((report) => {
        if (!report.cached) saveSnapshot(city.id, report)
        setSettled({ key, report, error: null })
      })
      .catch((error) => {
        if (isAbortError(error)) return
        setSettled({ key, report: snapshot ? { ...snapshot, cached: true } : null, error })
      })
    return () => controller.abort()
    // `city` is intentionally tracked by id: a new object for the same city must not refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const refresh = useCallback(() => setAttempt((n) => n + 1), [])
  // Re-read storage only when the request changes, not on every render.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const snapshot = useMemo(() => (cityId ? readSnapshot(cityId) : null), [key])

  if (!city) return { status: 'idle', report: null, error: null, refreshing: false, refresh }
  if (settled.key !== key) {
    // In flight. Show the saved copy for this city, if any, while we wait.
    return snapshot
      ? { status: 'success', report: { ...snapshot, cached: true }, error: null, refreshing: true, refresh }
      : { status: 'loading', report: null, error: null, refreshing: false, refresh }
  }
  return {
    status: settled.report ? 'success' : 'error',
    report: settled.report,
    error: settled.error,
    refreshing: false,
    refresh,
  }
}
