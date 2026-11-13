import { KEYS, storage } from './storage.js'

// Last-viewed city plus the favourites.
const MAX_SNAPSHOTS = 6

/**
 * The most recent successful report per city, so the last-viewed city (and
 * recently opened favourites) can be restored offline.
 */
export function readSnapshot(cityId) {
  const report = storage.get(KEYS.snapshots, {})?.[cityId]
  return report?.current && Array.isArray(report.daily) ? report : null
}

export function saveSnapshot(cityId, report) {
  const all = { ...storage.get(KEYS.snapshots, {}), [cityId]: report }
  const newest = Object.entries(all)
    .sort(([, a], [, b]) => b.fetchedAt - a.fetchedAt)
    .slice(0, MAX_SNAPSHOTS)
  storage.set(KEYS.snapshots, Object.fromEntries(newest))
}
