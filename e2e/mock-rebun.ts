// In-memory Rebun API for E2E; tests drive it through /__state.
type Row = Record<string, unknown>
type User = { id: string; email: string }
type State = {
  tables: Record<string, Row[]>
  users: User[]
  fail: string | null
  providers: string[]
  permissions: string[]
  projectFail: string | null
  posts: { table: string; values: Row }[]
  patches: { table: string; id: string; values: Row }[]
  deletes: { table: string; id: string }[]
  uploads: string[]
  removedFiles: string[]
  delay: number
  // Columns each table keeps unique, like the core's unique constraint.
  unique: Record<string, string[]>
}

const empty = (): State => ({
  tables: {},
  users: [],
  fail: null,
  providers: ["google", "github", "otp", "password"],
  permissions: ["auth:login"],
  projectFail: null,
  posts: [],
  patches: [],
  deletes: [],
  uploads: [],
  removedFiles: [],
  delay: 0,
  unique: {},
})
let state = empty()

// The only OTP code and password the mock accepts; auth codes and tokens just carry the user id.
const OTP = "123456"
const PASSWORD = "senha123"

const port = Number(process.argv[2])
const origin = `http://localhost:${port}`
const records = /^\/v1\/tables\/([^/]+)\/records(?:\/([^/]+))?$/
const files = /^\/v1\/buckets\/([^/]+)\/files(?:\/(.+))?$/

type Where = [string, string, unknown] | { and: Where[] } | { or: Where[] }

function matches(row: Row, node: Where): boolean {
  if (Array.isArray(node)) {
    const [column, op, value] = node
    if (op === "==") return String(row[column]) === String(value)
    if (op === "!=") return String(row[column]) !== String(value)
    throw new Error(`mock: unsupported operator ${op}`)
  }
  if ("and" in node) return node.and.every((n) => matches(row, n))
  return node.or.some((n) => matches(row, n))
}

const userOf = (req: Request) => {
  const token = req.headers.get("authorization")?.replace("Bearer ", "")
  return state.users.find((u) => `tok-${u.id}` === token) ?? null
}

const json = async (req: Request) => (await req.json()) as Row

const authCode = (user: User) => `code-${user.id}`

function handleAuth(req: Request, pathname: string) {
  if (pathname === "/v1/auth/otp/start") return Response.json(null)
  const oauth = pathname.match(/^\/v1\/auth\/(google|github)\/start$/)
  if (oauth)
    return json(req).then((body) =>
      Response.json({
        url: `${origin}/__oauth?${new URLSearchParams({ redirect: String(body.redirectUri) })}`,
      }),
    )
  if (pathname === "/v1/auth/password/sign-in")
    return json(req).then((body) => {
      const user = state.users.find((u) => u.email === body.email)
      if (!user || body.password !== PASSWORD)
        return Response.json({ error: "INVALID_CREDENTIALS" }, { status: 401 })
      return Response.json({ code: authCode(user) })
    })
  if (pathname === "/v1/auth/password/sign-up")
    return json(req).then((body) => {
      if (state.users.some((u) => u.email === body.email))
        return Response.json({ error: "USER_ALREADY_EXISTS" }, { status: 409 })
      return Response.json(null)
    })
  // The user only exists once the email is confirmed, like the real sign-up.
  if (pathname === "/v1/auth/password/sign-up/verify")
    return json(req).then((body) => {
      if (body.code !== OTP)
        return Response.json({ error: "INVALID_CODE" }, { status: 400 })
      const user = {
        id: `u${state.users.length + 1}`,
        email: String(body.email),
      }
      state.users.push(user)
      return Response.json({ code: authCode(user) })
    })
  if (pathname === "/v1/auth/otp/verify")
    return json(req).then((body) => {
      const user = state.users.find((u) => u.email === body.email)
      if (!user)
        return Response.json({ error: "SIGNUP_NOT_ALLOWED" }, { status: 403 })
      if (body.code !== OTP)
        return Response.json({ error: "INVALID_CODE" }, { status: 400 })
      return Response.json({ code: authCode(user) })
    })
  if (pathname === "/v1/oauth/token")
    return json(req).then((body) => {
      const user = state.users.find((u) => authCode(u) === body.code)
      if (!user)
        return Response.json({ error: "INVALID_GRANT" }, { status: 400 })
      return Response.json({
        accessToken: `tok-${user.id}`,
        expiresIn: 3600,
        user: { ...user, name: null, avatar: null, metadata: {} },
      })
    })
  if (pathname === "/v1/auth/me") {
    const user = userOf(req)
    if (!user) return Response.json({ error: "UNAUTHORIZED" }, { status: 401 })
    return Response.json({
      user: { ...user, name: null, avatar: null, metadata: {} },
    })
  }
  if (pathname === "/v1/oauth/revoke") return Response.json(null)
  return null
}

