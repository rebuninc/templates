import { createFileRoute } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"
// react-markdown skips raw HTML, so CMS content can't inject markup.
import Markdown from "react-markdown"

import { getPost } from "../../lib/rebun"

const loadPost = createServerFn()
  .validator((slug: string) => String(slug).trim())
  .handler(({ data }) => getPost(data))

export const Route = createFileRoute("/posts/$slug")({
  loader: ({ params }) => loadPost({ data: params.slug }),
  component: PostPage,
})

function PostPage() {
  const { data: post, error } = Route.useLoaderData()
  if (error !== null)
    return (
      <main>
        <p role="alert">Erro ao carregar: {error}</p>
      </main>
    )
  if (!post)
    return (
      <main>
        <p>Post não encontrado</p>
      </main>
    )
  return (
    <main>
      <article>
        <h1>{post.title}</h1>
        {post.cover && (
          <img
            src={post.cover.url}
            alt={post.cover.alt ?? ""}
            width={post.cover.width ?? undefined}
            height={post.cover.height ?? undefined}
          />
        )}
        <Markdown>{post.content ?? ""}</Markdown>
      </article>
    </main>
  )
}
