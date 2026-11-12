import { createFileRoute, Link } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"

import { getHome } from "../lib/rebun"

const loadHome = createServerFn().handler(() => getHome())

export const Route = createFileRoute("/")({
  loader: () => loadHome(),
  component: Home,
})

function Home() {
  const { data, error } = Route.useLoaderData()
  if (error !== null)
    return (
      <main>
        <p role="alert">Erro ao carregar: {error}</p>
      </main>
    )
  return (
    <main>
      <h1>{data.home.title}</h1>
      {data.home.subtitle && <p>{data.home.subtitle}</p>}
      {data.posts.length === 0 ? (
        <p>Nenhum post publicado.</p>
      ) : (
        <ul>
          {data.posts.map((post) => (
            <li key={post.id}>
              <article>
                <h2>
                  <Link to="/posts/$slug" params={{ slug: post.slug ?? "" }}>
                    {post.title}
                  </Link>
                </h2>
                {post.excerpt && <p>{post.excerpt}</p>}
              </article>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
