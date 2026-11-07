import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"
import { Tick02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

export function Checkbox({
  className = "",
  ...props
}: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      className={`group flex size-5 shrink-0 items-center justify-center rounded-md border-2 border-fg/20 outline-none transition-[background-color,border-color,box-shadow,scale] duration-500 ease-[cubic-bezier(0.34,1.8,0.64,1)] active:scale-75 focus-visible:ring-4 focus-visible:ring-muted/50 data-checked:border-fg data-checked:bg-fg data-checked:text-bg data-checked:ring-[6px] data-checked:ring-fg/10 data-disabled:cursor-not-allowed data-disabled:opacity-40 motion-reduce:transition-none ${className}`}
      {...props}
    >
      <CheckboxPrimitive.Indicator keepMounted>
        <HugeiconsIcon
          icon={Tick02Icon}
          className="size-3.5 -rotate-45 scale-0 opacity-0 transition-[scale,rotate,opacity] duration-500 ease-[cubic-bezier(0.34,1.8,0.64,1)] group-data-checked:rotate-0 group-data-checked:scale-100 group-data-checked:opacity-100 motion-reduce:transition-none"
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}
