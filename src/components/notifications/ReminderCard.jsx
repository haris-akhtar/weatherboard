import { BellOff, BellRing } from 'lucide-react'
import { useId, useState } from 'react'
import { useReminder } from '../../hooks/useReminder.js'
import { validateReminderTime } from '../../utils/validation.js'
import { Button } from '../ui/Button.jsx'
import { Notice } from '../ui/Notice.jsx'
import { StatusDot } from '../ui/StatusDot.jsx'

/**
 * What the browser will really do when the app is closed. Stated plainly:
 * without a push server, only Chromium's Periodic Background Sync can wake an
 * installed app, and it does not promise an exact time.
 */
const DELIVERY = {
  checking: { tone: 'idle', label: 'Checking what this browser supports…' },
  active: {
    tone: 'ok',
    label: 'Background delivery is on',
    detail: (time) =>
      `Your browser wakes WeatherBoard about once a day, even when it’s closed. Expect the reminder at or after ${time}; the exact minute is up to the browser.`,
  },
  'needs-install': {
    tone: 'warn',
    label: 'Install WeatherBoard to receive reminders',
    detail: () =>
      'This browser only delivers reminders in the background for installed apps. Install WeatherBoard from the browser menu; until then, no reminder will arrive on its own.',
  },
  unsupported: {
    tone: 'warn',
    label: 'This browser can’t deliver scheduled reminders',
    detail: () =>
      'Sending a notification while the app is closed needs either a push server (WeatherBoard has no backend) or background sync, which only Chrome, Edge and other Chromium browsers offer. Your time is saved, and test notifications work, but nothing will arrive on its own here.',
  },
  'no-worker': {
    tone: 'warn',
    label: 'Service worker not running',
    detail: () => 'Reminders need the service worker, which only runs in the production build. Reload the page if this is the live site.',
  },
}

function TimeField({ time, onCommit }) {
  const id = useId()
  const [draft, setDraft] = useState(time)
  const [error, setError] = useState(null)

  function commit(value) {
    const problem = validateReminderTime(value)
    setError(problem)
    if (!problem && value !== time) onCommit(value)
  }

  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">
        Reminder time
      </label>
      <input
        id={id}
        type="time"
        required
        value={draft}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => {
          setDraft(event.target.value)
          // A complete value is saved immediately; an incomplete one is flagged on blur.
          if (!validateReminderTime(event.target.value)) commit(event.target.value)
        }}
        onBlur={(event) => commit(event.target.value)}
        className={`tnum mt-1.5 block h-11 w-full rounded-lg border bg-surface px-3 text-base text-ink outline-none focus:border-accent focus:ring-3 focus:ring-accent/15 ${
          error ? 'border-danger' : 'border-line-strong'
        }`}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm text-danger">
          {error} Your last valid time ({time}) is still in use.
        </p>
      )}
    </div>
  )
}

export function ReminderCard() {
  const reminder = useReminder()
  const [explaining, setExplaining] = useState(false)
  const [busy, setBusy] = useState(false)
  const [testResult, setTestResult] = useState(null)
  const delivery = DELIVERY[reminder.background]

  async function allow() {
    setBusy(true)
    try {
      await reminder.enable()
    } finally {
      setBusy(false)
      setExplaining(false)
    }
  }

  async function sendTest() {
    setBusy(true)
    setTestResult(null)
    try {
      setTestResult(await reminder.sendTest())
    } catch {
      setTestResult({ ok: false, message: 'The test notification could not be sent. Reload the page and try again.' })
    } finally {
      setBusy(false)
    }
  }

  let body
  if (!reminder.supported) {
    body = (
      <Notice tone="info" title="Not available in this browser">
        This browser doesn’t support web notifications, so reminders are off. Everything else in WeatherBoard
        works as normal. On iPhone and iPad, add WeatherBoard to your Home Screen first.
      </Notice>
    )
  } else if (reminder.permission === 'denied') {
    body = (
      <Notice tone="warn" title="Notifications are blocked">
        You (or your browser) declined notifications for this site, so WeatherBoard can’t ask again. To turn
        reminders on, open the site settings from the address bar, set Notifications to “Allow”, then reload.
        Nothing else is affected.
      </Notice>
    )
  } else if (reminder.enabled) {
    body = (
      <div className="grid gap-4">
        <TimeField time={reminder.time} onCommit={reminder.setTime} />
        <div className="rounded-xl border border-line bg-sunken p-3.5 text-sm">
          <p className="flex items-center gap-2 font-medium">
            <StatusDot tone={delivery.tone} />
            {delivery.label}
          </p>
          {delivery.detail && <p className="mt-1 text-muted">{delivery.detail(reminder.time)}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={sendTest} disabled={busy}>
            Send test notification
          </Button>
          <Button variant="ghost" onClick={reminder.disable}>
            Turn off
          </Button>
        </div>
        {testResult && (
          <p role="status" className={`text-sm ${testResult.ok ? 'text-ok' : 'text-danger'}`}>
            {testResult.message}
          </p>
        )}
      </div>
    )
  } else if (explaining) {
    // Shown *before* the browser's own prompt, so the request has context.
    body = (
      <div className="grid gap-3 text-sm">
        <p className="font-medium">Before your browser asks for permission</p>
        <ul className="grid list-disc gap-1.5 pl-5 text-muted">
          <li>WeatherBoard sends one notification a day: the weather for your last-viewed city.</li>
          <li>It’s used for nothing else. No marketing, no alerts you didn’t ask for.</li>
          <li>You choose the time, and you can turn it off here whenever you like.</li>
        </ul>
        <p className="text-muted">Next, your browser will show its own “Allow notifications?” prompt.</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" onClick={allow} disabled={busy}>
            Continue
          </Button>
          <Button variant="ghost" onClick={() => setExplaining(false)} disabled={busy}>
            Not now
          </Button>
        </div>
      </div>
    )
  } else {
    body = (
      <div className="grid gap-3">
        <p className="text-sm text-muted">Get a short weather summary for your last-viewed city each morning.</p>
        <Button
          className="justify-self-start"
          // Already granted earlier: no browser prompt will appear, so skip the explanation.
          onClick={reminder.permission === 'granted' ? allow : () => setExplaining(true)}
          disabled={busy}
        >
          Set up daily reminder
        </Button>
      </div>
    )
  }

  const Icon = reminder.enabled ? BellRing : BellOff
  return (
    <section aria-labelledby="reminder-heading" className="card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 id="reminder-heading" className="eyebrow">
          Daily reminder
        </h2>
        <Icon aria-hidden="true" className={`size-4 ${reminder.enabled ? 'text-ink' : 'text-faint'}`} />
      </div>
      {body}
    </section>
  )
}
