import { useCallback, useEffect, useState } from 'react'

/**
 * Chromium fires `beforeinstallprompt` when the app is installable. We hold the
 * event and offer our own Install button; other browsers install from their menu.
 */
export function useInstallPrompt() {
  const [event, setEvent] = useState(null)

  useEffect(() => {
    const capture = (e) => {
      e.preventDefault()
      setEvent(e)
    }
    const clear = () => setEvent(null)
    window.addEventListener('beforeinstallprompt', capture)
    window.addEventListener('appinstalled', clear)
    return () => {
      window.removeEventListener('beforeinstallprompt', capture)
      window.removeEventListener('appinstalled', clear)
    }
  }, [])

  const prompt = useCallback(async () => {
    if (!event) return
    await event.prompt()
    setEvent(null) // a captured prompt can only be used once
  }, [event])

  return { available: Boolean(event), prompt }
}
