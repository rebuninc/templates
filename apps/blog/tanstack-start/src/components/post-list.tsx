import { Link } from "@tanstack/react-router"
import { motion } from "motion/react"

import { enter, spring, useEnterFrom } from "../lib/motion"
import type { Post } from "../lib/rebun"

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { timeZone: "UTC" })

export const postDate = (post: Post) => post.publishedAt ?? post.updatedAt

export function Cover({ post }: { post: Post }) {
  // The box holds the 16:9 ratio, so covers with and without an image line up.
  return (
    <div
      data-cover
      className="aspect-video overflow-hidden rounded-lg border border-line bg-island"
    >
      {post.cover && (
        <img
          src={post.cover.url}
          alt=""
          className="size-full object-cover transition-[scale] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-safe:group-hover:scale-[1.03]"
        />
      )}
    </div>
  )
}

export function PostList({ posts }: { posts: Post[] }) {
  const from = useEnterFrom()
  return (
    // Every card keeps the 1px rule (transparent on the first column) so widths match.
    <ul className="relative grid gap-y-14 sm:-mx-8 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post, i) => (
        <motion.li
          key={post.id}
          initial={from}
          animate="show"
          variants={enter}
          transition={{ ...spring, delay: i * 0.04 }}
          className="border-line sm:border-l sm:px-8 sm:max-lg:odd:border-l-transparent lg:nth-[3n+1]:border-l-transparent"
        >
          <article className="group relative flex h-full flex-col gap-4">
            <Cover post={post} />
            <div className="grid gap-2">
              <h2 className="text-xl leading-snug font-[510] tracking-[-0.012em]">
                <Link
                  to="/posts/$slug"
                  params={{ slug: post.slug ?? "" }}
                  // Stretched link: the ::after overlay makes the whole card clickable.
                  className="after:absolute after:inset-0 group-hover:text-body"
                >
                  {post.title}
                </Link>
              </h2>
              {post.excerpt && (
                <p className="line-clamp-3 leading-relaxed text-muted">
                  {post.excerpt}
                </p>
              )}
            </div>
            <p className="mt-auto text-sm text-muted">
              <time dateTime={postDate(post)}>
                {formatDate(postDate(post))}
              </time>
            </p>
          </article>
        </motion.li>
      ))}
    </ul>
  )
}
