import { fetchJson } from '../http.js'
import { cityIdFromCoords } from '../../utils/cityId.js'

const KEY = import.meta.env.VITE_RAPIDAPI_KEY
const HOST = import.meta.env.VITE_RAPIDAPI_HOST || 'wft-geo-db.p.rapidapi.com'

export const GEODB = 'GeoDB Cities'
export const hasGeoDbKey = Boolean(KEY)

export async function searchGeoDb(query, { signal, limit = 6 } = {}) {
  const params = new URLSearchParams({
    namePrefix: query,
    limit: String(limit),
    sort: '-population',
    types: 'CITY',
  })
  const { data } = await fetchJson(`https://${HOST}/v1/geo/cities?${params}`, {
    signal,
    provider: GEODB,
    headers: { 'X-RapidAPI-Key': KEY, 'X-RapidAPI-Host': HOST },
  })
  return (data.data ?? []).map((item) => ({
    id: cityIdFromCoords(item.latitude, item.longitude),
    name: item.name,
    region: item.region ?? '',
    country: item.country ?? '',
    countryCode: item.countryCode ?? '',
    lat: item.latitude,
    lon: item.longitude,
  }))
}
