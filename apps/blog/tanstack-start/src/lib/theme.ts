import { useSyncExternalStore } from "react"

export type Theme = "light" | "dark"

// Inline in <head> so the theme is set before the first paint; follows the system until a choice is saved.
export const themeScript = `(() => {
  const system = matchMedia("(prefers-color-scheme: light)")
  const apply = () => {
    let saved = null
    try { saved = localStorage.getItem("theme") } catch {}
    document.documentElement.dataset.theme = saved || (system.matches ? "light" : "dark")
  }
  apply()
  system.addEventListener("change", apply)
})()`

export const getTheme = (): Theme =>
  document.documentElement.dataset.theme === "light" ? "light" : "dark"

export function subscribeTheme(callback: () => void) {
  const observer = new MutationObserver(callback)
  observer.observe(document.documentElement, {
    attributeFilter: ["data-theme"],
  })
  return () => observer.disconnect()
}

export const useTheme = () =>
  useSyncExternalStore(subscribeTheme, getTheme, (): Theme => "dark")

export async function toggleTheme(origin: HTMLElement) {
  const root = document.documentElement
  const next: Theme = getTheme() === "light" ? "dark" : "light"
  try {
    localStorage.setItem("theme", next)
  } catch {
    // Storage blocked: the choice lasts only for this page.
  }
  const apply = () => {
    root.dataset.theme = next
  }
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches
  if (!document.startViewTransition || still) return apply()

  const { left, top, width, height } = origin.getBoundingClientRect()
  const x = left + width / 2
  const y = top + height / 2
  const radius = Math.hypot(
    Math.max(x, innerWidth - x),
    Math.max(y, innerHeight - y),
  )
  const transition = document.startViewTransition(apply)
  await transition.ready
  root.animate(
    {
      clipPath: [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${radius}px at ${x}px ${y}px)`,
      ],
    },
    {
      duration: 1000,
      easing: "cubic-bezier(0.23, 1, 0.32, 1)",
      pseudoElement: "::view-transition-new(root)",
    },
  )
}
