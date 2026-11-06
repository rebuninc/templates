import { createFileRoute } from "@tanstack/react-router"
import { recordClick } from "@/lib/links"

export const Route = createFileRoute("/go/$linkId")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const url = await recordClick({ data: params.linkId })
        if (!url) return new Response("Link não encontrado", { status: 404 })
        return Response.redirect(url, 302)
      },
    },
  },
})
