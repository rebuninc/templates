import { createFileRoute } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"

import { EmptyState } from "../components/empty-state"
import { Heading } from "../components/heading"
import { PostList } from "../components/post-list"
import { getHome } from "../lib/rebun"

const loadHome = createServerFn().handler(() => getHome())

export const Route = createFileRoute("/")({
  loader: () => loadHome(),
  component: Home,
})

const page = "mx-auto grid w-full max-w-7xl gap-14 px-5 py-16 md:px-10 md:py-20"

function Home() {
  const { data, error } = Route.useLoaderData()
  if (error !== null)
    return (
      <main className={page}>
        <p role="alert" className="animate-alert-in text-red-400">
          Erro ao carregar: {error}
        </p>
      </main>
    )
  return (
    <main className={page}>
      <Heading title={data.home.title ?? ""} subtitle={data.home.subtitle} />
      {data.posts.length === 0 ? (
        <EmptyState
          title="Nenhum post publicado."
          subtitle="Os posts publicados aparecem aqui."
        />
      ) : (
        <PostList posts={data.posts} />
      )}
    </main>
  )
}
