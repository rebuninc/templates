/// <reference types="vite/client" />
import {
  createRootRoute,
  HeadContent,
  Link,
  Outlet,
  Scripts,
} from "@tanstack/react-router"
import type { ReactNode } from "react"

import css from "../styles.css?url"

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Blog" },
    ],
    links: [{ rel: "stylesheet", href: css }],
  }),
  shellComponent: RootDocument,
  component: () => (
    <>
      <header>
        <Link to="/">Blog</Link>
      </header>
      <Outlet />
    </>
  ),
})

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
