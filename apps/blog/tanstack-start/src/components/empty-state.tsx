import { News01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

const tilt = "transition-transform duration-300 ease-out"

export function EmptyState({
  title,
  subtitle,
}: {
  title: string
  subtitle: string
}) {
  return (
    <div className="group flex flex-col items-center gap-6 px-6 py-20 text-center">
      <div aria-hidden="true" className="relative size-20">
        <span
          className={`absolute inset-0 -rotate-6 rounded-3xl bg-fg/5 ring-1 ring-fg/5 ${tilt} motion-safe:group-hover:-translate-x-2 motion-safe:group-hover:-rotate-12`}
        />
        <span
          className={`absolute inset-0 rotate-6 rounded-3xl bg-fg/5 ring-1 ring-fg/5 ${tilt} motion-safe:group-hover:translate-x-2 motion-safe:group-hover:rotate-12`}
        />
        <span
          className={`absolute inset-0 flex items-center justify-center rounded-3xl bg-island text-fg shadow-lg ring-1 ring-fg/10 ${tilt} motion-safe:group-hover:-translate-y-1`}
        >
          <HugeiconsIcon icon={News01Icon} className="size-9" />
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-3xl font-[510] text-fg">{title}</p>
        <p className="text-sm text-muted">{subtitle}</p>
      </div>
    </div>
  )
}
