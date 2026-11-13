import { useEffect, useState } from 'react'
import { FavouritesPanel } from './components/favourites/FavouritesPanel.jsx'
import { Forecast } from './components/forecast/Forecast.jsx'
import { Header } from './components/layout/Header.jsx'
import { OfflineBanner } from './components/layout/OfflineBanner.jsx'
import { ReminderCard } from './components/notifications/ReminderCard.jsx'
import { CitySearch } from './components/search/CitySearch.jsx'
import { Button } from './components/ui/Button.jsx'
import { ConfirmDialog } from './components/ui/ConfirmDialog.jsx'
import { Notice } from './components/ui/Notice.jsx'
import { CurrentWeather } from './components/weather/CurrentWeather.jsx'
import { EmptyState, WeatherError, WeatherSkeleton } from './components/weather/WeatherStates.jsx'
import { useFavourites } from './hooks/useFavourites.js'
import { useOnlineStatus } from './hooks/useOnlineStatus.js'
import { useStoredState } from './hooks/useStoredState.js'
import { useWeather } from './hooks/useWeather.js'
import { describeError } from './utils/errors.js'
import { MAX_FAVOURITES } from './utils/favourites.js'
import { idbSet } from './utils/idb.js'
import { KEYS } from './utils/storage.js'

const sanitizeCity = (value) =>
  value && typeof value.id === 'string' && Number.isFinite(value.lat) && Number.isFinite(value.lon) ? value : null

export default function App() {
  const online = useOnlineStatus()
  const [city, setCity] = useStoredState(KEYS.lastCity, null, sanitizeCity)
  const weather = useWeather(city, online)
  const favourites = useFavourites()
  const [pendingRemoval, setPendingRemoval] = useState(null)
  const [limitNoticeFor, setLimitNoticeFor] = useState(null)

  // The service worker builds notifications for the last-viewed city.
  useEffect(() => {
    if (city) idbSet('lastCity', city)
  }, [city])

  function toggleFavourite() {
    if (favourites.isFavourite(city.id)) return setPendingRemoval(city)
    const result = favourites.add(city)
    setLimitNoticeFor(result.reason === 'limit' ? city.id : null)
  }

  function confirmRemoval() {
    favourites.remove(pendingRemoval.id)
    setPendingRemoval(null)
    setLimitNoticeFor(null)
  }

  const limitNotice =
    city && limitNoticeFor === city.id && favourites.isFull
      ? `You already have ${MAX_FAVOURITES} favourites, which is the maximum. Remove one to add ${city.name}.`
      : null

  // A saved copy is on screen because the live request failed (not merely offline).
  const staleReason = weather.status === 'success' && weather.error ? describeError(weather.error, 'weather') : null

  return (
    <>
      {!online && <OfflineBanner />}
      <div className="mx-auto flex max-w-[1240px] flex-col gap-5 px-4 pb-12 pt-4 sm:px-6 sm:pt-6 lg:grid lg:grid-cols-[17.5rem_minmax(0,1fr)] lg:items-start lg:gap-8">
        {/* `contents` flattens these wrappers on small screens so `order` can interleave
            their children (header → search → favourites → weather → reminder); from lg
            they become a sticky sidebar and the main column. */}
        <aside className="contents lg:sticky lg:top-6 lg:flex lg:flex-col lg:gap-6">
          <div className="order-1">
            <Header />
          </div>
          <div className="order-3">
            <FavouritesPanel
              favourites={favourites.favourites}
              activeId={city?.id}
              persistent={favourites.persistent}
              onSelect={setCity}
              onRequestRemove={setPendingRemoval}
            />
          </div>
          <div className="order-5">
            <ReminderCard />
          </div>
        </aside>

        <main className="contents lg:flex lg:flex-col lg:gap-6">
          <div className="order-2">
            <CitySearch selectedCity={city} online={online} onSelect={setCity} />
          </div>
          <div className="order-4 grid gap-6">
            {weather.status === 'idle' && <EmptyState hasFavourites={favourites.favourites.length > 0} online={online} />}
            {weather.status === 'loading' && <WeatherSkeleton city={city} />}
            {weather.status === 'error' && (
              <WeatherError city={city} error={weather.error} online={online} onRetry={weather.refresh} />
            )}
            {weather.status === 'success' && (
              <>
                {staleReason && (
                  <Notice
                    tone="warn"
                    title={`${staleReason.title} — showing your saved copy`}
                    action={
                      <Button onClick={weather.refresh} className="shrink-0">
                        Try again
                      </Button>
                    }
                  >
                    {staleReason.detail} {staleReason.action}
                  </Notice>
                )}
                {/* Keyed by city so the entrance animation replays on each switch. */}
                <CurrentWeather
                  key={city.id}
                  city={city}
                  report={weather.report}
                  refreshing={weather.refreshing}
                  online={online}
                  isFavourite={favourites.isFavourite(city.id)}
                  favouriteNotice={limitNotice}
                  onToggleFavourite={toggleFavourite}
                  onRefresh={weather.refresh}
                />
                <Forecast key={`${city.id}-forecast`} report={weather.report} />
              </>
            )}
          </div>
        </main>
      </div>

      <ConfirmDialog
        open={Boolean(pendingRemoval)}
        title={`Remove ${pendingRemoval?.name ?? 'city'} from favourites?`}
        confirmLabel="Remove"
        onConfirm={confirmRemoval}
        onCancel={() => setPendingRemoval(null)}
      >
        It will disappear from your quick-access list. You can add it again any time by searching for it.
      </ConfirmDialog>
    </>
  )
}
