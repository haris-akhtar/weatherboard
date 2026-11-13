/**
 * Provider-independent identity for a city. GeoDB and Open-Meteo use different
 * ids, so favourites and cached weather are keyed by rounded coordinates
 * (two decimals ≈ 1 km), which both providers agree on.
 */
export const cityIdFromCoords = (lat, lon) => `${lat.toFixed(2)},${lon.toFixed(2)}`

export const cityLabel = (city) => [city.name, city.region].filter(Boolean).join(', ')
