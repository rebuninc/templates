import { ArrowDown01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  createRootRoute,
  HeadContent,
  Link,
  Outlet,
  Scripts,
  useRouter,
  useRouterState,
} from "@tanstack/react-router"
import { MotionConfig, motion } from "motion/react"
import { useEffect, useState } from "react"
import { Toaster } from "sonner"
import { LogoMark } from "@/components/logo"
import { NavigationProgress } from "@/components/navigation-progress"
import { enter, spring, useEnterFrom } from "@/lib/motion"
import { getViewer, signOut } from "@/lib/posts"
import { APP_NAME } from "@/lib/utils"
import styles from "@/styles.css?url"

export const Route = createRootRoute({
  loader: () => getViewer(),
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Posts" },
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
      { rel: "stylesheet", href: styles },
      { rel: "icon", href: "/favicon.ico", sizes: "32x32" },
      { rel: "icon", href: "/icon.svg", type: "image/svg+xml" },
    ],
  }),
  component: Root,
})

function Root() {
  const viewer = Route.useLoaderData()
  const router = useRouter()
  // The login page is a full-screen split layout with its own branding.
  const bare = useRouterState({
    select: (s) => s.location.pathname === "/login",
  })
  // Keyed on the rendered match, not location, so the old page doesn't remount while loading.
  const page = useRouterState({ select: (s) => s.matches.at(-1)?.pathname })
  const from = useEnterFrom()
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 0)
    update()
    window.addEventListener("scroll", update, { passive: true })
    return () => window.removeEventListener("scroll", update)
  }, [])

  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-dvh bg-bg font-sans text-fg antialiased">
        <MotionConfig reducedMotion="user">
          <NavigationProgress />
          <header
            data-scrolled={scrolled || undefined}
            className="group sticky top-0 z-20 border-b border-transparent bg-bg/80 backdrop-blur-md transition-colors data-scrolled:border-line"
            hidden={bare}
          >
            <nav className="mx-auto flex h-24 max-w-7xl transition-[height] duration-200 group-data-scrolled:h-18 items-center justify-between px-5 md:px-10">
              <Link
                to="/"
                className="flex items-center gap-2 text-lg font-[590] tracking-tight"
              >
                <LogoMark size={22} />
                {APP_NAME}
              </Link>
              {viewer ? (
                <div className="flex items-center gap-5 text-sm font-[510]">
                  <Link to="/admin" className="text-muted hover:text-fg">
                    Meus posts
                  </Link>
                  <Link
                    to="/admin/new"
                    className="press rounded-full bg-fg px-3.5 py-1.5 text-bg"
                  >
                    Novo post
                  </Link>
                  <button
                    type="button"
                    popoverTarget="user-menu"
                    aria-label="Conta"
                    className="press flex items-center gap-1.5 rounded-full border border-line bg-surface py-1 pr-2.5 pl-1 text-muted hover:border-muted hover:text-fg [anchor-name:--user-menu]"
                  >
                    <span className="grid size-6 place-items-center rounded-full bg-line text-xs text-fg uppercase">
                      {viewer.email.charAt(0)}
                    </span>
                    <HugeiconsIcon icon={ArrowDown01Icon} size={14} />
                  </button>
                  <div
                    id="user-menu"
                    popover="auto"
                    className="menu-pop inset-auto m-0 mt-2 min-w-56 rounded-lg border border-line bg-surface p-1 text-sm text-fg shadow-xl [position-anchor:--user-menu] [position-area:bottom_span-left]"
                  >
                    <p className="truncate border-b border-line px-3 py-2 text-muted">
                      {viewer.email}
                    </p>
                    <button
                      type="button"
                      className="mt-1 w-full rounded-md px-3 py-2 text-left hover:bg-line"
                      onClick={async (e) => {
                        e.currentTarget
                          .closest<HTMLElement>("[popover]")
                          ?.hidePopover()
                        await signOut()
                        await router.navigate({ to: "/login" })
                      }}
                    >
                      Sair
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="press rounded-full bg-fg px-3.5 py-1.5 text-sm font-[510] text-bg"
                >
                  Entrar
                </Link>
              )}
            </nav>
          </header>
          <motion.div
            key={page}
            data-page
            initial={from}
            animate="show"
            variants={enter}
            transition={spring}
          >
            <Outlet />
          </motion.div>
          <Toaster position="top-center" theme="dark" />
        </MotionConfig>
        <Scripts />
      </body>
    </html>
  )
}
