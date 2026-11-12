import { useRouterState } from "@tanstack/react-router"
import { useEffect, useState } from "react"

const FADE_OUT_MS = 200

export function NavigationProgress() {
  const isLoading = useRouterState({
    select: (state) => state.status === "pending",
  })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isLoading) {
      setIsVisible(true)
      return
    }
    const timer = setTimeout(() => setIsVisible(false), FADE_OUT_MS)
    return () => clearTimeout(timer)
  }, [isLoading])

  if (!isLoading && !isVisible) return null

  return (
    <div
      aria-hidden="true"
      data-navigation-progress
      className={`pointer-events-none fixed inset-x-0 top-0 z-50 h-[3px] overflow-hidden bg-fg/20 transition-opacity duration-200 ${isLoading ? "opacity-100" : "opacity-0"}`}
    >
      <div className="absolute inset-y-0 animate-progress-primary bg-fg" />
      <div className="absolute inset-y-0 animate-progress-secondary bg-fg" />
    </div>
  )
}
