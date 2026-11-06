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
    <main className="mx-auto grid max-w-2xl gap-8 px-4 py-16">
      <Link to="/admin" className="text-sm text-neutral-400 hover:underline">
        ← Meus posts
      </Link>
      <h1 className="text-4xl font-bold tracking-tight">Novo post</h1>
      <PostForm />
    </main>
  )
}
