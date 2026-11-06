import { createFileRoute, redirect, useRouter } from "@tanstack/react-router"
import { useState } from "react"
import { AuroraTop } from "@/components/aurora-top"
import { getViewer, sendCode, startGoogle, verifyCode } from "@/lib/posts"

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    const viewer = await getViewer()
    if (viewer) throw redirect({ to: "/admin" })
  },
  component: Login,
})

const input =
  "h-12 rounded-full border border-white/15 bg-white/5 px-5 outline-none focus:border-white/40"
const button =
  "h-12 rounded-full bg-white px-5 font-medium text-neutral-950 disabled:opacity-50"

function Login() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const run = async (action: () => Promise<string | null>) => {
    setBusy(true)
    setError(null)
    const failed = await action()
    setError(failed)
    setBusy(false)
  }

  return (
    <main className="relative isolate mx-auto grid max-w-sm gap-6 px-4 py-24">
      <AuroraTop />
      <h1 className="text-4xl font-bold tracking-tight">Entrar</h1>
      {email ? (
        <form
          className="grid gap-3"
          onSubmit={(e) => {
            e.preventDefault()
            const code = String(new FormData(e.currentTarget).get("code"))
            run(async () => {
              const result = await verifyCode({ data: { email, code } })
              if (result.error) return result.error
              await router.navigate({ to: "/admin" })
              return null
            })
          }}
        >
          <p className="text-sm text-neutral-400">
            Enviamos um código para {email}.
          </p>
          <input
            name="code"
            aria-label="Código"
            placeholder="Código"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            maxLength={6}
            className={input}
          />
          <button type="submit" disabled={busy} className={button}>
            Entrar
          </button>
        </form>
      ) : (
        <>
          <button
            type="button"
            disabled={busy}
            className={button}
            onClick={() =>
              run(async () => {
                const result = await startGoogle()
                if (!result.url) return result.error
                window.location.href = result.url
                return null
              })
            }
          >
            Entrar com Google
          </button>
          <p className="text-center text-xs text-neutral-500">ou</p>
          <form
            className="grid gap-3"
            onSubmit={(e) => {
              e.preventDefault()
              const value = String(new FormData(e.currentTarget).get("email"))
              run(async () => {
                const result = await sendCode({ data: value })
                if (result.error) return result.error
                setEmail(value.trim())
                return null
              })
            }}
          >
            <input
              name="email"
              type="email"
              aria-label="E-mail"
              placeholder="E-mail"
              required
              className={input}
            />
            <button type="submit" disabled={busy} className={button}>
              Enviar código
            </button>
          </form>
        </>
      )}
      {error ? (
        <p role="alert" className="text-red-400">
          Erro ao entrar: {error}
        </p>
      ) : null}
    </main>
  )
}
