import { ApiError, kindFromStatus } from '../utils/errors.js'

const DEFAULT_TIMEOUT_MS = 10_000

/**
 * fetch + JSON with classified errors, a timeout, and caller cancellation.
 * Caller aborts are re-thrown untouched (name === 'AbortError') so hooks can
 * ignore them; everything else becomes an ApiError.
 *
 * `cachedAt` is set when the service worker answered from its weather cache
 * because the network failed (see src/sw.js).
 */
export async function fetchJson(url, { signal, headers, provider, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  const timeout = AbortSignal.timeout(timeoutMs)
  const combined = signal ? AbortSignal.any([signal, timeout]) : timeout

  let response
  try {
    response = await fetch(url, { signal: combined, headers })
  } catch (error) {
    if (signal?.aborted) throw error
    if (timeout.aborted) throw new ApiError('timeout', { provider })
    throw new ApiError('network', { provider })
  }

  if (!response.ok) {
    throw new ApiError(kindFromStatus(response.status), { provider, status: response.status })
  }

  try {
    const data = await response.json()
    const cachedAt = Number(response.headers.get('x-wb-cached-at')) || null
    return { data, cachedAt }
  } catch (error) {
    if (signal?.aborted) throw error
    throw new ApiError('invalid', { provider })
  }
}
