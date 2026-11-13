/**
 * A failure from one of the remote APIs, classified so the UI can explain
 * what happened instead of showing a generic message.
 *
 * kind: 'network' | 'timeout' | 'rate-limit' | 'auth' | 'not-found' |
 *       'server' | 'request' | 'invalid' | 'config' | 'no-cache'
 */
export class ApiError extends Error {
  constructor(kind, { provider = null, status = null, causes = [] } = {}) {
    super(`${provider ?? 'request'} failed: ${kind}${status ? ` (HTTP ${status})` : ''}`)
    this.name = 'ApiError'
    this.kind = kind
    this.provider = provider
    this.status = status
    this.causes = causes
  }
}

export const isAbortError = (error) => error?.name === 'AbortError'

export function kindFromStatus(status) {
  if (status === 401 || status === 403) return 'auth'
  if (status === 404) return 'not-found'
  if (status === 429) return 'rate-limit'
  if (status >= 500) return 'server'
  return 'request'
}

const PROVIDER_REASON = {
  network: 'could not be reached',
  timeout: 'took too long to respond',
  'rate-limit': 'is rate-limiting requests',
  auth: 'rejected the API key',
  'not-found': 'has no data for this location',
  server: 'is having server problems',
  request: 'rejected the request',
  invalid: 'returned data in an unexpected format',
  config: 'is not configured',
}

const reason = (error) =>
  `${error.provider ?? 'The service'} ${PROVIDER_REASON[error.kind] ?? 'failed'}${
    error.status ? ` (HTTP ${error.status})` : ''
  }`

const NEXT_STEP = {
  network: 'Check your internet connection, then try again.',
  timeout: 'The connection is slow or the service is busy. Try again in a moment.',
  'rate-limit': 'Too many requests were made in a short time. Wait a minute, then try again.',
  auth: 'The API key is missing, invalid or not yet activated. Check the keys in your .env file (new OpenWeatherMap keys can take up to two hours to activate).',
  'not-found': 'Try a different or nearby city.',
  server: 'This is on the provider’s side. Try again in a few minutes.',
  request: 'Try again, or choose a different city.',
  invalid: 'Try again in a few minutes.',
  config: 'Add the missing API key to your .env file and restart.',
}

/**
 * Turn any thrown value into { title, detail, action } for display.
 * `subject` reads naturally in a sentence: "weather" or "city search".
 */
export function describeError(error, subject) {
  if (!(error instanceof ApiError)) {
    return {
      title: `The ${subject} request failed unexpectedly`,
      detail: 'The app hit an error it did not anticipate while handling the response.',
      action: 'Try again. If it keeps happening, reload the page.',
    }
  }
  if (error.kind === 'no-cache') {
    return {
      title: 'No saved weather for this city',
      detail: 'You’re offline and this city hasn’t been loaded on this device before.',
      action: 'Reconnect to load it, or pick a city you’ve viewed recently.',
    }
  }
  if (error.kind === 'network') {
    return {
      title: `Can’t reach the ${subject} service`,
      detail: 'The request never got a response — your device may be offline or the connection dropped.',
      action: NEXT_STEP.network,
    }
  }
  const causes = error.causes.length ? error.causes : [error]
  return {
    title:
      error.kind === 'rate-limit'
        ? `The ${subject} service is rate-limited`
        : `Couldn’t load ${subject}`,
    detail: `${causes.map(reason).join('; ')}.`,
    action: NEXT_STEP[error.kind] ?? NEXT_STEP.request,
  }
}
