import { ApiError, kindFromStatus } from '../utils/errors.js'

const DEFAULT_TIMEOUT_MS = 10_000

/**
 * fetch + JSON with classified errors, a timeout, and caller cancellation.
 * Caller aborts are re-thrown untouched (name === 'AbortError') so hooks can
 * ignore them; everything else becomes an ApiError.
 *
 * The timeout is wired by hand rather than with AbortSignal.any()/timeout():
 * those are missing in Safari before 17.4, where they would break every request.
 *
 * `cachedAt` is set when the service worker answered from its weather cache
 * because the network failed (see src/sw.js).
 */
export async function fetchJson(url, { signal, headers, provider, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  const controller = new AbortController()
  let timedOut = false
  const timer = setTimeout(() => {
    timedOut = true
    controller.abort()
  }, timeoutMs)
  const forwardAbort = () => controller.abort()
  if (signal?.aborted) controller.abort()
  else signal?.addEventListener('abort', forwardAbort, { once: true })

  // The timeout covers reading the body too, not just the response headers.
  const fail = (error, fallbackKind) => {
    if (signal?.aborted) return error
    return new ApiError(timedOut ? 'timeout' : fallbackKind, { provider })
  }

  try {
    let response
    try {
      response = await fetch(url, { signal: controller.signal, headers })
    } catch (error) {
      throw fail(error, 'network')
    }
    if (!response.ok) {
      throw new ApiError(kindFromStatus(response.status), { provider, status: response.status })
    }
    try {
      const data = await response.json()
      const cachedAt = Number(response.headers.get('x-wb-cached-at')) || null
      return { data, cachedAt }
    } catch (error) {
      throw fail(error, 'invalid')
    }
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', forwardAbort)
  }
}
