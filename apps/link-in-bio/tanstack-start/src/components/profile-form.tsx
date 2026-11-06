import { useRouter } from "@tanstack/react-router"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input, Textarea } from "@/components/ui/input"
import {
  COLOR_LABELS,
  COLORS,
  colorOf,
  type ProfileView,
  saveProfile,
} from "@/lib/profiles"

export function ProfileForm({ profile }: { profile?: ProfileView }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const current = colorOf(profile?.color)

  return (
    <form
      className="grid gap-5"
      onSubmit={async (e) => {
        e.preventDefault()
        setBusy(true)
        setError(null)
        try {
          const result = await saveProfile({
            data: new FormData(e.currentTarget),
          })
          if (result.error) setError(result.error)
          else {
            await router.invalidate()
            await router.navigate({ to: "/admin" })
          }
        } catch (err) {
          setError((err as Error).message)
        }
        setBusy(false)
      }}
    >
      <label className="grid gap-2 text-sm font-[510]">
        Username
        <Input
          name="username"
          defaultValue={profile?.username}
          required
          maxLength={30}
          placeholder="seu.nome"
        />
      </label>
      <label className="grid gap-2 text-sm font-[510]">
        Nome
        <Input
          name="name"
          defaultValue={profile?.name}
          required
          maxLength={80}
        />
      </label>
      <label className="grid gap-2 text-sm font-[510]">
        Bio
        <Textarea
          name="bio"
          defaultValue={profile?.bio ?? ""}
          maxLength={160}
          rows={3}
        />
      </label>
      <label className="grid gap-2 text-sm font-[510]">
        Avatar
        <Input name="avatar" type="file" accept="image/*" />
      </label>
      <fieldset className="grid gap-2 text-sm font-[510]">
        <legend className="mb-2">Cor</legend>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((color) => (
            <label
              key={color}
              data-color={color}
              className="press flex cursor-pointer items-center gap-2 rounded-full border border-line py-1.5 pr-3.5 pl-1.5 has-checked:border-fg has-focus-visible:outline-2 has-focus-visible:outline-fg"
            >
              <input
                type="radio"
                name="color"
                value={color}
                defaultChecked={color === current}
                className="sr-only"
              />
              <span
                aria-hidden="true"
                className="size-5 rounded-full bg-(--accent)"
              />
              {COLOR_LABELS[color]}
            </label>
          ))}
        </div>
      </fieldset>
      {error ? (
        <p role="alert" className="animate-alert-in text-red-400">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={busy} className="justify-self-start">
        Salvar
      </Button>
    </form>
  )
}
