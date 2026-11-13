import { useCallback, useEffect, useState } from 'react'
import { idbSet } from '../utils/idb.js'
import { DEFAULT_REMINDER, PERIODIC_SYNC_TAG } from '../utils/reminder.js'
import { KEYS } from '../utils/storage.js'
import { useStoredState } from './useStoredState.js'

const supported =
  typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator

const HALF_DAY_MS = 12 * 60 * 60 * 1000

/**
 * Register (or remove) the periodic background sync that wakes the service
 * worker when no tab is open, and report what the browser actually allows:
 *  'active'         registered — Chromium will wake the installed app
 *  'needs-install'  API exists but permission is only granted to installed PWAs
 *  'unsupported'    no Periodic Background Sync (Firefox, Safari)
 *  'no-worker'      no service worker registration (e.g. the dev server)
 */
async function syncBackgroundDelivery(enabled) {
  const registration = await navigator.serviceWorker.getRegistration()
  if (!registration) return 'no-worker'
  if (!('periodicSync' in registration)) return 'unsupported'
  if (!enabled) {
    await registration.periodicSync.unregister(PERIODIC_SYNC_TAG)
    return 'needs-install'
  }
  const status = await navigator.permissions.query({ name: 'periodic-background-sync' })
  if (status.state !== 'granted') return 'needs-install'
  await registration.periodicSync.register(PERIODIC_SYNC_TAG, { minInterval: HALF_DAY_MS })
  return 'active'
}

function sanitizeReminder(value) {
  return {
    enabled: Boolean(value?.enabled),
    time: typeof value?.time === 'string' ? value.time : DEFAULT_REMINDER.time,
  }
}

export function useReminder() {
  const [permission, setPermission] = useState(supported ? Notification.permission : 'unsupported')
  const [reminder, setReminder] = useStoredState(KEYS.reminder, DEFAULT_REMINDER, sanitizeReminder)
  const [background, setBackground] = useState('checking')

  // A reminder only counts as on while permission is still granted — the user
  // can revoke it in browser settings at any time.
  const enabled = reminder.enabled && permission === 'granted'

  // Keep the service worker's copy and the background registration in step.
  useEffect(() => {
    if (!supported) return
    let cancelled = false
    idbSet('reminder', { enabled, time: reminder.time })
    syncBackgroundDelivery(enabled)
      .catch(() => 'unsupported')
      .then((state) => {
        if (!cancelled) setBackground(state)
      })
    return () => {
      cancelled = true
    }
  }, [enabled, reminder.time])

  // Notice permission changes made in browser settings while the app is open.
  useEffect(() => {
    if (!supported || !navigator.permissions) return
    let status
    const update = () => setPermission(Notification.permission)
    navigator.permissions
      .query({ name: 'notifications' })
      .then((result) => {
        status = result
        status.addEventListener('change', update)
      })
      .catch(() => {}) // Permissions API lacks 'notifications' in some browsers; not needed there.
    return () => status?.removeEventListener('change', update)
  }, [])

  /** Shows the browser permission prompt. Call only after explaining why. */
  const enable = useCallback(async () => {
    const result = await Notification.requestPermission()
    setPermission(result)
    if (result === 'granted') setReminder((current) => ({ ...current, enabled: true }))
    return result
  }, [setReminder])

  const disable = useCallback(() => setReminder((current) => ({ ...current, enabled: false })), [setReminder])
  const setTime = useCallback((time) => setReminder((current) => ({ ...current, time })), [setReminder])

  /** Ask the service worker for a notification now. Resolves to { ok, message }. */
  const sendTest = useCallback(async () => {
    const registration = await navigator.serviceWorker.getRegistration()
    if (!registration?.active) {
      return { ok: false, message: 'The service worker isn’t running yet. Reload the page and try again (it only runs in the production build, not the dev server).' }
    }
    return new Promise((resolve) => {
      const channel = new MessageChannel()
      const timer = setTimeout(
        () => resolve({ ok: false, message: 'The service worker didn’t respond. Reload the page and try again.' }),
        15_000,
      )
      channel.port1.onmessage = (event) => {
        clearTimeout(timer)
        resolve(
          event.data.ok
            ? { ok: true, message: 'Sent — check your notifications.' }
            : { ok: false, message: `The browser refused to show the notification: ${event.data.message}` },
        )
      }
      registration.active.postMessage({ type: 'SHOW_TEST_NOTIFICATION' }, [channel.port2])
    })
  }, [])

  return { supported, permission, enabled, time: reminder.time, background, enable, disable, setTime, sendTest }
}
