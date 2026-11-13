const VARIANTS = {
  primary: 'bg-ink text-bg hover:opacity-90',
  secondary: 'border border-line-strong bg-surface text-ink hover:bg-sunken',
  ghost: 'text-muted hover:bg-sunken hover:text-ink',
  danger: 'bg-danger text-white hover:opacity-90',
}

/** All buttons meet the 44 px touch-target minimum via min-h-11. */
export function Button({ variant = 'secondary', className = '', type = 'button', ...props }) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-[background-color,opacity] disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  )
}

/** Square icon-only button. `label` is required: it is the accessible name. */
export function IconButton({ label, className = '', type = 'button', children, ...props }) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={`inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-sunken hover:text-ink disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
