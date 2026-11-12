import { useHydrated } from "@tanstack/react-router"
import { useEffect, useState } from "react"

const UNITS = [
  { label: "dias", ms: 86_400_000 },
  { label: "horas", ms: 3_600_000 },
  { label: "min", ms: 60_000 },
  { label: "seg", ms: 1000 },
]

const launchDate = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    timeZone: "America/Sao_Paulo",
  })

function split(left: number) {
  let rest = Math.max(0, left)
  return UNITS.map((unit) => {
    const value = Math.floor(rest / unit.ms)
    rest -= value * unit.ms
    return { label: unit.label, value }
  })
}

export function Countdown({ to }: { to: string }) {
  const target = new Date(to).getTime()
  const hydrated = useHydrated()
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  // After launch there is nothing left to count.
  if (target <= now) return null
  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-xs font-semibold tracking-[0.14em] text-faint uppercase">
        Lançamento em {launchDate(to)}
      </p>
      {/* The ticking digits are visual only; the date above is the readable version. */}
      <div aria-hidden="true" className="flex items-start gap-2 sm:gap-3">
        {split(target - now).map((part, i) => (
          <div key={part.label} className="flex items-start gap-2 sm:gap-3">
            {i > 0 && (
              <span className="pt-3 text-2xl font-bold text-line sm:text-3xl">
                :
              </span>
            )}
            <div className="flex w-16 flex-col items-center gap-1 rounded-2xl border border-line bg-panel py-3 sm:w-20">
              <span className="h-9 overflow-hidden text-3xl leading-9 font-extrabold tabular-nums sm:h-10 sm:text-4xl sm:leading-10">
                {hydrated ? (
                  <span key={part.value} className="block animate-tick">
                    {String(part.value).padStart(2, "0")}
                  </span>
                ) : (
                  <span className="block text-faint">--</span>
                )}
              </span>
              <span className="text-[10px] font-semibold tracking-[0.14em] text-faint uppercase">
                {part.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
