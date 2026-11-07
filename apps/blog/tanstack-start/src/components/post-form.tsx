import { useRouter } from "@tanstack/react-router"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { FileUpload, fileName } from "@/components/ui/file-upload"
import { Input, Textarea } from "@/components/ui/input"
import { type PostView, savePost } from "@/lib/posts"

export function PostForm({ post }: { post?: PostView | null }) {
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
          placeholder="Digite o título"
        />
      </label>
      <label className="grid gap-2 text-sm font-[510]">
        Conteúdo
        <Textarea
          name="content"
          defaultValue={post?.content}
          required
          rows={10}
          placeholder="Digite o conteúdo"
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
      <FileUpload
        label="Imagem"
        name="image"
        accept="image/*"
        maxSize={5 * 1024 * 1024}
        current={
          post?.image
            ? { name: fileName(post.image), url: post.imageUrl }
            : null
        }
      />
      <label className="flex items-center gap-3 text-sm font-[510]">
        <Checkbox
          name="published"
          defaultChecked={post?.published === "true"}
        />
        Publicado
      </label>
      {error ? (
        <p role="alert" className="animate-alert-in text-red-400">
          {error}
        </p>
      ) : null}
      <Button type="submit" loading={busy} className="justify-self-start">
        Salvar
      </Button>
    </form>
  )
}
