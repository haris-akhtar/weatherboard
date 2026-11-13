# WeatherBoard

A responsive, installable weather dashboard: search any city, see current conditions and a five-day forecast, pin up to five favourites, and keep the last-viewed city available offline.

Built for the Edspire Frontend (React) Developer Technical Challenge, November 2026.

**Live URL:** _not deployed yet — add the URL here after following [Deployment](#deployment)._

---

## Features

| Area | What it does |
|---|---|
| City search | Live autocomplete (GeoDB Cities via RapidAPI), debounced 200 ms, cancellable, keyboard-navigable (↑ ↓ Enter Esc), validated on blur and submit. |
| Current weather | Temperature, feels-like, condition and icon, humidity, wind speed and direction, pressure, visibility, sunrise/sunset, location, data source and last-updated time. |
| Forecast | Five days with min/max, condition, max wind, and a range bar coloured by real temperature. |
| Provider fallback | OpenWeatherMap first; Open-Meteo when OpenWeatherMap is unconfigured, rate-limited or failing. The source is always shown. |
| Favourites | Up to five, persisted in `localStorage`, duplicate-proof, removal behind a confirmation dialog, in-memory fallback when storage is blocked. |
| PWA | Manifest, 192/512/maskable icons, service worker precaching the app shell, cached weather for offline use, offline banner. |
| Daily reminder | Explains itself before the browser prompt, lets the user pick a time, handles granted / denied / unsupported. See [Notifications](#notifications-what-works-and-what-does-not) for the honest limits. |
| Extras | Dark/light theme (follows the system until changed), °C/°F toggle (persisted, no reload), CSS-animated condition icon, reduced-motion support. |

## Technology

React 19 · Vite 8 · Tailwind CSS 4 · Lucide icons · `vite-plugin-pwa` (Workbox `injectManifest`) · Vitest · oxlint. JavaScript with JSDoc; no state library, no router, no data-fetching library — the app has one screen and three pieces of shared state.

## Getting started

```bash
npm install
```

```bash
cp .env.example .env.local
```

```bash
npm run dev
```

The service worker is only built for production. To exercise offline mode and notifications locally:

```bash
npm run build
```

```bash
npm run preview
```

### Environment variables

| Variable | Needed for | Where to get it |
|---|---|---|
| `VITE_OPENWEATHER_API_KEY` | Primary weather source | <https://home.openweathermap.org/api_keys> (free; new keys can take up to two hours to activate) |
| `VITE_RAPIDAPI_KEY` | City autocomplete via GeoDB | Subscribe to the free Basic plan of [GeoDB Cities on RapidAPI](https://rapidapi.com/wirefreethought/api/geodb-cities) |
| `VITE_RAPIDAPI_HOST` | GeoDB host | `wft-geo-db.p.rapidapi.com` (default) |

**These keys are not secret.** Every `VITE_` variable is inlined into the JavaScript bundle and visible to anyone who opens the site. That is unavoidable for a client-only app. Use free-tier keys, restrict them in each provider's dashboard where possible, and never reuse a key that has billing attached. `.env*` files are git-ignored.

**The app runs with no keys at all.** Without them it uses Open-Meteo for weather and Open-Meteo's geocoder for search, and says so in the UI.

## APIs and data sources

| API | Used for | Endpoint |
|---|---|---|
| GeoDB Cities (RapidAPI) | Autocomplete — primary | `GET /v1/geo/cities?namePrefix=…&limit=6&sort=-population&types=CITY` |
| Open-Meteo Geocoding | Autocomplete — fallback | `GET geocoding-api.open-meteo.com/v1/search?name=…` |
| OpenWeatherMap | Weather — primary | `GET /data/2.5/weather` and `GET /data/2.5/forecast` (3-hourly, aggregated to days) |
| Open-Meteo | Weather — fallback | `GET api.open-meteo.com/v1/forecast?current=…&daily=…&timezone=auto` |

Nothing is mocked or hardcoded. There is no sample data anywhere in `src/`.

### Why there is a search fallback

GeoDB's free tier allows **one request per second**. A user who types, pauses, and types again within a second gets HTTP 429 through no fault of their own. Rather than show an error for normal typing, the search falls back to Open-Meteo's keyless geocoder and labels the suggestion list with the source that actually answered (`GeoDB is rate-limited — results from Open-Meteo Geocoding`).

### One data shape, one provider per report

Both weather adapters return the same `WeatherReport` (see `src/services/weather/index.js`): metric units, a shared vocabulary of eight condition kinds, and local dates per city. A report always comes wholly from one provider; the two are never blended, and the provider's name is on screen next to the data. Unit conversion (°F, mph, miles) happens only at display time.

OpenWeatherMap's free tier has no daily endpoint, so `aggregateDaily()` groups its 3-hourly slots by the **city's** calendar day (not UTC, not the viewer's) and derives min, max, strongest wind and the condition nearest midday.

## Architecture

```
src/
  App.jsx                     Composition only: layout, which state to show
  main.jsx                    Entry; registers the service worker in production
  sw.js                       Service worker: precache, weather cache, notifications
  components/
    layout/                   Header (logo, units, theme, install), OfflineBanner
    search/                   CitySearch (ARIA combobox)
    weather/                  CurrentWeather, WeatherIcon, empty/loading/error states
    forecast/                 Forecast with temperature range bars
    favourites/               FavouritesPanel
    notifications/            ReminderCard
    ui/                       Button, Notice, ConfirmDialog, StatusDot, ErrorBoundary
  hooks/                      useCitySearch, useWeather, useFavourites, useReminder,
                              useOnlineStatus, useStoredState, useDebouncedValue, useInstallPrompt
  services/
    http.js                   fetch + timeout + cancellation + classified errors
    cities/                   geodb.js, openMeteoGeocoding.js, index.js (fallback + cache)
    weather/                  openWeatherMap.js, openMeteo.js, conditions.js, index.js (fallback)
  context/                    PreferencesContext (theme, units)
  utils/                      storage, idb, snapshots, errors, validation, favourites,
                              reminder, time, units, cityId
  styles/index.css            Design tokens, light/dark themes, motion
tests/                        Vitest unit tests for the pure logic
public/                       manifest.webmanifest, icons/, favicon.svg
scripts/generate-icons.mjs    Renders the PNG icons from one SVG
```

### Decisions worth explaining

- **API logic never touches components.** Components call hooks; hooks call services; services call `fetchJson`. Swapping a provider means editing one adapter.
- **Errors are classified once, at the HTTP layer** (`network`, `timeout`, `rate-limit`, `auth`, `not-found`, `server`, …). `describeError()` turns a classification into a title, a cause naming the provider and HTTP status, and a next step. A unit test asserts every kind produces all three and none says "something went wrong".
- **Request state is derived, not synchronised.** `useCitySearch` and `useWeather` store the last settled result with the key it belongs to. If the key on screen differs, the hook reports `loading`. A stale response can never be shown against a newer query, and there is no effect that resets state.
- **Every request is cancellable.** Typing again or switching city aborts the in-flight request via `AbortController`; requests also time out after 10 s.
- **City identity is rounded coordinates**, not a provider id, so a favourite saved from a GeoDB result still matches the same city found through Open-Meteo.
- **Context only where it earns it.** Theme and units are read by many leaf components, so they live in context. Everything else is plain hooks and props.
- **No hand-rolled focus trap.** The confirmation dialog is a native `<dialog>` (`showModal()` gives focus trapping, Escape and an inert background). Focus starts on Cancel so a stray Enter cannot delete.

## PWA and offline behaviour

- **Manifest** — `public/manifest.webmanifest`: name `WeatherBoard`, `display: standalone`, `theme_color`, icons at 192×192 and 512×512 plus a 512 maskable icon.
- **App shell** — every built asset (HTML, JS, CSS, self-hosted fonts, icons, manifest) is precached by Workbox. Fonts are bundled rather than loaded from a CDN specifically so the offline app looks identical.
- **Weather, two layers**
  1. The service worker handles requests to both weather hosts network-first and stores successful responses in Cache Storage (`wb-weather-v1`). If the network fails it returns the stored copy with an `x-wb-cached-at` header, so the page knows the data is saved and never presents it as live.
  2. The page keeps the latest normalized report per city (the six most recent) in `localStorage`. This is what restores the last-viewed city instantly on launch, and it works even before a service worker is controlling the page.
- **Offline detection** — `navigator.onLine` plus `online`/`offline` events drive a sticky "Offline mode" banner. While offline the app does not fire requests that cannot succeed: weather is restored from the saved copy and labelled `Saved copy · <provider> · <time>`, refresh is disabled, and search explains why it is paused. Reconnecting refreshes automatically.
- Because `navigator.onLine` can report `true` on a dead connection, a failed request while "online" also falls back to the saved copy, with a notice saying what failed.

## Notifications: what works and what does not

The brief asks for a daily reminder that "fires even when the tab is closed" from a client-only app with no backend. **Those two requirements conflict, and this app does not pretend otherwise.**

### Why

A web page cannot schedule a future notification with a closed tab. The web platform offers exactly these routes:

| Mechanism | Closed-tab delivery? | Status |
|---|---|---|
| **Web Push** (Push API) | Yes, reliably | Needs a server holding a VAPID private key to send each push on schedule. Not possible client-only. |
| **Periodic Background Sync** | Yes, approximately | Chromium only, **installed PWAs only**. The browser decides when to wake the app (roughly daily, based on site engagement); no exact time. |
| **Notification Triggers** (`showTrigger`) | Would have been ideal | Chrome origin trial, abandoned. Not in any shipping browser. |
| `setTimeout` / `setInterval` | No | Dies with the tab. Deliberately **not used** — it would be a fake. |

### What is implemented

1. **Permission UX** — an in-app explanation (what, how often, how to stop) appears before the browser prompt. Granted, denied and unsupported each have their own clear state. Denying breaks nothing else.
2. **Reminder time** — a validated time field, saved to `localStorage` and mirrored to IndexedDB so the service worker can read it.
3. **Service-worker notifications** — the worker fetches fresh weather for the last-viewed city and shows `Lahore: 21° · Mainly clear / Today 28° / 19°`. Clicking it focuses or opens the app.
4. **Periodic Background Sync** — on Chromium, once the app is installed, the worker registers a `daily-weather` sync. Each time the browser wakes it, the worker checks "has today's reminder time passed, and have we not notified today?" and notifies at most once per day. **This genuinely fires with the app closed**, at or after the chosen time, but the browser controls the exact moment and may skip days for a rarely used app.
5. **A `push` event handler** — already wired to the same code path, so adding a push server later needs no client changes beyond subscribing.
6. **Honest status** — the card states which case the user is in: background delivery on; install required; or "this browser can't deliver scheduled reminders", with the reason.

### What it would take to meet the brief exactly

A small scheduled sender: store each `PushSubscription` and reminder time, and have a cron-triggered function (Vercel Cron, Cloudflare Workers, etc.) send a Web Push at each user's time. That is a backend, which the brief excludes.

| Browser | Result |
|---|---|
| Chrome / Edge, app installed | Daily reminder with app closed; time approximate |
| Chrome / Edge, not installed | Preference saved, test notification works, no scheduled delivery until installed |
| Firefox, Safari | Preference saved, test notification works, no scheduled delivery |
| iOS Safari | Notifications only exist for Home Screen apps; no periodic sync, so no scheduled delivery |

## Testing

```bash
npm test
```

```bash
npm run lint
```

```bash
npm run build
```

`npm test` runs 25 unit tests covering provider normalization, the 3-hourly→daily aggregation (including the time-zone boundary), favourites rules, validation, the reminder "is it due" rule, unit conversion and error messages.

### What was verified in a real browser

Run against the production build (`vite preview`) in Chromium via Playwright, at 375, 768 and 1280 px:

- Search: empty/short/non-letter input on blur and on submit, no results, HTTP 500, network failure and retry, keyboard navigation, offline message.
- Weather: all current fields, five forecast days, source label, °C/°F switch without reload, persistence across reload.
- Fallback: a build with deliberately invalid keys received real `401` from OpenWeatherMap and `403` from GeoDB and fell back to Open-Meteo for both, labelled as such.
- Favourites: add, five-city limit with explanation, switching, confirm / cancel / Escape on removal, persistence across reload, blocked `localStorage`.
- Offline: banner, saved weather kept, **full reload while offline** (shell from the service worker, last city restored), another favourite restored from its saved copy, automatic refresh on reconnect.
- Notifications: explanation shown before any permission request; denied; unsupported; granted → test notification shown by the service worker with real weather; a `periodicsync` event dispatched with no window open produced one notification, and a second dispatch the same day produced none.
- Layout: no horizontal overflow and no interactive element under 44×44 px at all three widths.
- PWA: manifest fields, icon files match declared sizes, service worker controlling, both caches populated.

### What was *not* verified

Stated plainly so nothing here is taken on trust:

- **OpenWeatherMap success path** and **GeoDB success path** — no API keys were available during development. Both adapters are written against the providers' documented response formats and unit-tested with fixtures in that shape, but neither has returned live data in this app yet. Test both as soon as keys are added.
- **Real periodic sync scheduling** — the worker's handler was triggered by dispatching the event manually. Chrome actually waking an installed app a day later was not observed.
- **Installation on a physical phone**, and iOS behaviour generally.
- **The 300 ms suggestion target** on a normal connection. The debounce is 200 ms, leaving ~100 ms for the round trip; development ran behind a proxy that added about a second, so the real figure could not be measured.
- During testing Open-Meteo rate-limited the development machine's shared IP for most requests. Where that happened, the browser tests replayed one real response captured from the same endpoint minutes earlier; some runs used live responses.

## Deployment

Both `vercel.json` and `netlify.toml` are included: build command `npm run build`, output `dist`, SPA fallback, `no-cache` on `sw.js` so updates are picked up, long-lived caching on hashed assets.

**Vercel**

1. Push the repository to GitHub and import it at <https://vercel.com/new>.
2. Add `VITE_OPENWEATHER_API_KEY`, `VITE_RAPIDAPI_KEY` and `VITE_RAPIDAPI_HOST` under *Settings → Environment Variables*.
3. Deploy. Changing a variable requires a redeploy, because values are inlined at build time.

**Netlify** — same idea: import the repo, add the variables under *Site configuration → Environment variables*, deploy.

Service workers and notifications require HTTPS; both hosts provide it. After deploying, check on the live URL:

- DevTools → Application → Manifest shows no errors and offers install.
- DevTools → Application → Service workers shows `sw.js` activated.
- Load a city, switch DevTools to Offline, reload: the city is still there under the offline banner.
- The weather card says `Live · OpenWeatherMap`, and the suggestion list says `Results from GeoDB Cities`.

## Known limitations

- Scheduled reminders are best-effort and Chromium-only, as described above.
- API keys ship in the bundle. A production version would proxy the providers through a small server.
- "Today" in the OpenWeatherMap forecast covers only the remaining hours of the day, because the free endpoint has no past slots; the current reading is folded into today's range to compensate.
- Offline data exists only for cities already opened on that device (the six most recent).
- City names and conditions are English only; times and dates follow the browser locale.
- There are no automated browser tests in the repository; the browser checks above were run with scripts that are not part of the project.
