import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router"
import styles from "@/styles.css?url"

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Posts" },
    ],
    links: [{ rel: "stylesheet", href: styles }],
  }),
  component: () => (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-dvh bg-neutral-950 font-sans text-neutral-100 antialiased">
        <Outlet />
        <Scripts />
      </body>
    </html>
  ),
})
