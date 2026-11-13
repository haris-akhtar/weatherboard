/**
 * Minimal key-value store on IndexedDB.
 *
 * The service worker cannot read localStorage, so the handful of values it
 * needs to build a notification (reminder settings, last city, units) are
 * mirrored here. Every call resolves — failures yield `undefined` / `false` —
 * because notifications are optional and must never break the app.
 */
const DB = 'weatherboard'
const STORE = 'kv'

function open() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB, 1)
    request.onupgradeneeded = () => request.result.createObjectStore(STORE)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function run(mode, action) {
  const db = await open()
  try {
    return await new Promise((resolve, reject) => {
      const request = action(db.transaction(STORE, mode).objectStore(STORE))
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  } finally {
    db.close()
  }
}

export const idbGet = (key) => run('readonly', (store) => store.get(key)).catch(() => undefined)

export const idbSet = (key, value) =>
  run('readwrite', (store) => store.put(value, key)).then(() => true, () => false)
