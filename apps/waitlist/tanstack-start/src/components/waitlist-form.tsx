import { type FormEvent, useState } from "react"

import type { Result } from "../lib/rebun"

type Status =
  { kind: "idle" } | { kind: "done" } | { kind: "error"; code: string }

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
      form.reset()
      setStatus({ kind: "done" })
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="grid w-full max-w-md gap-3">
      <form
        onSubmit={submit}
        className="island flex w-full gap-1.5 rounded-full p-1.5 focus-within:border-muted"
      >
        <input
          type="email"
          name="email"
          required
          maxLength={254}
          autoComplete="email"
          aria-label="E-mail"
          placeholder="seu@email.com"
          className="min-w-0 flex-1 bg-transparent px-4 text-fg outline-none placeholder:text-muted"
        />
        <button
          type="submit"
          disabled={pending}
          className="press shrink-0 rounded-full bg-fg px-5 py-2.5 text-sm font-[590] text-bg disabled:opacity-60"
        >
          Entrar na lista
        </button>
      </form>
      {status.kind === "done" && (
        <p role="status" className="animate-alert-in text-sm text-body">
          Pronto! Você está na lista.
        </p>
      )}
      {status.kind === "error" && (
        <p role="alert" className="animate-alert-in text-sm text-red-400">
          Erro ao enviar: {status.code}
        </p>
      )}
    </div>
  )
}
