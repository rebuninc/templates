import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { createFileRoute, Link, notFound } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"
import { motion } from "motion/react"

import { Markdown } from "../../components/markdown"
import { formatDate, postDate } from "../../components/post-list"
import { NotFound } from "../../components/status-page"
import { enter, spring, useEnterFrom } from "../../lib/motion"
import { getPost } from "../../lib/rebun"

const loadPost = createServerFn()
  .validator((slug: string) => String(slug).trim())
  .handler(({ data }) => getPost(data))

export const Route = createFileRoute("/posts/$slug")({
  loader: async ({ params }) => {
    const result = await loadPost({ data: params.slug })
    if (result.error === null && !result.data) throw notFound()
    return result
  },
  component: PostPage,
  notFoundComponent: () => <NotFound title="Post não encontrado" />,
})

const sequence = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } }

function PostPage() {
  const { data: post, error } = Route.useLoaderData()
  const from = useEnterFrom()
  return (
    <main className="mx-auto grid w-full max-w-5xl gap-10 px-5 py-16 md:px-10 md:py-20">
      <Link
        to="/"
        className="flex items-center gap-1 justify-self-center text-sm text-muted hover:text-fg"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
        Posts
      </Link>
      {error !== null ? (
        <p role="alert" className="animate-alert-in text-center text-red-400">
          Erro ao carregar: {error}
        </p>
      ) : !post ? null : (
        <motion.article
          initial={from}
          animate="show"
          variants={sequence}
          className="grid gap-10"
        >
          <motion.h1
            variants={enter}
            transition={spring}
            className="mx-auto max-w-4xl text-center text-4xl leading-[1.05] font-[590] tracking-[-0.022em] text-balance md:text-5xl"
          >
            {post.title}
          </motion.h1>
          {post.cover && (
            <motion.img
              variants={enter}
              transition={spring}
              src={post.cover.url}
              alt={post.cover.alt ?? ""}
              width={post.cover.width ?? undefined}
              height={post.cover.height ?? undefined}
              className="aspect-video w-full rounded-lg border border-line object-cover"
            />
          )}
          <motion.p
            variants={enter}
            transition={spring}
            className="text-center text-muted"
          >
            <time dateTime={postDate(post)}>{formatDate(postDate(post))}</time>
          </motion.p>
          <motion.div
            variants={enter}
            transition={spring}
            className="mx-auto grid w-full max-w-156 gap-5 text-[17px] leading-[1.6] text-body"
          >
            <Markdown source={post.content ?? ""} />
          </motion.div>
        </motion.article>
      )}
    </main>
  )
}
