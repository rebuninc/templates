import { useRouter } from "@tanstack/react-router"
import { useState } from "react"
import { savePost } from "@/lib/posts"
import type { Post } from "@/lib/rebun"

const field =
  "rounded-2xl border border-white/15 bg-white/5 px-4 py-3 outline-none focus:border-white/40"

export function PostForm({ post }: { post?: Post }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  return (
    <form
      className="grid gap-4"
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
      <label className="grid gap-2">
        Título
        <input
          name="title"
          defaultValue={post?.title}
          required
          maxLength={200}
          className={field}
        />
      </label>
      <label className="grid gap-2">
        Conteúdo
        <textarea
          name="content"
          defaultValue={post?.content}
          required
          rows={10}
          className={field}
        />
      </label>
      <label className="grid gap-2">
        Tags
        <input
          name="tags"
          defaultValue={post?.tags?.join(", ")}
          placeholder="separadas por vírgula"
          className={field}
        />
      </label>
      <label className="grid gap-2">
        Imagem
        <input name="image" type="file" accept="image/*" className={field} />
      </label>
      <label className="flex items-center gap-3">
        <input
          name="published"
          type="checkbox"
          defaultChecked={post?.published === "true"}
          className="size-5 accent-white"
        />
        Publicado
      </label>
      {error ? (
        <p role="alert" className="text-red-400">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={busy}
        className="h-12 rounded-full bg-white px-5 font-medium text-neutral-950 disabled:opacity-50"
      >
        Salvar
      </button>
    </form>
  )
}
