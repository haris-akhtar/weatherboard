import { WifiOff } from 'lucide-react'

export function OfflineBanner() {
  return (
    <div role="status" className="sticky top-0 z-40 border-b border-warn/25 bg-warn-soft px-4 py-2.5 text-sm text-ink">
      <p className="mx-auto flex max-w-[1240px] items-start gap-2.5 sm:px-2">
        <WifiOff aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-warn" />
        <span>
          <strong className="font-semibold">Offline mode.</strong> Showing weather saved on this device. Search
          and refresh resume automatically when you reconnect.
        </span>
      </p>
    </div>
  )
}
