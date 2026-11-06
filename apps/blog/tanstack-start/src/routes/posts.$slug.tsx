import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { formatDate, Tags } from "@/components/post-list"
import { getPostBySlug } from "@/lib/posts"

export const Route = createFileRoute("/posts/$slug")({
  loader: ({ params }) => getPostBySlug({ data: params.slug }),
  component: PostPage,
})

function PostPage() {
  const post = Route.useLoaderData()

  return (
    <main className="mx-auto grid max-w-5xl gap-10 px-5 py-16 md:px-10 md:py-20">
      <Link
        to="/"
        className="flex items-center gap-1 justify-self-center text-sm text-muted hover:text-fg"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
        Posts
      </Link>
      {post ? (
        <article className="grid gap-10">
          <h1 className="mx-auto max-w-4xl text-center text-4xl leading-[1.05] font-[590] tracking-[-0.022em] text-balance md:text-5xl">
            {post.title}
          </h1>
          {post.imageUrl ? (
            <img
              src={post.imageUrl}
              alt=""
              className="aspect-video w-full rounded-lg border border-line object-cover"
            />
          ) : null}
          <p className="text-center text-muted">
            <time dateTime={post.created_at}>
              {formatDate(post.created_at)}
            </time>
          </p>
          <Tags tags={post.tags} className="-mt-6 justify-center" />
          <div className="mx-auto grid w-full max-w-156 gap-5 text-[17px] leading-[1.6] text-body">
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
        <h1 className="text-center text-2xl font-[590]">Post não encontrado</h1>
      )}
    </main>
  )
}
