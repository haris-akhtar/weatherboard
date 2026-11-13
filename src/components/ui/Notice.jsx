import { CircleAlert, Info, TriangleAlert } from 'lucide-react'

const TONES = {
  info: { icon: Info, box: 'border-line bg-sunken', iconColor: 'text-muted' },
  warn: { icon: TriangleAlert, box: 'border-warn/25 bg-warn-soft', iconColor: 'text-warn' },
  error: { icon: CircleAlert, box: 'border-danger/25 bg-danger-soft', iconColor: 'text-danger' },
}

/**
 * Inline status message: what happened (title), why (children), and optionally
 * what to do about it (action). Errors are announced to screen readers.
 */
export function Notice({ tone = 'info', title, children, action, className = '' }) {
  const { icon: Icon, box, iconColor } = TONES[tone]
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-3 rounded-xl border p-3.5 text-sm ${box} ${className}`}
    >
      <Icon aria-hidden="true" className={`mt-0.5 size-4 shrink-0 ${iconColor}`} />
      <div className="min-w-0 flex-1">
        {title && <p className="font-medium text-ink">{title}</p>}
        {children && <div className="text-muted">{children}</div>}
      </div>
      {action}
    </div>
  )
}
