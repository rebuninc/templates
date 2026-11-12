import { useEffect, useRef } from "react"

const GAP = 22
const BASE = 1.1
const REACH = 170
// Resting dots are the accent at about 25% over the background.
const DOT = [28, 42, 70]
const ACCENT = [80, 136, 244]
const RIPPLE_EVENT = "dot-field:ripple"
const RIPPLE_SPEED = 900
const RIPPLE_BAND = 80
const RIPPLE_LIFE = 1.6

// Sends a ring of lit dots across the field from a point on screen (client coordinates).
export const rippleDots = (x: number, y: number) =>
  window.dispatchEvent(new CustomEvent(RIPPLE_EVENT, { detail: { x, y } }))

// Flat dot grid: a slow wave runs through it and dots near the cursor swell and take the accent color.
export function DotField({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches
    const pointer = { x: -9999, y: -9999 }
    let ripples: { x: number; y: number; start: number }[] = []
    let width = 0
    let height = 0
    let frame = 0

    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height)
      const t = time / 1000
      ripples = ripples.filter((r) => t - r.start < RIPPLE_LIFE)
      for (let y = GAP / 2; y < height; y += GAP) {
        for (let x = GAP / 2; x < width; x += GAP) {
          const wave = still ? 0 : Math.sin(x * 0.012 + y * 0.018 - t * 1.1)
          const near = Math.max(
            0,
            1 - Math.hypot(x - pointer.x, y - pointer.y) / REACH,
          )
          let ring = 0
          for (const ripple of ripples) {
            const age = t - ripple.start
            const off = Math.abs(
              Math.hypot(x - ripple.x, y - ripple.y) - age * RIPPLE_SPEED,
            )
            ring = Math.max(
              ring,
              Math.max(0, 1 - off / RIPPLE_BAND) * (1 - age / RIPPLE_LIFE),
            )
          }
          const mix = Math.max(near * near, ring)
          const r = BASE + wave * 0.45 + mix * 3.2
          ctx.fillStyle = `rgb(${DOT.map((c, i) => Math.round(c + (ACCENT[i] - c) * mix)).join(",")})`
          ctx.beginPath()
          ctx.arc(x, y, Math.max(0.4, r), 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }

    const resize = () => {
      const ratio = Math.min(devicePixelRatio, 2)
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = width * ratio
      canvas.height = height * ratio
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
      draw(performance.now())
    }
    const move = (event: PointerEvent) => {
      const { left, top } = canvas.getBoundingClientRect()
      pointer.x = event.clientX - left
      pointer.y = event.clientY - top
      if (still) draw(performance.now())
    }
    const onRipple = (event: Event) => {
      const { x, y } = (event as CustomEvent<{ x: number; y: number }>).detail
      const { left, top } = canvas.getBoundingClientRect()
      ripples.push({ x: x - left, y: y - top, start: performance.now() / 1000 })
    }
    const loop = (time: number) => {
      draw(time)
      frame = requestAnimationFrame(loop)
    }

    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    window.addEventListener("pointermove", move, { passive: true })
    if (!still) window.addEventListener(RIPPLE_EVENT, onRipple)
    if (!still) frame = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener("pointermove", move)
      window.removeEventListener(RIPPLE_EVENT, onRipple)
    }
  }, [])

  return <canvas ref={ref} aria-hidden="true" className={className} />
}
