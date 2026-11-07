import type { ComponentProps } from "react"

const variants = {
  pill: "h-12 rounded-full border border-field-line bg-field px-5 text-fg outline-none placeholder:text-muted focus:border-muted",
  field:
    "rounded-lg border border-line bg-surface px-3.5 py-2.5 text-fg outline-none placeholder:text-muted focus:border-muted file:mr-3 file:rounded-full file:border-0 file:bg-fg file:px-3 file:py-1 file:text-sm file:text-bg",
}

// Text fields must show a placeholder; file inputs ignore it.
type InputProps = Omit<ComponentProps<"input">, "placeholder"> &
  ({ type: "file"; placeholder?: never } | { placeholder: string }) & {
    variant?: keyof typeof variants
  }

export function Input({
  variant = "field",
  className = "",
  ...props
}: InputProps) {
  return <input {...props} className={`${variants[variant]} ${className}`} />
}

export function Textarea({
  className = "",
  ...props
}: ComponentProps<"textarea"> & { placeholder: string }) {
  return <textarea {...props} className={`${variants.field} ${className}`} />
}
