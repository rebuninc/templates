import { createFileRoute, Link } from "@tanstack/react-router"
import { AuroraTop } from "@/components/aurora-top"
import BlurText from "@/components/blur-text"
import { PostList } from "@/components/post-list"
import { getViewer, listPublished } from "@/lib/posts"

export const Route = createFileRoute("/")({
  loader: async () => {
    const [list, viewer] = await Promise.all([listPublished(), getViewer()])
    return { ...list, viewer }
  },
  component: Home,
})

function Home() {
  const { posts, error, viewer } = Route.useLoaderData()

  return (
    <main className="relative isolate mx-auto grid max-w-2xl gap-8 px-4 py-16">
      <AuroraTop />
      <header className="flex items-center justify-between gap-4">
        <BlurText
          as="h1"
          text="Posts"
          animateBy="letters"
          className="text-5xl font-bold tracking-tight"
        />
        {viewer ? (
          <Link
            to="/admin"
            className="rounded-full bg-white px-4 py-2 text-sm font-medium text-neutral-950"
          >
            Meus posts
          </Link>
        ) : (
          <Link
            to="/login"
            className="rounded-full bg-white px-4 py-2 text-sm font-medium text-neutral-950"
          >
            Entrar
          </Link>
        )}
      </header>
      {error ? (
        <p role="alert" className="text-red-400">
          Erro ao carregar: {error}
        </p>
      ) : (
        <PostList posts={posts} />
      )}
    </main>
  )
}
