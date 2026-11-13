import { useSyncExternalStore } from 'react'

function subscribe(callback) {
  window.addEventListener('online', callback)
  window.addEventListener('offline', callback)
  return () => {
    window.removeEventListener('online', callback)
    window.removeEventListener('offline', callback)
  }
}

/**
 * navigator.onLine is reliable for "definitely offline" but can report true on
 * a dead connection. Failed requests are therefore handled separately as
 * network errors; this hook only drives the offline banner and skips requests
 * that cannot succeed.
 */
export function useOnlineStatus() {
  return useSyncExternalStore(subscribe, () => navigator.onLine, () => true)
}
