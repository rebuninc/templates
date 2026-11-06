import { useRouter } from "@tanstack/react-router"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { addLink, updateLink } from "@/lib/links"
import type { LinkRow } from "@/lib/rebun"

// Without a link it adds one and stays on /admin; with a link it edits and goes back.
export function LinkForm({ link }: { link?: LinkRow }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  return (
    <form
      aria-label={link ? "Editar link" : "Novo link"}
      className={
        link ? "grid gap-5" : "grid gap-3 sm:grid-cols-[1fr_1.4fr_auto]"
      }
      onSubmit={async (e) => {
        e.preventDefault()
        const form = e.currentTarget
        const values = new FormData(form)
        setBusy(true)
        setError(null)
        try {
          const input = {
            id: link?.id,
            title: String(values.get("title") ?? ""),
            url: String(values.get("url") ?? ""),
          }
          const result = link
            ? await updateLink({ data: input })
            : await addLink({ data: input })
          if (result.error) setError(result.error)
          else {
            if (!link) form.reset()
            await router.invalidate()
            if (link) await router.navigate({ to: "/admin" })
          }
        } catch (err) {
          setError((err as Error).message)
        }
        setBusy(false)
      }}
    >
      <label className="grid gap-2 text-sm font-[510]">
        Título
        <Input
          name="title"
          defaultValue={link?.title}
          required
          maxLength={80}
        />
      </label>
      <label className="grid gap-2 text-sm font-[510]">
        URL
        <Input
          name="url"
          defaultValue={link?.url}
          required
          maxLength={2000}
          placeholder="exemplo.com"
        />
      </label>
      <Button
        type="submit"
        disabled={busy}
        className="self-end justify-self-start"
      >
        {link ? "Salvar" : "Adicionar"}
      </Button>
      {error ? (
        <p
          role="alert"
          className="animate-alert-in text-red-400 sm:col-span-full"
        >
          {error}
        </p>
      ) : null}
    </form>
  )
}
