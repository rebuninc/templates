import { type CSSProperties, type FormEvent, useState } from "react"

import type { Result } from "../lib/rebun"
import { rippleDots } from "./dot-field"

type Status =
  | { kind: "idle"; again?: boolean }
  | { kind: "done"; email: string }
  | { kind: "error"; code: string }

export function WaitlistForm({
  onJoin,
}: {
  onJoin: (email: string) => Promise<Result<{ id: string }>>
}) {
  const [status, setStatus] = useState<Status>({ kind: "idle" })
  const [pending, setPending] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const email = String(new FormData(form).get("email") ?? "").trim()
    if (!email) return
    setPending(true)
    try {
      const result = await onJoin(email)
      if (result.error !== null)
        return setStatus({ kind: "error", code: result.error })
      const box = form.getBoundingClientRect()
      rippleDots(box.left + box.width / 2, box.top + box.height / 2)
      setStatus({ kind: "done", email })
    } finally {
      setPending(false)
    }
  }

  // Back to an empty form, with the cursor already in the field.
  const again = () => setStatus({ kind: "idle", again: true })

  if (status.kind === "done")
    return (
      <div className="grid w-full max-w-md justify-items-center gap-4">
        <Success email={status.email} />
        <button
          type="button"
          onClick={again}
          className="animate-rise-in text-xs text-faint underline-offset-4 transition-colors hover:text-light hover:underline"
          style={{ animationDelay: "0.9s" }}
        >
          Usar outro e-mail
        </button>
      </div>
    )

  return (
    <div className="grid w-full max-w-md gap-4">
      <form
        onSubmit={submit}
        className="flex flex-col gap-2 rounded-[1.75rem] border border-line bg-panel p-2 transition-colors focus-within:border-accent/70 sm:flex-row sm:rounded-full"
      >
        <input
          type="email"
          autoFocus={status.kind === "idle" && status.again}
          name="email"
          required
          maxLength={254}
          autoComplete="email"
          aria-label="E-mail"
          placeholder="seu@email.com"
          className="h-12 w-full min-w-0 bg-transparent px-4 text-base text-light outline-none placeholder:text-faint sm:flex-1"
        />
        <button
          type="submit"
          disabled={pending}
          className="group inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-accent pr-5 pl-6 text-sm font-bold text-void transition-[background-color,scale] hover:bg-light active:scale-[0.97] disabled:opacity-60"
        >
          Entrar na lista
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            className="size-4 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1"
          >
            <path
              d="M2.5 8h10M8.5 3.5 13 8l-4.5 4.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </form>
      {status.kind === "idle" && (
        <p className="text-xs text-faint">
          Sem spam. Um e-mail no lançamento, e só.
        </p>
      )}
      {status.kind === "error" && (
        <p
          role="alert"
          className="animate-rise-in text-sm font-semibold text-danger"
        >
          Erro ao enviar: {status.code}
        </p>
      )}
    </div>
  )
}

const BURST = Array.from({ length: 12 }, (_, i) => i * 30)

// Takes the form's place: a check draws itself while dots burst out of the badge.
function Success({ email }: { email: string }) {
  return (
    <div className="animate-pop flex w-full items-center gap-4 rounded-[1.75rem] border border-accent/40 bg-panel p-2 pr-6 text-left sm:rounded-full">
      <span
        aria-hidden="true"
        className="relative grid size-12 shrink-0 place-items-center"
      >
        <span className="absolute inset-0 animate-ping-once rounded-full bg-accent/40" />
        {BURST.map((angle, i) => (
          <span
            key={angle}
            className="absolute size-2 animate-burst rounded-full bg-accent"
            style={
              {
                "--a": `${angle}deg`,
                "--d": `${i % 2 ? 44 : 58}px`,
              } as CSSProperties
            }
          />
        ))}
        <span className="relative grid size-12 place-items-center rounded-full bg-accent text-void">
          <svg viewBox="0 0 24 24" className="size-6">
            <path
              d="M5 12.5l4.5 4.5L19 7.5"
              pathLength={1}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-draw"
              style={{ animationDelay: "0.25s" }}
            />
          </svg>
        </span>
      </span>
      <div className="grid min-w-0 gap-0.5">
        <p role="status" className="text-base font-bold text-light">
          Pronto! Você está na lista.
        </p>
        <p className="text-sm text-pretty text-soft [overflow-wrap:anywhere]">
          Avisaremos <span className="text-accent">{email}</span> no lançamento.
        </p>
      </div>
    </div>
  )
}
