import type { ComponentProps } from "react"

const variants = {
  primary: "bg-fg text-bg",
  secondary: "border border-line text-fg hover:bg-surface",
}

export function Button({
  variant = "primary",
  loading = false,
  disabled,
  className = "",
  children,
  ...props
}: ComponentProps<"button"> & {
  variant?: keyof typeof variants
  loading?: boolean
}) {
  // opacity-0, not invisible: keeps the size and the accessible name.
  return (
    <button
      {...props}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`press relative flex h-12 items-center justify-center gap-2 rounded-full px-5 text-sm font-[510] disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      <span
        className={`flex items-center justify-center gap-2 ${loading ? "opacity-0" : ""}`}
      >
        {children}
      </span>
      {loading ? (
        <span
          aria-hidden
          data-spinner
          className="absolute size-4 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none"
        />
      ) : null}
    </button>
  )
}
