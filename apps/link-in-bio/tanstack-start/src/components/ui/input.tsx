import type { ComponentProps } from "react"

// Same border, spring, focus ring and disabled state as the Checkbox.
const base =
  "border-2 border-fg/20 text-fg outline-none transition-[border-color,box-shadow] duration-500 ease-[cubic-bezier(0.34,1.8,0.64,1)] placeholder:text-muted focus-visible:border-fg focus-visible:ring-4 focus-visible:ring-muted/50 disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none"

const variants = {
  pill: `${base} h-12 rounded-full bg-field px-5`,
  field: `${base} rounded-field bg-surface px-3.5 py-2.5`,
}

type InputProps = ComponentProps<"input"> & {
  placeholder: string
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
