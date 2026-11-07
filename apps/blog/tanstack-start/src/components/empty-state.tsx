import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import type { ReactNode } from "react"

const tilt = "transition-transform duration-300 ease-out"

export function EmptyState({
  icon,
  title,
  subtitle,
  action,
}: {
  icon?: IconSvgElement
  title: string
  subtitle: string
  action?: ReactNode
}) {
  return (
    <div className="group flex flex-col items-center gap-6 px-6 py-20 text-center">
      {icon && (
        <div aria-hidden="true" className="relative size-20">
          <span
            className={`absolute inset-0 -rotate-6 rounded-3xl bg-fg/5 ring-1 ring-fg/5 ${tilt} motion-safe:group-hover:-translate-x-2 motion-safe:group-hover:-rotate-12`}
          />
          <span
            className={`absolute inset-0 rotate-6 rounded-3xl bg-fg/5 ring-1 ring-fg/5 ${tilt} motion-safe:group-hover:translate-x-2 motion-safe:group-hover:rotate-12`}
          />
          <span
            className={`absolute inset-0 flex items-center justify-center rounded-3xl bg-surface text-fg shadow-lg ring-1 ring-fg/10 ${tilt} motion-safe:group-hover:-translate-y-1`}
          >
            <HugeiconsIcon icon={icon} className="size-9" />
          </span>
        </div>
      )}
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-[510] text-fg">{title}</h2>
        <p className="text-sm text-muted">{subtitle}</p>
      </div>
      {action}
    </div>
  )
}
