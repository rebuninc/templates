import { Link } from "@tanstack/react-router"
import type { ReactNode } from "react"
import type { PostView } from "@/lib/posts"

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { timeZone: "UTC" })

export const excerpt = (content: string) =>
  content.split("\n").find((line) => line.trim()) ?? ""

export function Tags({
  tags,
  className = "",
}: {
  tags: string[] | null
  className?: string
}) {
  if (!tags?.length) return null
  return (
    <ul aria-label="Tags" className={`flex flex-wrap gap-1.5 ${className}`}>
      {tags.map((tag) => (
        <li
          key={tag}
          className="rounded-full border border-line px-2.5 py-0.5 text-xs text-muted"
        >
          {tag}
        </li>
      ))}
    </ul>
  )
}

export function Cover({ src }: { src: string | null }) {
  return src ? (
    <img
      src={src}
      alt=""
      className="aspect-video w-full rounded-lg border border-line object-cover"
    />
  ) : (
    <div
      aria-hidden="true"
      className="aspect-video w-full rounded-lg border border-line bg-surface"
    />
  )
}

export function PostList({
  posts,
  actions,
}: {
  posts: PostView[]
  actions?: (post: PostView) => ReactNode
}) {
  return (
    // Padding on both sides of each rule keeps the column separators centered.
    <ul className="grid gap-y-14 sm:-mx-8 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <li
          key={post.id}
          className="group relative flex flex-col gap-4 border-line sm:border-l sm:px-8 sm:max-lg:odd:border-l-0 lg:nth-[3n+1]:border-l-0"
        >
          <div className="relative">
            <Cover src={post.imageUrl} />
            {actions ? (
              <div className="absolute top-3 right-3 z-10">{actions(post)}</div>
            ) : null}
          </div>
          <div className="grid gap-2">
            <h2 className="text-xl leading-snug font-[510] tracking-[-0.012em]">
              <Link
                to="/posts/$slug"
                params={{ slug: post.slug }}
                // Stretched link: the ::after overlay makes the whole card clickable.
                className="after:absolute after:inset-0 group-hover:text-body"
              >
                {post.title}
              </Link>
            </h2>
            <p className="line-clamp-3 leading-relaxed text-muted">
              {excerpt(post.content)}
            </p>
          </div>
          <p className="mt-auto text-sm text-muted">
            <time dateTime={post.created_at}>
              {formatDate(post.created_at)}
            </time>
            {post.published === "true" ? null : " · Rascunho"}
          </p>
          <Tags tags={post.tags} />
        </li>
      ))}
    </ul>
  )
}
