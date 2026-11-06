import { createFileRoute } from "@tanstack/react-router"
import { Pagination } from "@/components/pagination"
import { PostList } from "@/components/post-list"
import { listPublished, parsePage } from "@/lib/posts"

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): { page?: number } => {
    const page = parsePage(search.page)
    return page > 1 ? { page } : {}
  },
  loaderDeps: ({ search }) => ({ page: search.page ?? 1 }),
  loader: ({ deps }) => listPublished({ data: deps.page }),
  component: Home,
})

function Home() {
  const { posts, pages, error } = Route.useLoaderData()
  const { page = 1 } = Route.useSearch()

  return (
    <main className="mx-auto grid max-w-7xl gap-14 px-5 py-16 md:px-10 md:py-20">
      <h1 className="text-5xl leading-none font-[510] tracking-[-0.022em]">
        Posts
      </h1>
      {error ? (
        <p role="alert" className="text-red-400">
          Erro ao carregar: {error}
        </p>
      ) : (
        <>
          <PostList posts={posts} />
          <Pagination page={page} pages={pages} />
        </>
      )}
    </main>
  )
}
