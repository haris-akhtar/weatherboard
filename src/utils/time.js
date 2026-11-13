/**
 * Times are shown in the *city's* local time, not the viewer's. Providers give
 * us a UTC offset in seconds; we shift the instant and read it back as UTC.
 */
const shifted = (ms, utcOffsetSeconds) => new Date(ms + utcOffsetSeconds * 1000)

/** 'YYYY-MM-DD' for the given instant in the city's local time. */
export const dateKey = (ms, utcOffsetSeconds) => shifted(ms, utcOffsetSeconds).toISOString().slice(0, 10)

const timeFormat = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })
const weekdayFormat = new Intl.DateTimeFormat(undefined, { weekday: 'short', timeZone: 'UTC' })
const dayMonthFormat = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', timeZone: 'UTC' })

export const formatCityTime = (ms, utcOffsetSeconds) => timeFormat.format(shifted(ms, utcOffsetSeconds))

/** Labels for a 'YYYY-MM-DD' forecast date. */
export function describeDay(date, todayKey) {
  const day = new Date(`${date}T00:00:00Z`)
  return {
    weekday: date === todayKey ? 'Today' : weekdayFormat.format(day),
    dayMonth: dayMonthFormat.format(day),
  }
}

/** "5 min ago"-style label in the viewer's locale. */
export function formatRelative(ms, now = Date.now()) {
  const minutes = Math.round((now - ms) / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} h ago`
  const days = Math.round(hours / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}

const localStamp = new Intl.DateTimeFormat(undefined, {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})
/** Absolute timestamp in the viewer's own time zone. */
export const formatLocalStamp = (ms) => localStamp.format(new Date(ms))
