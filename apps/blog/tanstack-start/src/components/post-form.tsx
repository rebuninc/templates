import { useRouter } from "@tanstack/react-router"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input, Textarea } from "@/components/ui/input"
import { savePost } from "@/lib/posts"
import type { Post } from "@/lib/rebun"

export function PostForm({ post }: { post?: Post }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  return (
    <form
      className="grid gap-5"
      onSubmit={async (e) => {
        e.preventDefault()
        setBusy(true)
        setError(null)
        try {
          const result = await savePost({ data: new FormData(e.currentTarget) })
          if (result.error) setError(result.error)
          else await router.navigate({ to: "/admin" })
        } catch (err) {
          setError((err as Error).message)
        }
        setBusy(false)
      }}
    >
      {post ? <input type="hidden" name="id" value={post.id} /> : null}
      <label className="grid gap-2 text-sm font-[510]">
        Título
        <Input
          name="title"
          defaultValue={post?.title}
          required
          maxLength={200}
        />
      </label>
      <label className="grid gap-2 text-sm font-[510]">
        Conteúdo
        <Textarea
          name="content"
          defaultValue={post?.content}
          required
          rows={10}
        />
      </label>
      <label className="grid gap-2 text-sm font-[510]">
        Tags
        <Input
          name="tags"
          defaultValue={post?.tags?.join(", ")}
          placeholder="separadas por vírgula"
        />
      </label>
      <label className="grid gap-2 text-sm font-[510]">
        Imagem
        <Input name="image" type="file" accept="image/*" />
      </label>
      <label className="flex items-center gap-3 text-sm font-[510]">
        <input
          name="published"
          type="checkbox"
          defaultChecked={post?.published === "true"}
          className="size-4 accent-fg"
        />
        Publicado
      </label>
      {error ? (
        <p role="alert" className="text-red-400">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={busy} className="justify-self-start">
        Salvar
      </Button>
    </form>
  )
}
