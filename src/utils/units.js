/** Reports are stored in metric; these convert for display only. */
const toF = (c) => (c * 9) / 5 + 32

export const formatTemp = (celsius, units) => `${Math.round(units === 'imperial' ? toF(celsius) : celsius)}°`

export const tempUnitLabel = (units) => (units === 'imperial' ? '°F' : '°C')

export function formatWind(metresPerSecond, units) {
  return units === 'imperial'
    ? { value: Math.round(metresPerSecond * 2.23694), unit: 'mph' }
    : { value: Math.round(metresPerSecond * 3.6), unit: 'km/h' }
}

export function formatVisibility(metres, units) {
  if (metres == null) return null
  const distance = units === 'imperial' ? metres / 1609.344 : metres / 1000
  return {
    value: distance >= 10 ? Math.round(distance) : Math.round(distance * 10) / 10,
    unit: units === 'imperial' ? 'mi' : 'km',
  }
}

const COMPASS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
export const compassPoint = (degrees) => (degrees == null ? null : COMPASS[Math.round(degrees / 45) % 8])

/** Colour for a temperature in °C — cool blue through warm red. Used by the range bars. */
const STOPS = [
  [-10, [91, 141, 239]],
  [5, [86, 190, 201]],
  [18, [132, 200, 120]],
  [26, [240, 190, 70]],
  [33, [240, 138, 75]],
  [42, [226, 72, 77]],
]
export function tempColor(celsius) {
  if (celsius <= STOPS[0][0]) return `rgb(${STOPS[0][1].join(' ')})`
  for (let i = 1; i < STOPS.length; i++) {
    const [t1, c1] = STOPS[i]
    if (celsius <= t1) {
      const [t0, c0] = STOPS[i - 1]
      const k = (celsius - t0) / (t1 - t0)
      return `rgb(${c0.map((v, j) => Math.round(v + (c1[j] - v) * k)).join(' ')})`
    }
  }
  return `rgb(${STOPS.at(-1)[1].join(' ')})`
}
