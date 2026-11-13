export const MAX_FAVOURITES = 5

/**
 * Pure add rule, kept out of React so it can be unit-tested.
 * Returns { list, ok, reason } where reason is 'duplicate' | 'limit' | null.
 */
export function addFavourite(list, city) {
  if (list.some((item) => item.id === city.id)) return { list, ok: false, reason: 'duplicate' }
  if (list.length >= MAX_FAVOURITES) return { list, ok: false, reason: 'limit' }
  const { id, name, region, country, countryCode, lat, lon } = city
  return { list: [...list, { id, name, region, country, countryCode, lat, lon }], ok: true, reason: null }
}

export const removeFavourite = (list, id) => list.filter((item) => item.id !== id)

/** Discard anything in storage that is not a usable favourites list. */
export function sanitizeFavourites(value) {
  if (!Array.isArray(value)) return []
  return value
    .filter((item) => item && typeof item.id === 'string' && typeof item.name === 'string' && Number.isFinite(item.lat) && Number.isFinite(item.lon))
    .slice(0, MAX_FAVOURITES)
}
