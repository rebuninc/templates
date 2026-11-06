import { createFileRoute, Link } from "@tanstack/react-router"
import { PostForm } from "@/components/post-form"
import { getMine } from "@/lib/posts"

export const Route = createFileRoute("/admin/$postId/edit")({
  loader: ({ params }) => getMine({ data: params.postId }),
  component: EditPost,
})

function EditPost() {
  const post = Route.useLoaderData()

  return (
    <main className="mx-auto grid max-w-2xl gap-8 px-4 py-16">
      <Link to="/admin" className="text-sm text-neutral-400 hover:underline">
        ← Meus posts
      </Link>
      <h1 className="text-4xl font-bold tracking-tight">Editar post</h1>
      {post ? <PostForm post={post} /> : <p>Post não encontrado</p>}
    </main>
  )
}
