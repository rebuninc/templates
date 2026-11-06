import {
  ArrowLeft01Icon,
  GithubIcon,
  GoogleIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  createFileRoute,
  Link,
  redirect,
  useRouter,
} from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { LogoMark } from "@/components/logo"
import { NightSilk } from "@/components/night-silk"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  getProviders,
  getViewer,
  sendCode,
  signInPassword,
  startOAuth,
  verifyCode,
} from "@/lib/posts"
import { APP_NAME } from "@/lib/utils"

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    const viewer = await getViewer()
    if (viewer) throw redirect({ to: "/admin" })
  },
  loader: () => getProviders(),
  component: Login,
})

function Login() {
  const router = useRouter()
  const { providers, error: loadError } = Route.useLoaderData()
  const [step, setStep] = useState<"options" | "otp" | "password">("options")
  const [email, setEmail] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    // Fixed id so StrictMode's double effect shows a single toast.
    if (loadError)
      toast.error(`Erro ao carregar: ${loadError}`, { id: "load-error" })
  }, [loadError])

  const run = async (action: () => Promise<string | null>) => {
    setBusy(true)
    const failed = await action()
    if (failed) toast.error(`Erro ao entrar: ${failed}`)
    setBusy(false)
  }

  const oauth = (provider: "google" | "github") =>
    run(async () => {
      const result = await startOAuth({ data: provider })
      if (!result.url) return result.error
      window.location.href = result.url
      return null
    })

  const back = (
    <button
      type="button"
      className="justify-self-center text-muted hover:text-fg"
      onClick={() => setStep("options")}
    >
      Voltar
    </button>
  )

  return (
    <main className="grid min-h-dvh lg:grid-cols-2">
      <section className="relative m-3 hidden overflow-hidden rounded-3xl border border-line lg:block">
        <NightSilk className="absolute inset-0 overflow-hidden" />
        <div className="absolute inset-x-0 bottom-0 grid gap-4 p-12 pt-40">
          <p className="max-w-md text-5xl leading-[1.05] font-[510] tracking-[-0.022em]">
            Escreva. Publique. Compartilhe.
          </p>
          <p className="max-w-sm text-lg text-muted">
            Seus posts, suas ideias, num blog simples e rápido.
          </p>
        </div>
      </section>
      <div className="relative grid place-items-center px-5 py-16">
        <Link
          to="/"
          className="absolute top-6 left-5 flex items-center gap-1 text-sm text-muted hover:text-fg md:left-10"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
          Voltar
        </Link>
        <div className="grid w-full max-w-90 gap-4">
          <div className="justify-self-center">
            <LogoMark size={40} />
          </div>
          <h1 className="mb-6 text-center text-2xl font-[510] tracking-[-0.012em]">
            Entrar no {APP_NAME}
          </h1>
          {email ? (
            <form
              className="grid gap-4"
              onSubmit={(e) => {
                e.preventDefault()
                const code = String(new FormData(e.currentTarget).get("code"))
                run(async () => {
                  const result = await verifyCode({ data: { email, code } })
                  if (result.error) return result.error
                  await router.navigate({ to: "/admin" })
                  // The root loader holds the viewer, so the navbar needs a refetch.
                  await router.invalidate()
                  return null
                })
              }}
            >
              <p className="text-center text-muted">
                Enviamos um código para {email}.
              </p>
              <Input
                name="code"
                aria-label="Código"
                placeholder="Código"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                maxLength={6}
                variant="pill"
              />
              <Button type="submit" disabled={busy}>
                Entrar
              </Button>
            </form>
          ) : step === "otp" ? (
            <form
              className="grid gap-4"
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
              <Input
                name="email"
                type="email"
                aria-label="E-mail"
                placeholder="E-mail"
                required
                autoFocus
                variant="pill"
              />
              <Button type="submit" disabled={busy}>
                Enviar código
              </Button>
              {back}
            </form>
          ) : step === "password" ? (
            <form
              className="grid gap-4"
              onSubmit={(e) => {
                e.preventDefault()
                const form = new FormData(e.currentTarget)
                const data = {
                  email: String(form.get("email")),
                  password: String(form.get("password")),
                }
                run(async () => {
                  const result = await signInPassword({ data })
                  if (result.error) return result.error
                  await router.navigate({ to: "/admin" })
                  // The root loader holds the viewer, so the navbar needs a refetch.
                  await router.invalidate()
                  return null
                })
              }}
            >
              <Input
                name="email"
                type="email"
                aria-label="E-mail"
                placeholder="E-mail"
                required
                autoFocus
                variant="pill"
              />
              <Input
                name="password"
                type="password"
                aria-label="Senha"
                placeholder="Senha"
                autoComplete="current-password"
                required
                variant="pill"
              />
              <Button type="submit" disabled={busy}>
                Entrar
              </Button>
              {back}
            </form>
          ) : loadError ? null : providers.length === 0 ? (
            <p className="text-center text-muted">
              Nenhum método de login ativo.
            </p>
          ) : (
            <>
              {providers.includes("google") ? (
                <Button
                  type="button"
                  disabled={busy}
                  onClick={() => oauth("google")}
                >
                  <HugeiconsIcon icon={GoogleIcon} size={16} />
                  Entrar com Google
                </Button>
              ) : null}
              {providers.includes("github") ? (
                <Button
                  type="button"
                  disabled={busy}
                  variant="secondary"
                  onClick={() => oauth("github")}
                >
                  <HugeiconsIcon icon={GithubIcon} size={16} />
                  Entrar com GitHub
                </Button>
              ) : null}
              {providers.includes("otp") ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setStep("otp")}
                >
                  Continuar com e-mail
                </Button>
              ) : null}
              {providers.includes("password") ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setStep("password")}
                >
                  Continuar com senha
                </Button>
              ) : null}
            </>
          )}
        </div>
      </div>
    </main>
  )
}
