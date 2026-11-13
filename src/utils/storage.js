/**
 * localStorage with a safety net. Private browsing modes, blocked cookies and
 * full quotas all make localStorage throw; when that happens we keep values in
 * memory so the app works for the session, and expose `persistent: false` so
 * the UI can say that nothing will be remembered.
 */
function probe() {
  try {
    const key = '__wb_probe__'
    window.localStorage.setItem(key, '1')
    window.localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}

const memory = new Map()

export const storage = {
  persistent: typeof window !== 'undefined' && probe(),

  get(key, fallback = null) {
    if (memory.has(key)) return memory.get(key)
    if (!this.persistent) return fallback
    try {
      const raw = window.localStorage.getItem(key)
      return raw === null ? fallback : JSON.parse(raw)
    } catch {
      return fallback // unreadable or corrupted entry
    }
  },

  /** Returns false when the value could not be persisted (it is still kept in memory). */
  set(key, value) {
    if (this.persistent) {
      try {
        window.localStorage.setItem(key, JSON.stringify(value))
        memory.delete(key)
        return true
      } catch {
        // quota exceeded or storage revoked mid-session — fall through to memory
      }
    }
    memory.set(key, value)
    return false
  },
}

export const KEYS = {
  favourites: 'wb:favourites',
  lastCity: 'wb:last-city',
  snapshots: 'wb:weather-snapshots',
  theme: 'wb:theme',
  units: 'wb:units',
  reminder: 'wb:reminder',
}
