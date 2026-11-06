import { createFileRoute, Link } from "@tanstack/react-router"
import BlurText from "@/components/blur-text"
import { formatDate, Tags } from "@/components/post-list"
import { getPostBySlug } from "@/lib/posts"

export const Route = createFileRoute("/posts/$slug")({
  loader: ({ params }) => getPostBySlug({ data: params.slug }),
  component: PostPage,
})

function PostPage() {
  const post = Route.useLoaderData()

  return (
    <main className="mx-auto grid max-w-2xl gap-6 px-4 py-16">
      <Link to="/" className="text-sm text-neutral-400 hover:underline">
        ← Posts
      </Link>
      {post ? (
        <article className="grid gap-6">
          {post.imageUrl ? (
            <img
              src={post.imageUrl}
              alt=""
              className="aspect-video w-full rounded-3xl object-cover"
            />
          ) : null}
          <BlurText
            as="h1"
            text={post.title}
            className="text-4xl font-bold tracking-tight"
          />
          <p className="text-sm text-neutral-400">
            <time dateTime={post.created_at}>
              {formatDate(post.created_at)}
            </time>
          </p>
          <Tags tags={post.tags} />
          <div className="grid gap-4 leading-relaxed text-neutral-200">
            {post.content
              .split("\n")
              .filter(Boolean)
              .map((paragraph, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: paragraphs have no id and never reorder
                <p key={i}>{paragraph}</p>
              ))}
          </div>
        </article>
      ) : (
        <h1 className="text-2xl font-semibold">Post não encontrado</h1>
      )}
    </main>
  )
}
