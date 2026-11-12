import { Home01Icon, RefreshIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  type ErrorComponentProps,
  Link,
  useRouter,
} from "@tanstack/react-router"
import type { ReactNode } from "react"

const button =
  "press inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-[510]"
const primary = `${button} bg-fg text-bg`
const secondary = `${button} border border-line bg-island text-fg hover:bg-surface`

function StatusPage({
  code,
  message,
  title,
  description,
  children,
}: {
  code: string
  message: string
  title: string
  description: string
  children: ReactNode
}) {
  return (
    // data-status-page hides the header, footer and silk (see styles.css).
    <main
      data-status-page
      className="flex min-h-dvh flex-col items-center justify-center px-6 py-20 text-center motion-safe:animate-[fade-in_400ms_ease-out_both]"
    >
      <p className="text-xs font-medium tracking-widest text-muted uppercase">
        Erro {code} · {message}
      </p>
      <p
        aria-hidden="true"
        className="mt-2 text-[clamp(7rem,26vw,16rem)] leading-[0.85] font-semibold tracking-[-0.04em] select-none"
      >
        {code[0]}
        <span className="text-muted">{code[1]}</span>
        {code[2]}
      </p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-balance">
        {title}
      </h1>
      <p className="mt-2 max-w-sm text-sm text-balance text-muted">
        {description}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-2">{children}</div>
    </main>
  )
}

function HomeLink({ className }: { className: string }) {
  return (
    <Link to="/" className={className}>
      <HugeiconsIcon icon={Home01Icon} size={16} />
      Início
    </Link>
  )
}

export function NotFound({
  title = "Página não encontrada",
}: {
  title?: string
}) {
  return (
    <StatusPage
      code="404"
      message="NOT_FOUND"
      title={title}
      description="O endereço não existe ou foi removido."
    >
      <HomeLink className={primary} />
    </StatusPage>
  )
}

// Only codes are shown, so internal error text never reaches the screen.
const errorCode = (error: unknown) =>
  (error instanceof Error ? error.message : "").match(
    /^(?:\d{3} )?([A-Z][A-Z0-9_]*)$/,
  )?.[1] ?? "INTERNAL_ERROR"

export function AppError({ error, reset }: ErrorComponentProps) {
  const router = useRouter()
  // reset alone re-renders the failed loader's error; invalidate re-runs it.
  const retry = () => {
    reset()
    router.invalidate()
  }
  return (
    <StatusPage
      code="500"
      message={errorCode(error)}
      title="Algo deu errado"
      description="Tente novamente em instantes."
    >
      <button type="button" onClick={retry} className={primary}>
        <HugeiconsIcon icon={RefreshIcon} size={16} />
        Tentar novamente
      </button>
      <HomeLink className={secondary} />
    </StatusPage>
  )
}
