import { createFileRoute, Link, useRouter } from "@tanstack/react-router"
import { useState } from "react"
import { PostList } from "@/components/post-list"
import { deletePost, listMine, signOut } from "@/lib/posts"

export const Route = createFileRoute("/admin/")({
  loader: () => listMine(),
  component: Admin,
})

function Admin() {
  const { email, posts, error } = Route.useLoaderData()
  const router = useRouter()
  const [failed, setFailed] = useState<string | null>(null)

  return (
    <main className="mx-auto grid max-w-2xl gap-8 px-4 py-16">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Meus posts</h1>
          <p className="text-sm text-neutral-400">{email}</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin/new"
            className="rounded-full bg-white px-4 py-2 text-sm font-medium text-neutral-950"
          >
            Novo post
          </Link>
          <button
            type="button"
            className="rounded-full border border-white/15 px-4 py-2 text-sm"
            onClick={async () => {
              await signOut()
              await router.navigate({ to: "/login" })
            }}
          >
            Sair
          </button>
        </div>
      </header>
      {error || failed ? (
        <p role="alert" className="text-red-400">
          {error ? `Erro ao carregar: ${error}` : failed}
        </p>
      ) : null}
      <PostList
        posts={posts}
        actions={(post) => (
          <div className="flex gap-2 text-sm">
            <Link
              to="/admin/$postId/edit"
              params={{ postId: post.id }}
              className="rounded-full border border-white/15 px-4 py-1.5"
            >
              Editar
            </Link>
            <button
              type="button"
              className="rounded-full border border-red-400/40 px-4 py-1.5 text-red-300"
              onClick={async () => {
                if (!window.confirm(`Excluir "${post.title}"?`)) return
                setFailed(null)
                try {
                  await deletePost({ data: post.id })
                  await router.invalidate()
                } catch (err) {
                  setFailed((err as Error).message)
                }
              }}
            >
              Excluir
            </button>
          </div>
        )}
      />
    </main>
  )
}
