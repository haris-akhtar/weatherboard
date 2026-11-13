import { useEffect, useRef } from 'react'
import { Button } from './Button.jsx'

/**
 * Modal confirmation built on <dialog>, which provides the focus trap, Escape
 * to cancel, and inert background natively. Focus starts on Cancel so a stray
 * Enter never confirms a destructive action.
 */
export function ConfirmDialog({ open, title, children, confirmLabel, onConfirm, onCancel }) {
  const ref = useRef(null)

  useEffect(() => {
    const dialog = ref.current
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby="confirm-title"
      onCancel={(event) => {
        event.preventDefault()
        onCancel()
      }}
      onClick={(event) => {
        if (event.target === ref.current) onCancel() // click on the backdrop
      }}
      className="card m-auto w-[min(26rem,calc(100vw-2rem))] p-0 text-ink backdrop:bg-black/40"
    >
      <div className="p-5">
        <h2 id="confirm-title" className="text-base font-semibold">
          {title}
        </h2>
        <div className="mt-1.5 text-sm text-muted">{children}</div>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button autoFocus onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  )
}
