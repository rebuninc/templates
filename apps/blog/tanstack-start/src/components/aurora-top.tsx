import Aurora from "@/components/aurora"

// Decorative: kept out of the accessibility tree.
export function AuroraTop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 opacity-60"
    >
      <Aurora colorStops={["#3A29FF", "#FF94B4", "#FF3232"]} amplitude={1} />
    </div>
  )
}
