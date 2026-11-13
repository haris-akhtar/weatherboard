import { useCallback, useEffect, useState } from 'react'
import { searchCities } from '../services/cities/index.js'
import { isAbortError } from '../utils/errors.js'
import { validateCityQuery } from '../utils/validation.js'
import { useDebouncedValue } from './useDebouncedValue.js'

// Short enough that, with a typical API round trip, suggestions land within
// roughly 300 ms of the user pausing; long enough to skip most keystrokes.
const DEBOUNCE_MS = 200

const IDLE = { status: 'idle', cities: [], source: null, fallbackFrom: null, error: null }

/**
 * Debounced, cancellable city autocomplete.
 * status: 'idle' | 'loading' | 'success' | 'empty' | 'error'
 */
export function useCitySearch(rawQuery, { enabled = true } = {}) {
  const query = rawQuery.trim()
  const debounced = useDebouncedValue(query, DEBOUNCE_MS)
  const [attempt, setAttempt] = useState(0)
  const [settled, setSettled] = useState({ key: null, ...IDLE })

  const searchable = enabled && validateCityQuery(debounced) === null
  const key = `${debounced.toLowerCase()}#${attempt}`

  useEffect(() => {
    if (!searchable) return
    const controller = new AbortController()
    searchCities(debounced, { signal: controller.signal })
      .then((result) =>
        setSettled({ key, ...IDLE, ...result, status: result.cities.length ? 'success' : 'empty' }),
      )
      .catch((error) => {
        if (!isAbortError(error)) setSettled({ key, ...IDLE, status: 'error', error })
      })
    // Typing again cancels the in-flight request for the previous query.
    return () => controller.abort()
  }, [debounced, searchable, key])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])

  // State is derived rather than reset in an effect, so a stale result can
  // never be shown against a newer query.
  if (!enabled || validateCityQuery(query) !== null) return { ...IDLE, retry }
  if (query !== debounced || settled.key !== key) return { ...IDLE, status: 'loading', retry }
  return { ...settled, retry }
}
