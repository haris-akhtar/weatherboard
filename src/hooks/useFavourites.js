import { useCallback } from 'react'
import { MAX_FAVOURITES, addFavourite, removeFavourite, sanitizeFavourites } from '../utils/favourites.js'
import { KEYS, storage } from '../utils/storage.js'
import { useStoredState } from './useStoredState.js'

export function useFavourites() {
  const [favourites, setFavourites] = useStoredState(KEYS.favourites, [], sanitizeFavourites)

  /** Returns { ok, reason } so the caller can explain a refusal. */
  const add = useCallback(
    (city) => {
      const result = addFavourite(favourites, city)
      if (result.ok) setFavourites(result.list)
      return { ok: result.ok, reason: result.reason }
    },
    [favourites, setFavourites],
  )

  const remove = useCallback((id) => setFavourites((list) => removeFavourite(list, id)), [setFavourites])

  return {
    favourites,
    add,
    remove,
    isFavourite: (id) => favourites.some((item) => item.id === id),
    isFull: favourites.length >= MAX_FAVOURITES,
    persistent: storage.persistent,
  }
}
