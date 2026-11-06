// In-memory Rebun API for E2E; tests drive it through /__state.
type Row = Record<string, unknown>
type State = {
  tables: Record<string, Row[]>
  fail: string | null
  posts: { table: string; values: Row }[]
}

const empty = (): State => ({ tables: {}, fail: null, posts: [] })
let state = empty()

const port = Number(process.argv[2])
const records = /^\/v1\/tables\/([^/]+)\/records$/

Bun.serve({
  port,
  async fetch(req) {
    const { pathname } = new URL(req.url)

    if (pathname === "/__state") {
      if (req.method === "GET") return Response.json(state)
      const next = (await req.json()) as Partial<State>
      state = { ...empty(), ...next }
      return new Response(null, { status: 204 })
    }

    const match = pathname.match(records)
    if (!match) return Response.json({ error: "NOT_FOUND" }, { status: 404 })
    const table = decodeURIComponent(match[1])
    state.tables[table] ??= []
    const rows = state.tables[table]

    if (req.method === "GET") {
      if (state.fail)
        return Response.json({ error: state.fail }, { status: 500 })
      return Response.json(rows, {
        headers: { "x-total-count": String(rows.length) },
      })
    }

    const { values } = (await req.json()) as { values: Row }
    state.posts.push({ table, values })
    const now = new Date().toISOString()
    const row = {
      id: crypto.randomUUID(),
      ...values,
      created_at: now,
      updated_at: now,
    }
    rows.push(row)
    return Response.json(row, { status: 201 })
  },
})
