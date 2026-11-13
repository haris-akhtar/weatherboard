import { useCallback, useState } from 'react'
import { storage } from '../utils/storage.js'

/** useState that is mirrored to localStorage (or memory when storage is unavailable). */
export function useStoredState(key, initialValue, sanitize = (value) => value) {
  const [value, setValue] = useState(() => sanitize(storage.get(key, initialValue)))

  const update = useCallback(
    (next) => {
      setValue((previous) => {
        const resolved = typeof next === 'function' ? next(previous) : next
        storage.set(key, resolved)
        return resolved
      })
    },
    [key],
  )

  return [value, update]
}
