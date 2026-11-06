import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { createFileRoute, Link, redirect } from "@tanstack/react-router"
import { PostForm } from "@/components/post-form"
import { getViewer } from "@/lib/posts"

export const Route = createFileRoute("/admin/new")({
  beforeLoad: async () => {
    const viewer = await getViewer()
    if (!viewer) throw redirect({ to: "/login" })
  },
  component: NewPost,
})

function NewPost() {
  return (
    <main className="mx-auto grid max-w-2xl gap-8 px-5 py-16 md:py-20">
      <Link
        to="/admin"
        className="flex items-center gap-1 justify-self-start text-sm text-muted hover:text-fg"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
        Meus posts
      </Link>
      <h1 className="text-4xl font-[510] tracking-[-0.022em]">Novo post</h1>
      <PostForm />
    </main>
  )
}
