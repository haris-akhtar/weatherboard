import { fetchJson } from '../http.js'
import { cityIdFromCoords } from '../../utils/cityId.js'

export const OPEN_METEO_GEOCODING = 'Open-Meteo Geocoding'

export async function searchOpenMeteoCities(query, { signal, limit = 6 } = {}) {
  const params = new URLSearchParams({ name: query, count: String(limit), language: 'en', format: 'json' })
  const { data } = await fetchJson(`https://geocoding-api.open-meteo.com/v1/search?${params}`, {
    signal,
    provider: OPEN_METEO_GEOCODING,
  })
  return (data.results ?? []).map((item) => ({
    id: cityIdFromCoords(item.latitude, item.longitude),
    name: item.name,
    region: item.admin1 ?? '',
    country: item.country ?? '',
    countryCode: item.country_code ?? '',
    lat: item.latitude,
    lon: item.longitude,
  }))
}
