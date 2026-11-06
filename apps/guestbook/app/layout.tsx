import type { ReactNode } from "react"

export const metadata = { title: "Guestbook" }

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          fontFamily: "system-ui",
          maxWidth: 560,
          margin: "40px auto",
          padding: "0 16px",
        }}
      >
        {children}
      </body>
    </html>
  )
}
