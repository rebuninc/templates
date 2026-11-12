/// <reference types="vite/client" />
import {
  createRootRoute,
  HeadContent,
  Link,
  Outlet,
  Scripts,
  useRouterState,
} from "@tanstack/react-router"
import { motion, MotionConfig } from "motion/react"
import { type ReactNode, useEffect, useState } from "react"

import { Footer } from "../components/footer"
import { LogoMark } from "../components/logo"
import { NavigationProgress } from "../components/navigation-progress"
import { NightSilk } from "../components/night-silk"
import { ThemeToggle } from "../components/theme-toggle"
import { enter, spring, useEnterFrom } from "../lib/motion"
import { themeScript } from "../lib/theme"

import css from "../styles.css?url"

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Waitlist" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Urbanist:wght@400..700&display=swap",
      },
      { rel: "stylesheet", href: css },
      { rel: "icon", href: "/favicon.ico", sizes: "32x32" },
      { rel: "icon", href: "/icon.svg", type: "image/svg+xml" },
    ],
    scripts: [{ children: themeScript }],
  }),
  shellComponent: RootDocument,
  component: Layout,
})

function Layout() {
  // Keyed on the rendered match, not location, so the old page doesn't remount while loading.
  const page = useRouterState({ select: (s) => s.matches.at(-1)?.pathname })
  const from = useEnterFrom()
  const [stuck, setStuck] = useState(false)
  useEffect(() => {
    // 12px is the header's mt-3: past it, the pill is touching the top.
    const update = () => setStuck(window.scrollY >= 12)
    update()
    window.addEventListener("scroll", update, { passive: true })
    return () => window.removeEventListener("scroll", update)
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      <NavigationProgress />
      <NightSilk className="fixed inset-0 -z-10 overflow-hidden" />
      <header
        data-stuck={stuck || undefined}
        className="island sticky top-0 z-20 mt-3 rounded-[33px] transition-[border-radius,border-color] duration-200 data-stuck:rounded-t-none data-stuck:rounded-b-xl data-stuck:border-t-transparent max-sm:bg-island/70 max-sm:backdrop-blur-md"
      >
        <nav className="flex h-16 items-center justify-between px-3 sm:px-6">
          <Link
            to="/"
            className="flex items-center gap-2 text-lg font-[590] tracking-tight"
          >
            <LogoMark size={22} />
            Waitlist
          </Link>
          <ThemeToggle />
        </nav>
      </header>
      <motion.div
        key={page}
        initial={from}
        animate="show"
        variants={enter}
        transition={spring}
      >
        <Outlet />
      </motion.div>
      <Footer />
    </MotionConfig>
  )
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    // The theme script sets data-theme before hydration.
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="flex min-h-dvh flex-col bg-bg font-sans text-fg antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  )
}
