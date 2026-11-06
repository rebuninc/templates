import { useRouter } from "@tanstack/react-router"
import { useState } from "react"
import { savePost } from "@/lib/posts"
import type { Post } from "@/lib/rebun"

const field =
  "rounded-lg border border-line bg-surface px-3.5 py-2.5 text-fg outline-none placeholder:text-muted focus:border-muted file:mr-3 file:rounded-full file:border-0 file:bg-fg file:px-3 file:py-1 file:text-sm file:text-bg"

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
        <input
          name="title"
          defaultValue={post?.title}
          required
          maxLength={200}
          className={field}
        />
      </label>
      <label className="grid gap-2 text-sm font-[510]">
        Conteúdo
        <textarea
          name="content"
          defaultValue={post?.content}
          required
          rows={10}
          className={field}
        />
      </label>
      <label className="grid gap-2 text-sm font-[510]">
        Tags
        <input
          name="tags"
          defaultValue={post?.tags?.join(", ")}
          placeholder="separadas por vírgula"
          className={field}
        />
      </label>
      <label className="grid gap-2 text-sm font-[510]">
        Imagem
        <input name="image" type="file" accept="image/*" className={field} />
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
      <button
        type="submit"
        disabled={busy}
        className="h-10 justify-self-start rounded-full bg-fg px-5 text-sm font-[510] text-bg disabled:opacity-50"
      >
        Salvar
      </button>
    </form>
  )
}
