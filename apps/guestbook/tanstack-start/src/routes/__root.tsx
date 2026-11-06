import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router"

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Guestbook" },
    ],
  }),
  component: () => (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body
        style={{
          fontFamily: "system-ui",
          maxWidth: 560,
          margin: "40px auto",
          padding: "0 16px",
        }}
      >
        <Outlet />
        <Scripts />
      </body>
    </html>
  ),
})
