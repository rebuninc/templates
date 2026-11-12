// Stands in for the Rebun API; the apps reach it through REBUN_URL.
const posts = [
  {
    id: "p1",
    publishedAt: "2026-11-01T12:00:00.000Z",
    updatedAt: "2026-11-01T12:00:00.000Z",
    title: "Primeiro post",
    slug: "primeiro-post",
    excerpt: "Resumo do primeiro post",
    cover: {
      id: "m1",
      url: `http://localhost:${process.env.MOCK_PORT}/cover.png`,
      filename: "cover.png",
      mimeType: "image/png",
      size: 1,
      width: 1200,
      height: 630,
      alt: "Capa do primeiro post",
    },
    content: "## Introdução\n\nTexto do primeiro post.",
  },
  {
    id: "p2",
    publishedAt: "2026-11-02T12:00:00.000Z",
    updatedAt: "2026-11-02T12:00:00.000Z",
    title: "Segundo post",
    slug: "segundo-post",
    excerpt: "Resumo do segundo post",
    cover: null,
    content: "Só texto.",
  },
]

const page = (title: string, subtitle: string) => ({
  id: "h1",
  publishedAt: "2026-11-01T12:00:00.000Z",
  updatedAt: "2026-11-01T12:00:00.000Z",
  title,
  subtitle,
})

// The blog reads the home page and the waitlist its own waitlist page.
const pages: Record<string, ReturnType<typeof page>> = {
  home: page("Blog do Rebun", "Notas sobre o CMS"),
  waitlist: page(
    "Algo novo vem aí",
    "Deixe seu e-mail e avisamos no lançamento.",
  ),
}

async function submitWaitlist(request: Request) {
  const body = await request.json()
  const email = String(body?.email ?? "")
  if (email === "erro@exemplo.com")
    return Response.json({ error: "INTERNAL_ERROR" }, { status: 500 })
  if (!email || email !== email.trim())
    return Response.json({ error: "VALIDATION_ERROR" }, { status: 400 })
  return Response.json({ id: "w1" }, { status: 201 })
}

Bun.serve({
  port: Number(process.env.MOCK_PORT),
  fetch(request) {
    const url = new URL(request.url)
    const pageId = url.pathname.match(/^\/api\/pages\/([^/]+)$/)?.[1]
    if (pageId) return Response.json(pages[pageId] ?? null)
    if (url.pathname === "/api/forms/waitlist" && request.method === "POST")
      return submitWaitlist(request)
    if (url.pathname === "/api/collections/post") {
      const slug = url.searchParams.get("slug")
      if (slug === "erro")
        return Response.json({ error: "INTERNAL_ERROR" }, { status: 500 })
      // A 200 with no body breaks the app outside RebunError, for the 500 page.
      if (slug === "quebra") return Response.json(null)
      const items = slug ? posts.filter((p) => p.slug === slug) : posts
      return Response.json({ items, page: 1, limit: 50, total: items.length })
    }
    return Response.json({ error: "NOT_FOUND" }, { status: 404 })
  },
})
