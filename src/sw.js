/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core'
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { getWeather } from './services/weather/index.js'
import { idbGet, idbSet } from './utils/idb.js'
import { PERIODIC_SYNC_TAG, isReminderDue, localDateKey } from './utils/reminder.js'
import { formatTemp } from './utils/units.js'

// ── App shell ────────────────────────────────────────────────────────────────
// Every built asset (HTML, JS, CSS, fonts, icons, manifest) is precached, so
// the app boots with no network. A new deploy activates on the next load.
self.skipWaiting()
clientsClaim()
cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST, { ignoreURLParametersMatching: [/.*/] })

// ── Weather responses: network first, cache on failure ───────────────────────
// Successful weather responses are stored. If a later request fails at the
// network level, the stored copy is returned with an `x-wb-cached-at` header,
// so the page knows the data is saved rather than live and can say so.
const WEATHER_CACHE = 'wb-weather-v1'
const WEATHER_HOSTS = ['api.openweathermap.org', 'api.open-meteo.com']
const MAX_WEATHER_ENTRIES = 12

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET' || !WEATHER_HOSTS.includes(new URL(request.url).hostname)) return
  event.respondWith(weatherNetworkFirst(request))
})

async function weatherNetworkFirst(request) {
  const cache = await caches.open(WEATHER_CACHE)
  try {
    const response = await fetch(request)
    if (response.ok) {
      const headers = new Headers(response.headers)
      headers.set('x-wb-cached-at', String(Date.now()))
      const copy = new Response(await response.clone().blob(), { status: 200, headers })
      await cache.put(request.url, copy)
      const keys = await cache.keys()
      await Promise.all(keys.slice(0, Math.max(0, keys.length - MAX_WEATHER_ENTRIES)).map((key) => cache.delete(key)))
    }
    return response
  } catch (error) {
    const cached = await cache.match(request.url)
    if (cached) return cached
    throw error
  }
}

// ── Notifications ────────────────────────────────────────────────────────────
// Three triggers share one code path:
//   periodicsync  Chromium wakes an *installed* PWA roughly daily, tab closed.
//   push          Ready for a push server; nothing sends pushes today.
//   message       The "Send test notification" button.
async function showWeatherNotification({ onlyIfDue }) {
  const reminder = await idbGet('reminder')
  if (onlyIfDue && !isReminderDue(reminder, await idbGet('lastNotifiedDate'))) return false

  const [city, units] = await Promise.all([idbGet('lastCity'), idbGet('units')])
  let title = 'Your daily weather check'
  let body = 'Open WeatherBoard to see today’s forecast.'
  if (city) {
    try {
      const report = await getWeather(city)
      const today = report.daily[0]
      title = `${city.name}: ${formatTemp(report.current.temp, units)} · ${report.current.condition.label}`
      body = today
        ? `Today ${formatTemp(today.tempMax, units)} / ${formatTemp(today.tempMin, units)}. Tap for the 5-day forecast.`
        : 'Tap for the 5-day forecast.'
    } catch {
      body = `Open WeatherBoard for today’s forecast in ${city.name}.`
    }
  }

  await self.registration.showNotification(title, {
    body,
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-96.png',
    tag: 'daily-weather', // a new reminder replaces yesterday's instead of stacking
    data: { url: '/' },
  })
  if (onlyIfDue) await idbSet('lastNotifiedDate', localDateKey())
  return true
}

self.addEventListener('periodicsync', (event) => {
  if (event.tag === PERIODIC_SYNC_TAG) event.waitUntil(showWeatherNotification({ onlyIfDue: true }))
})

self.addEventListener('push', (event) => {
  event.waitUntil(showWeatherNotification({ onlyIfDue: false }))
})

self.addEventListener('message', (event) => {
  if (event.data?.type !== 'SHOW_TEST_NOTIFICATION') return
  event.waitUntil(
    showWeatherNotification({ onlyIfDue: false }).then(
      () => event.ports[0]?.postMessage({ ok: true }),
      (error) => event.ports[0]?.postMessage({ ok: false, message: String(error?.message ?? error) }),
    ),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
      const existing = windows.find((client) => 'focus' in client)
      return existing ? existing.focus() : self.clients.openWindow(event.notification.data?.url ?? '/')
    }),
  )
})
