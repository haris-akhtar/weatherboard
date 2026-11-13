export const DEFAULT_REMINDER = { enabled: false, time: '07:30' }
export const PERIODIC_SYNC_TAG = 'daily-weather'

/** 'YYYY-MM-DD' in the device's own time zone. */
export function localDateKey(now = new Date()) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

/**
 * The browser, not us, decides when a periodic background sync runs. So each
 * time we are woken we ask: has today's reminder time passed, and have we not
 * already notified today? That gives at most one notification per day, at or
 * after the chosen time.
 */
export function isReminderDue(reminder, lastNotifiedDate, now = new Date()) {
  if (!reminder?.enabled || !reminder.time) return false
  if (lastNotifiedDate === localDateKey(now)) return false
  const [hours, minutes] = reminder.time.split(':').map(Number)
  return now.getHours() * 60 + now.getMinutes() >= hours * 60 + minutes
}
