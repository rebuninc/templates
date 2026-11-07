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
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { LogoMark } from "@/components/logo"
import { NightSilk } from "@/components/night-silk"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { CodeSlots, type CodeSlotsStatus } from "@/components/ui/code-slots"
import { Input } from "@/components/ui/input"
import {
  getProviders,
  getViewer,
  sendCode,
  signInPassword,
  signUpPassword,
  startOAuth,
  verifyCode,
  verifySignUp,
} from "@/lib/auth"
import { enter, spring, useEnterFrom } from "@/lib/motion"
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
  const { providers, signUp, error: loadError } = Route.useLoaderData()
  const [step, setStep] = useState<"options" | "otp" | "password">("options")
  const [mode, setMode] = useState<"login" | "signup">("login")
  const reduceMotion = useReducedMotion()
  const joining = mode === "signup"
  const submitLabel = joining ? "Criar conta" : "Entrar"
  const [email, setEmail] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [code, setCode] = useState("")
  const [codeStatus, setCodeStatus] = useState<CodeSlotsStatus>("idle")
  const from = useEnterFrom()

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

  const submitCode = (address: string, code: string) => {
    if (busy || code.length < 6) return
    run(async () => {
      const verify = step === "password" ? verifySignUp : verifyCode
      const result = await verify({ data: { email: address, code } })
      if (result.error) {
        setCodeStatus("error")
        return result.error
      }
      await router.navigate({ to: "/admin" })
      // The root loader holds the viewer, so the navbar needs a refetch.
      await router.invalidate()
      return null
    })
  }

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
    <>
      <main className="grid min-h-dvh lg:grid-cols-2">
        <section className="relative m-3 hidden overflow-hidden rounded-3xl border border-line lg:block">
          <NightSilk className="absolute inset-0 overflow-hidden" />
          <div className="absolute inset-x-0 bottom-0 grid gap-4 p-12 pt-40">
            <p className="max-w-md text-5xl leading-[1.05] font-[510] tracking-[-0.022em]">
              Todos os seus links. Uma página só.
            </p>
            <p className="max-w-sm text-lg text-muted">
              Monte sua página, compartilhe um link e veja quantos cliques cada
              um recebe.
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
              {joining ? "Criar conta" : "Entrar"} no {APP_NAME}
            </h1>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={email ? "code" : step}
                initial={from}
                animate="show"
                exit={{ opacity: 0, transition: { duration: 0.12 } }}
                variants={enter}
                transition={spring}
                className="grid gap-4"
              >
                {email ? (
                  <form
                    className="grid gap-4"
                    onSubmit={(e) => {
                      e.preventDefault()
                      submitCode(email, code)
                    }}
                  >
                    <p className="text-center text-muted">
                      Enviamos um código para {email}.
                    </p>
                    <CodeSlots
                      ariaLabel="Código"
                      autoFocus
                      status={codeStatus}
                      onChange={(value) => {
                        setCode(value)
                        if (value) setCodeStatus("idle")
                      }}
                      onComplete={(value) => submitCode(email, value)}
                      accentColor="var(--color-fg)"
                      inkColor="var(--color-fg)"
                      slotColor="var(--color-field)"
                      digitColor="var(--color-bg)"
                      className="justify-self-center"
                    />
                    <Button type="submit" disabled={busy}>
                      {submitLabel}
                    </Button>
                  </form>
                ) : step === "otp" ? (
                  <form
                    className="grid gap-4"
                    onSubmit={(e) => {
                      e.preventDefault()
                      const value = String(
                        new FormData(e.currentTarget).get("email"),
                      )
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
                        if (joining) {
                          const result = await signUpPassword({ data })
                          if (result.error) return result.error
                          setEmail(data.email.trim())
                          return null
                        }
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
                      autoComplete={
                        joining ? "new-password" : "current-password"
                      }
                      required
                      variant="pill"
                    />
                    <Button type="submit" disabled={busy}>
                      {submitLabel}
                    </Button>
                    {back}
                  </form>
                ) : loadError ? null : providers.length === 0 ? (
                  <p className="text-center text-muted">
                    Nenhum método de login ativo.
                  </p>
                ) : (
                  <>
                    {signUp ? (
                      <div
                        role="radiogroup"
                        aria-label="Modo"
                        className="mb-2 grid grid-cols-2 rounded-full border border-line p-1 text-sm font-[510]"
                      >
                        {(["login", "signup"] as const).map((value) => (
                          <label
                            key={value}
                            className="relative rounded-full py-1.5 text-center text-muted transition-colors has-checked:text-fg has-focus-visible:outline-2 has-focus-visible:outline-muted"
                          >
                            {mode === value ? (
                              <motion.span
                                layoutId={
                                  reduceMotion ? undefined : "mode-pill"
                                }
                                data-mode-pill
                                transition={spring}
                                className="absolute inset-0 rounded-full bg-surface"
                              />
                            ) : null}
                            <input
                              type="radio"
                              name="mode"
                              className="absolute inset-0 cursor-pointer appearance-none rounded-full outline-none"
                              checked={mode === value}
                              onChange={() => setMode(value)}
                            />
                            <span className="pointer-events-none relative">
                              {value === "login" ? "Entrar" : "Criar conta"}
                            </span>
                          </label>
                        ))}
                      </div>
                    ) : null}
                    {providers.includes("google") ? (
                      <Button
                        type="button"
                        disabled={busy}
                        onClick={() => oauth("google")}
                      >
                        <HugeiconsIcon icon={GoogleIcon} size={16} />
                        {joining ? "Cadastrar" : "Entrar"} com Google
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
                        {joining ? "Cadastrar" : "Entrar"} com GitHub
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
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
      <ThemeToggle className="fixed top-4.5 right-5 z-10 md:right-10" />
    </>
  )
}
