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

const entry = {
  id: "h1",
  publishedAt: "2026-11-01T12:00:00.000Z",
  updatedAt: "2026-11-01T12:00:00.000Z",
}

// Each template reads the page named after it.
const pages: Record<string, object> = {
  blog: {
    ...entry,
    title: "Blog do Rebun",
    subtitle: "Notas sobre o CMS",
  },
  waitlist: {
    ...entry,
    eyebrow: "Lista de espera aberta",
    headline: "Algo novo vem aí",
    description: "Deixe seu e-mail e avisamos no lançamento.",
    // Far future so the countdown always shows; the readable date is stable.
    "launch-at": "2099-12-15T15:00:00.000Z",
  },
}

// Pages set by POST /__mock/fail-next/:page answer the next read with a 500.
const failNext = new Set<string>()

// Fields set by POST /__mock/next/:page are merged into that page's next read only.
const nextFields = new Map<string, object>()

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
    const failId = url.pathname.match(/^\/__mock\/fail-next\/([^/]+)$/)?.[1]
    if (failId && request.method === "POST") {
      failNext.add(failId)
      return new Response(null, { status: 204 })
    }
    const nextId = url.pathname.match(/^\/__mock\/next\/([^/]+)$/)?.[1]
    if (nextId && request.method === "POST")
      return request.json().then((fields) => {
        nextFields.set(nextId, fields)
        return new Response(null, { status: 204 })
      })
    if (pageId && failNext.delete(pageId))
      return Response.json({ error: "INTERNAL_ERROR" }, { status: 500 })
    if (pageId) {
      const fields = nextFields.get(pageId)
      nextFields.delete(pageId)
      return Response.json(
        pages[pageId] ? { ...pages[pageId], ...fields } : null,
      )
    }
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
