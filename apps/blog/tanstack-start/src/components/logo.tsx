export function LogoMark({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="14 17 75 75" aria-hidden="true">
      <path
        d="M24 88 V54 A24 24 0 0 1 48 30 H58"
        fill="none"
        strokeWidth="18"
        className="stroke-fg"
      />
      <rect x="66" y="66" width="22" height="22" fill="#FABE50" />
    </svg>
  )
}
