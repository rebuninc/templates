export function Heading({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string | null
}) {
  return (
    <div className="grid gap-3">
      <h1 className="text-5xl leading-none font-[510] tracking-[-0.022em] text-balance">
        {title}
      </h1>
      {subtitle && <p className="max-w-2xl text-muted">{subtitle}</p>}
    </div>
  )
}
