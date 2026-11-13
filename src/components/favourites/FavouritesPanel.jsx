import { X } from 'lucide-react'
import { MAX_FAVOURITES } from '../../utils/favourites.js'
import { Notice } from '../ui/Notice.jsx'

export function FavouritesPanel({ favourites, activeId, persistent, onSelect, onRequestRemove }) {
  return (
    <section aria-labelledby="favourites-heading">
      <div className="mb-2.5 flex items-baseline justify-between">
        <h2 id="favourites-heading" className="eyebrow">
          Favourites
        </h2>
        <p className="eyebrow tnum" aria-label={`${favourites.length} of ${MAX_FAVOURITES} favourites used`}>
          {favourites.length}/{MAX_FAVOURITES}
        </p>
      </div>

      {favourites.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line-strong px-3.5 py-3 text-sm text-muted">
          No favourites yet. Open a city and tap the star to pin it here.
        </p>
      ) : (
        // Wrapping chips on small screens, a vertical list in the desktop sidebar.
        <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-1.5">
          {favourites.map((city) => {
            const active = city.id === activeId
            return (
              <li
                key={city.id}
                className={`flex max-w-full items-stretch overflow-hidden rounded-xl border transition-colors ${
                  active ? 'border-line-strong bg-surface shadow-card' : 'border-line bg-surface/60 hover:bg-surface'
                }`}
              >
                <button
                  type="button"
                  aria-current={active ? 'true' : undefined}
                  onClick={() => onSelect(city)}
                  className="min-h-11 min-w-0 flex-1 py-1.5 pl-3.5 pr-1 text-left"
                >
                  <span className="block truncate text-sm font-medium">{city.name}</span>
                  <span className="hidden truncate text-xs text-muted lg:block">
                    {[city.region, city.country].filter(Boolean).join(', ')}
                  </span>
                </button>
                <button
                  type="button"
                  aria-label={`Remove ${city.name} from favourites`}
                  title="Remove"
                  onClick={() => onRequestRemove(city)}
                  className="flex min-h-11 w-11 shrink-0 items-center justify-center text-faint transition-colors hover:bg-danger-soft hover:text-danger"
                >
                  <X aria-hidden="true" className="size-4" />
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {!persistent && (
        <Notice tone="warn" className="mt-3" title="Favourites won’t be saved">
          Your browser is blocking site storage (common in private windows). Favourites work until you close
          this tab. Allow site data to keep them.
        </Notice>
      )}
    </section>
  )
}
