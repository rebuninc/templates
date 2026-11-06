import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { LinkForm } from "@/components/link-form"
import { getMyLink } from "@/lib/links"

export const Route = createFileRoute("/admin/links/$linkId/edit")({
  loader: ({ params }) => getMyLink({ data: params.linkId }),
  component: EditLink,
})

function EditLink() {
  const link = Route.useLoaderData()

  return (
    <main className="mx-auto grid max-w-2xl gap-8 px-5 py-16 md:py-20">
      <Link
        to="/admin"
        className="flex items-center gap-1 justify-self-start text-sm text-muted hover:text-fg"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
        Minha página
      </Link>
      <h1 className="text-4xl font-[510] tracking-[-0.022em]">Editar link</h1>
      {link ? <LinkForm link={link} /> : <p>Link não encontrado</p>}
    </main>
  )
}
