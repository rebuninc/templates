import { useHydrated } from "@tanstack/react-router"
import { type Transition, useReducedMotion } from "motion/react"

export const spring: Transition = { type: "spring", duration: 0.4, bounce: 0 }

export const enter = {
  hidden: { opacity: 0, y: 8 },
  fade: { opacity: 0 },
  show: { opacity: 1, y: 0 },
}

// SSR HTML must stay visible, so entrances only run for client-side mounts.
// Reduced motion starts from "fade": MotionConfig alone still paints the first offset frame.
export function useEnterFrom() {
  const hydrated = useHydrated()
  const reduced = useReducedMotion()
  if (!hydrated) return false
  return reduced ? "fade" : "hidden"
}