async function handleFiles(req: Request, bucket: string, path?: string) {
  if (path === "upload-url" && req.method === "POST") {
    const body = await json(req)
    return Response.json({ url: `${origin}/__upload/${body.path}` })
  }
  if (!path && req.method === "POST") {
    const body = await json(req)
    state.uploads.push(String(body.path))
    return Response.json({
      id: crypto.randomUUID(),
      path: body.path,
      size: 1,
      mimeType: "image/png",
      createdAt: new Date().toISOString(),
    })
  }
  if (path && req.method === "GET")
    return Response.json({ url: `${origin}/__files/${bucket}/${path}` })
  if (path && req.method === "DELETE") {
    state.removedFiles.push(decodeURIComponent(path))
    return Response.json(null)
  }
  return Response.json({ error: "NOT_FOUND" }, { status: 404 })
}

const conflict = (table: string, row: Row) =>
  (state.unique[table] ?? []).some((column) =>
    state.tables[table].some(
      (other) => other.id !== row.id && other[column] === row[column],
    ),
  )

const unique = () =>
  Response.json({ error: "UNIQUE_VIOLATION" }, { status: 409 })

async function handleRecords(req: Request, table: string, id?: string) {
  state.tables[table] ??= []
  const rows = state.tables[table]
  const now = new Date().toISOString()

  if (id) {
    const row = rows.find((r) => r.id === id)
    if (!row)
      return Response.json({ error: "RECORD_NOT_FOUND" }, { status: 404 })
    if (req.method === "GET") return Response.json(row)
    if (req.method === "DELETE") {
      state.deletes.push({ table, id })
      rows.splice(rows.indexOf(row), 1)
      return Response.json(null)
    }
    const { values } = (await req.json()) as { values: Row }
    if (conflict(table, { ...row, ...values })) return unique()
    state.patches.push({ table, id, values })
    Object.assign(row, values, { updated_at: now })
    return Response.json(row)
  }

  if (req.method === "GET") {
    if (state.fail) return Response.json({ error: state.fail }, { status: 500 })
    const where = new URL(req.url).searchParams.get("where")
    const found = rows
      .filter((row) => !where || matches(row, JSON.parse(where)))
      .toSorted((a, b) =>
        String(b.created_at).localeCompare(String(a.created_at)),
      )
    return Response.json(found, {
      headers: { "x-total-count": String(found.length) },
    })
  }

  const { values } = (await req.json()) as { values: Row }
  const row = {
    id: crypto.randomUUID(),
    owner_id: userOf(req)?.id ?? null,
    ...values,
    created_at: now,
    updated_at: now,
  }
  if (conflict(table, row)) return unique()
  state.posts.push({ table, values })
  rows.push(row)
  return Response.json(row, { status: 201 })
}

Bun.serve({
  port,
  async fetch(req) {
    const url = new URL(req.url)
    const { pathname } = url

    if (pathname === "/__state") {
      if (req.method === "GET") return Response.json(state)
      const next = (await req.json()) as Partial<State>
      state = { ...empty(), ...next }
      return new Response(null, { status: 204 })
    }
    if (state.delay) await Bun.sleep(state.delay)
    if (pathname === "/v1/project/me") {
      if (state.projectFail)
        return Response.json({ error: state.projectFail }, { status: 500 })
      return Response.json({
        providers: state.providers,
        permissions: state.permissions,
      })
    }
    if (pathname === "/__oauth") {
      const user = state.users[0]
      const target = new URL(url.searchParams.get("redirect") ?? "")
      target.searchParams.set("code", user ? authCode(user) : "none")
      return Response.redirect(target.toString(), 302)
    }
    if (pathname.startsWith("/__upload/"))
      return new Response(null, { status: 200 })
    if (pathname.startsWith("/__files/"))
      return new Response(null, { status: 404 })

    const auth = handleAuth(req, pathname)
    if (auth) return auth

    const file = pathname.match(files)
    if (file) return handleFiles(req, decodeURIComponent(file[1]), file[2])

    const record = pathname.match(records)
    if (record)
      return handleRecords(
        req,
        decodeURIComponent(record[1]),
        record[2] ? decodeURIComponent(record[2]) : undefined,
      )
    return Response.json({ error: "NOT_FOUND" }, { status: 404 })
  },
})
