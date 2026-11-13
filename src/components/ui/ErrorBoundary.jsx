import { Component } from 'react'

/** Last line of defence: a render crash shows a recoverable message, not a blank page. */
export class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('WeatherBoard crashed while rendering', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-3 p-6">
        <p className="eyebrow">WeatherBoard</p>
        <h1 className="text-xl font-semibold">The app hit a display error</h1>
        <p className="text-muted">
          Something in the interface failed to render. Your favourites and saved weather are safe. Reloading
          usually fixes it.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-2 min-h-11 self-start rounded-lg bg-ink px-4 font-medium text-bg"
        >
          Reload WeatherBoard
        </button>
      </main>
    )
  }
}
