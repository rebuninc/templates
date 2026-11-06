import { createFileRoute, Link, useRouter } from "@tanstack/react-router"
import { useState } from "react"
import { Pagination } from "@/components/pagination"
import { PostList } from "@/components/post-list"
import { deletePost, listMine, parsePage } from "@/lib/posts"

export const Route = createFileRoute("/admin/")({
  validateSearch: (search: Record<string, unknown>): { page?: number } => {
    const page = parsePage(search.page)
    return page > 1 ? { page } : {}
  },
  loaderDeps: ({ search }) => ({ page: search.page ?? 1 }),
  loader: ({ deps }) => listMine({ data: deps.page }),
  component: Admin,
})

function Admin() {
  const { posts, pages, error } = Route.useLoaderData()
  const { page = 1 } = Route.useSearch()
  const router = useRouter()
  const [failed, setFailed] = useState<string | null>(null)

  return (
    <main className="mx-auto grid max-w-7xl gap-14 px-5 py-16 md:px-10 md:py-20">
      <h1 className="text-5xl leading-none font-[510] tracking-[-0.022em]">
        Meus posts
      </h1>
      {error || failed ? (
        <p role="alert" className="text-red-400">
          {error ? `Erro ao carregar: ${error}` : failed}
        </p>
      ) : null}
      <PostList
        posts={posts}
        actions={(post) => (
          <div className="flex gap-1.5 text-xs font-[510]">
            <Link
              to="/admin/$postId/edit"
              params={{ postId: post.id }}
              className="rounded-full border border-white/10 bg-bg/70 px-3 py-1.5 backdrop-blur-md hover:bg-bg"
            >
              Editar
            </Link>
            <button
              type="button"
              className="rounded-full border border-white/10 bg-bg/70 px-3 py-1.5 text-red-400 backdrop-blur-md hover:bg-bg"
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
      <Pagination page={page} pages={pages} />
    </main>
  )
}
