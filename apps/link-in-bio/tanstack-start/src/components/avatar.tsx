export function Avatar({
  src,
  name,
  className = "size-24 text-3xl",
}: {
  src: string | null
  name: string
  className?: string
}) {
  return src ? (
    <img
      src={src}
      alt=""
      className={`rounded-full border border-line object-cover ${className}`}
    />
  ) : (
    <span
      aria-hidden="true"
      className={`grid place-items-center rounded-full bg-(--accent) font-[590] text-white uppercase ${className}`}
    >
      {name.charAt(0)}
    </span>
  )
}
