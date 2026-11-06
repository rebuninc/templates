import { Link } from "@tanstack/react-router"
import type { ReactNode } from "react"
import AnimatedContent from "@/components/animated-content"
import SpotlightCard from "@/components/spotlight-card"
import type { PostView } from "@/lib/posts"

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { timeZone: "UTC" })

export function Tags({ tags }: { tags: string[] | null }) {
  if (!tags?.length) return null
  return (
    <ul aria-label="Tags" className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <li
          key={tag}
          className="rounded-full bg-white/10 px-3 py-1 text-xs text-neutral-300"
        >
          {tag}
        </li>
      ))}
    </ul>
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
    <AnimatedContent
      role="list"
      trigger="mount"
      stagger={0.08}
      distance={24}
      duration={0.6}
      className="grid gap-4"
    >
      {posts.map((post) => (
        <SpotlightCard
          key={post.id}
          role="listitem"
          spotlightColor="rgba(255, 148, 180, 0.25)"
          className="grid gap-3 p-6"
        >
          {post.imageUrl ? (
            <img
              src={post.imageUrl}
              alt=""
              className="aspect-video w-full rounded-2xl object-cover"
            />
          ) : null}
          <h2 className="text-xl font-semibold">
            <Link
              to="/posts/$slug"
              params={{ slug: post.slug }}
              className="hover:underline"
            >
              {post.title}
            </Link>
          </h2>
          <p className="text-sm text-neutral-400">
            <time dateTime={post.created_at}>
              {formatDate(post.created_at)}
            </time>
            {post.published === "true" ? null : " · Rascunho"}
          </p>
          <Tags tags={post.tags} />
          {actions?.(post)}
        </SpotlightCard>
      ))}
    </AnimatedContent>
  )
}
