import { LoaderCircle, MapPin, Search } from 'lucide-react'
import { useId, useRef, useState } from 'react'
import { useCitySearch } from '../../hooks/useCitySearch.js'
import { cityLabel } from '../../utils/cityId.js'
import { describeError } from '../../utils/errors.js'
import { validateCityQuery } from '../../utils/validation.js'
import { Button } from '../ui/Button.jsx'

const FALLBACK_REASON = {
  config: 'GeoDB key not configured',
  'rate-limit': 'GeoDB is rate-limited',
  auth: 'GeoDB rejected the API key',
}

/**
 * City field with live suggestions, following the WAI-ARIA combobox pattern:
 * focus stays in the input and aria-activedescendant tracks the highlighted
 * option, so arrow keys, Enter and Escape all work without leaving the field.
 */
export function CitySearch({ selectedCity, online, onSelect }) {
  const id = useId()
  const listId = `${id}-list`
  const messageId = `${id}-message`
  const inputRef = useRef(null)

  const selectedLabel = selectedCity ? cityLabel(selectedCity) : ''
  const [query, setQuery] = useState(selectedLabel)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [validation, setValidation] = useState(null)

  // When the city changes from outside (a favourite was picked), mirror it in the field.
  const [syncedLabel, setSyncedLabel] = useState(selectedLabel)
  if (syncedLabel !== selectedLabel) {
    setSyncedLabel(selectedLabel)
    setQuery(selectedLabel)
    setValidation(null)
  }

  // Don't search for the text we put there ourselves after a selection.
  const isSelection = query !== '' && query === selectedLabel
  const search = useCitySearch(query, { enabled: online && !isSelection })
  const { cities } = search
  const active = Math.min(activeIndex, cities.length - 1)
  const showList = open && (search.status === 'loading' || search.status === 'success')

  function choose(city) {
    setQuery(cityLabel(city))
    setOpen(false)
    setValidation(null)
    onSelect(city)
  }

  function handleSubmit(event) {
    event.preventDefault()
    const error = validateCityQuery(query)
    if (error) {
      setValidation(error)
      inputRef.current?.focus()
      return
    }
    if (isSelection) return
    if (search.status === 'success') choose(cities[active])
    else setOpen(true) // still loading, or an error/empty message is already showing
  }

  function handleBlur() {
    setOpen(false)
    const error = validateCityQuery(query)
    if (error) setValidation(error)
    else if (!isSelection && search.status === 'success') {
      setValidation('Choose a city from the suggestions to load its weather.')
    }
  }

  function handleKeyDown(event) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!showList) return setOpen(true)
      if (!cities.length) return
      const step = event.key === 'ArrowDown' ? 1 : -1
      setActiveIndex((active + step + cities.length) % cities.length)
    } else if (event.key === 'Escape') {
      if (open) setOpen(false)
      else setQuery('')
    }
  }

  // One message at a time, most specific first.
  let message = null
  if (validation) {
    message = { tone: 'error', text: validation }
  } else if (!online && query && !isSelection) {
    message = { tone: 'warn', text: 'You’re offline, so city search is paused. Saved weather is still available; search resumes when you reconnect.' }
  } else if (search.status === 'empty') {
    message = { tone: 'error', text: `No cities match “${query.trim()}”. Check the spelling, or try a larger city nearby.` }
  } else if (search.status === 'error') {
    const { title, detail, action } = describeError(search.error, 'city search')
    message = { tone: 'error', text: `${title}. ${detail} ${action}`, retry: true }
  }

  return (
    <form role="search" noValidate onSubmit={handleSubmit} className="relative">
      <label htmlFor={id} className="sr-only">
        Search for a city
      </label>
      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-faint" />
          <input
            ref={inputRef}
            id={id}
            type="text"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={showList}
            aria-controls={listId}
            aria-activedescendant={showList && cities.length ? `${listId}-${active}` : undefined}
            aria-invalid={message?.tone === 'error' || undefined}
            aria-describedby={message ? messageId : undefined}
            autoComplete="off"
            spellCheck="false"
            enterKeyHint="search"
            placeholder="Search for a city…"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setValidation(null)
              setActiveIndex(0)
              setOpen(true)
            }}
            onFocus={(event) => {
              event.target.select()
              setOpen(true)
            }}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={`h-12 w-full rounded-xl border bg-surface pl-10 pr-10 text-base text-ink shadow-card outline-none transition-colors placeholder:text-faint focus:border-accent focus:ring-3 focus:ring-accent/15 ${
              message?.tone === 'error' ? 'border-danger' : 'border-line'
            }`}
          />
          {search.status === 'loading' && (
            <LoaderCircle aria-hidden="true" className="absolute right-3.5 top-1/2 size-4 -translate-y-1/2 animate-spin text-faint" />
          )}
        </div>
        <Button type="submit" variant="primary" className="h-12 rounded-xl px-5">
          Search
        </Button>
      </div>

      <ul
        id={listId}
        role="listbox"
        aria-label="City suggestions"
        hidden={!showList}
        // Keep focus in the input when a suggestion is pressed, so blur validation doesn't fire first.
        onMouseDown={(event) => event.preventDefault()}
        className="card absolute inset-x-0 top-full z-30 mt-2 max-h-[min(22rem,60dvh)] overflow-y-auto p-1.5"
      >
        {search.status === 'loading' &&
          [0, 1, 2].map((row) => (
            <li key={row} role="presentation" className="flex h-12 items-center gap-3 px-2.5">
              <span className="skeleton size-4" />
              <span className="skeleton h-3.5" style={{ width: `${55 - row * 12}%` }} />
            </li>
          ))}
        {search.status === 'success' &&
          cities.map((city, index) => (
            <li
              key={city.id}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === active}
              // mousemove, not mouseenter: a list opening under a resting pointer must not steal the highlight
              onMouseMove={() => index !== active && setActiveIndex(index)}
              onClick={() => choose(city)}
              className={`flex min-h-12 items-center gap-3 rounded-lg px-2.5 py-1.5 ${index === active ? 'bg-sunken' : ''}`}
            >
              <MapPin aria-hidden="true" className="size-4 shrink-0 text-faint" />
              <span className="min-w-0">
                <span className="block truncate font-medium text-ink">{city.name}</span>
                <span className="block truncate text-sm text-muted">
                  {[city.region, city.country].filter(Boolean).join(' · ')}
                </span>
              </span>
            </li>
          ))}
        {search.status === 'success' && (
          <li role="presentation" className="eyebrow border-t border-line px-2.5 pb-1 pt-2.5 normal-case tracking-normal">
            {search.fallbackFrom
              ? `${FALLBACK_REASON[search.fallbackFrom.kind] ?? 'GeoDB is unavailable'} — results from ${search.source}`
              : `Results from ${search.source}`}
          </li>
        )}
      </ul>

      {/* Announce result counts without moving focus. */}
      <p aria-live="polite" className="sr-only">
        {showList && search.status === 'loading' && 'Searching cities…'}
        {showList && search.status === 'success' && `${cities.length} cit${cities.length === 1 ? 'y' : 'ies'} found. Use the arrow keys to choose.`}
      </p>

      {message && (
        <p
          id={messageId}
          role={message.tone === 'error' ? 'alert' : 'status'}
          className={`mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm ${message.tone === 'error' ? 'text-danger' : 'text-warn'}`}
        >
          <span>{message.text}</span>
          {message.retry && (
            <button type="button" onClick={search.retry} className="-my-3 min-h-11 font-medium underline underline-offset-2">
              Retry search
            </button>
          )}
        </p>
      )}
    </form>
  )
}
