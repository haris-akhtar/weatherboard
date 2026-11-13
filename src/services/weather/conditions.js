/**
 * Both providers are mapped onto one small vocabulary of condition "kinds" so
 * the UI (icons, tints) never needs to know which provider answered.
 *
 * kinds: clear | partly-cloudy | cloudy | fog | drizzle | rain | snow | thunderstorm
 */

// WMO weather interpretation codes, as used by Open-Meteo.
const WMO = {
  0: ['clear', 'Clear sky'],
  1: ['clear', 'Mainly clear'],
  2: ['partly-cloudy', 'Partly cloudy'],
  3: ['cloudy', 'Overcast'],
  45: ['fog', 'Fog'],
  48: ['fog', 'Freezing fog'],
  51: ['drizzle', 'Light drizzle'],
  53: ['drizzle', 'Drizzle'],
  55: ['drizzle', 'Heavy drizzle'],
  56: ['drizzle', 'Freezing drizzle'],
  57: ['drizzle', 'Heavy freezing drizzle'],
  61: ['rain', 'Light rain'],
  63: ['rain', 'Rain'],
  65: ['rain', 'Heavy rain'],
  66: ['rain', 'Freezing rain'],
  67: ['rain', 'Heavy freezing rain'],
  71: ['snow', 'Light snow'],
  73: ['snow', 'Snow'],
  75: ['snow', 'Heavy snow'],
  77: ['snow', 'Snow grains'],
  80: ['rain', 'Light showers'],
  81: ['rain', 'Showers'],
  82: ['rain', 'Violent showers'],
  85: ['snow', 'Snow showers'],
  86: ['snow', 'Heavy snow showers'],
  95: ['thunderstorm', 'Thunderstorm'],
  96: ['thunderstorm', 'Thunderstorm with hail'],
  99: ['thunderstorm', 'Thunderstorm with heavy hail'],
}

export function conditionFromWmo(code) {
  const [kind, label] = WMO[code] ?? ['cloudy', 'Unknown conditions']
  return { kind, label }
}

// OpenWeatherMap condition ids: https://openweathermap.org/weather-conditions
export function conditionFromOwm(id, description) {
  let kind = 'cloudy'
  if (id >= 200 && id < 300) kind = 'thunderstorm'
  else if (id >= 300 && id < 400) kind = 'drizzle'
  else if (id >= 500 && id < 600) kind = 'rain'
  else if (id >= 600 && id < 700) kind = 'snow'
  else if (id >= 700 && id < 800) kind = 'fog'
  else if (id === 800) kind = 'clear'
  else if (id === 801 || id === 802) kind = 'partly-cloudy'
  const text = description || 'Unknown conditions'
  return { kind, label: text.charAt(0).toUpperCase() + text.slice(1) }
}
