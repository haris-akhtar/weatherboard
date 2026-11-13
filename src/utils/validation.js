export const MIN_QUERY_LENGTH = 2
const MAX_QUERY_LENGTH = 80

/** Returns an error message for the city field, or null when the value can be searched. */
export function validateCityQuery(value) {
  const query = value.trim()
  if (!query) return 'Enter a city name to see its weather.'
  if (!/\p{L}/u.test(query)) return 'City names contain letters — try something like “Lahore” or “Lisbon”.'
  if (query.length < MIN_QUERY_LENGTH) return `Type at least ${MIN_QUERY_LENGTH} letters to search.`
  if (query.length > MAX_QUERY_LENGTH) return `That’s too long for a city name — keep it under ${MAX_QUERY_LENGTH} characters.`
  return null
}

/** Returns an error message for the reminder time field, or null when valid. */
export function validateReminderTime(value) {
  if (!value) return 'Choose a time for your daily reminder.'
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return 'Enter the time as hours and minutes, for example 07:30.'
  return null
}
