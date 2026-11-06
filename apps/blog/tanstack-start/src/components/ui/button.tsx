import type { ComponentProps } from "react"

const variants = {
  primary: "bg-fg text-bg",
  secondary: "border border-line text-fg hover:bg-surface",
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: keyof typeof variants }) {
  return (
    <button
      {...props}
      className={`press flex h-10 items-center justify-center gap-2 rounded-full px-5 text-sm font-[510] disabled:opacity-50 ${variants[variant]} ${className}`}
    />
  )
}
