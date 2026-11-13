const COLORS = { ok: 'bg-ok', warn: 'bg-warn', idle: 'bg-faint', danger: 'bg-danger' }

/** Small status light. `pulse` adds a soft halo for "live". */
export function StatusDot({ tone = 'idle', pulse = false }) {
  return (
    <span aria-hidden="true" className="relative inline-flex size-2 shrink-0">
      {pulse && <span className={`absolute inset-0 animate-ping rounded-full opacity-50 ${COLORS[tone]}`} />}
      <span className={`relative size-2 rounded-full ${COLORS[tone]}`} />
    </span>
  )
}
