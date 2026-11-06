import { redirect } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"
import { deleteCookie, getRequestUrl } from "@tanstack/react-start/server"
import { TOKEN_COOKIE } from "rebun-sdk"
import { BUCKET, type Post, rebun } from "@/lib/rebun"

export type PostView = Post & { imageUrl: string | null }

const fail = (error: { status: number; code: string }) =>
  new Error(`${error.status} ${error.code}`)

export function slugify(title: string) {
  const base = title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
  const suffix = crypto.randomUUID().slice(0, 6)
  return base ? `${base}-${suffix}` : suffix
}

export const parseTags = (raw: string) =>
  raw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)

async function withImage(
  client: ReturnType<typeof rebun>,
  post: Post,
): Promise<PostView> {
  if (!post.image) return { ...post, imageUrl: null }
  const { data } = await client.storage.bucket(BUCKET).url(post.image)
  return { ...post, imageUrl: data?.url ?? null }
}

async function viewerOf(client: ReturnType<typeof rebun>) {
  const { data } = await client.auth.getSession()
  return data?.user ?? null
}

async function requireViewer(client: ReturnType<typeof rebun>) {
  const user = await viewerOf(client)
  if (!user) throw redirect({ to: "/login" })
  return user
}

export const getViewer = createServerFn().handler(async () => {
  const user = await viewerOf(rebun())
  return user ? { id: user.id, email: user.email } : null
})

export const PAGE_SIZE = 12

// Pages are 1-based and come from the URL, so anything odd falls back to 1.
export const parsePage = (raw: unknown) => {
  const page = Number(raw)
  return Number.isInteger(page) && page > 1 ? page : 1
}

async function listPage(
  client: ReturnType<typeof rebun>,
  column: "published" | "owner_id",
  value: string,
  page: number,
) {
  const { data, error, total } = await client.db
    .from("posts")
    .where(column, "==", value)
    .skip((page - 1) * PAGE_SIZE)
    .take(PAGE_SIZE)
  if (error) return { posts: [], pages: 1, error: error.code }
  const posts = await Promise.all(data.map((post) => withImage(client, post)))
  return {
    posts,
    pages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    error: null,
  }
}

export const listPublished = createServerFn()
  .validator(parsePage)
  .handler(async ({ data: page }) => {
    const client = rebun()
    return listPage(client, "published", "true", page)
  })

export const getPostBySlug = createServerFn()
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const client = rebun()
    const { data, error } = await client.db
      .from("posts")
      .where("slug", "==", slug)
      .take(1)
    const post = data?.[0]
    if (error || !post) return null
    if (post.published !== "true") {
      const user = await viewerOf(client)
      if (user?.id !== post.owner_id) return null
    }
    return withImage(client, post)
  })

export const listMine = createServerFn()
  .validator(parsePage)
  .handler(async ({ data: page }) => {
    const client = rebun()
    const user = await requireViewer(client)
    return listPage(client, "owner_id", user.id, page)
  })

export const getMine = createServerFn()
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    const client = rebun()
    const user = await requireViewer(client)
    const { data } = await client.db.from("posts").get(id)
    return data && data.owner_id === user.id ? data : null
  })

export const savePost = createServerFn({ method: "POST" })
  .validator((form: FormData) => {
    const image = form.get("image")
    return {
      id: String(form.get("id") ?? ""),
      title: String(form.get("title") ?? "").trim(),
      content: String(form.get("content") ?? "").trim(),
      tags: parseTags(String(form.get("tags") ?? "")),
      published: form.get("published") === "on",
      image: image instanceof File && image.size > 0 ? image : null,
    }
  })
  .handler(async ({ data }) => {
    if (!data.title || !data.content)
      return { error: "Preencha título e conteúdo" }
    const client = rebun()
    await requireViewer(client)
    const current = data.id ? await client.db.from("posts").get(data.id) : null
    if (current?.error) throw fail(current.error)

    let image = current?.data.image ?? null
    if (data.image) {
      const path = `${crypto.randomUUID()}-${data.image.name}`
      const uploaded = await client.storage
        .bucket(BUCKET)
        .upload(path, data.image)
      if (uploaded.error) throw fail(uploaded.error)
      image = path
    }

    const values = {
      title: data.title,
      content: data.content,
      tags: data.tags,
      published: String(data.published),
      image,
    }
    const saved = current
      ? await client.db.from("posts").update(data.id, values)
      : await client.db
          .from("posts")
          .create({ ...values, slug: slugify(data.title) })
    if (saved.error) throw fail(saved.error)

    const old = current?.data.image
    if (old && old !== image) await client.storage.bucket(BUCKET).delete(old)
    return { error: null }
  })

export const deletePost = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    const client = rebun()
    const current = await client.db.from("posts").get(id)
    if (current.error) throw fail(current.error)
    const deleted = await client.db.from("posts").delete(id)
    if (deleted.error) throw fail(deleted.error)
    if (current.data.image)
      await client.storage.bucket(BUCKET).delete(current.data.image)
  })

const redirectUri = () => `${getRequestUrl().origin}/callback`

export const sendCode = createServerFn({ method: "POST" })
  .validator((email: string) => String(email).trim())
  .handler(async ({ data: email }) => {
    const { error } = await rebun().auth.signIn("otp", {
      email,
      redirectUri: redirectUri(),
    })
    return { error: error?.code ?? null }
  })

export const verifyCode = createServerFn({ method: "POST" })
  .validator((input: { email: string; code: string }) => ({
    email: String(input.email).trim(),
    code: String(input.code).trim(),
  }))
  .handler(async ({ data }) => {
    const { error } = await rebun().auth.verify(data)
    return { error: error?.code ?? null }
  })

export const getProviders = createServerFn().handler(async () => {
  const { data, error } = await rebun().project.me()
  return { providers: data?.providers ?? [], error: error?.code ?? null }
})

export const startOAuth = createServerFn({ method: "POST" })
  .validator((provider: "google" | "github") => provider)
  .handler(async ({ data: provider }) => {
    const { data, error } = await rebun().auth.signIn(provider, {
      redirectUri: redirectUri(),
    })
    return error
      ? { url: null, error: error.code }
      : { url: data.url, error: null }
  })

export const signInPassword = createServerFn({ method: "POST" })
  .validator((input: { email: string; password: string }) => ({
    email: String(input.email).trim(),
    password: String(input.password),
  }))
  .handler(async ({ data }) => {
    const { error } = await rebun().auth.signIn("password", {
      ...data,
      redirectUri: redirectUri(),
    })
    return { error: error?.code ?? null }
  })

export const exchangeCode = createServerFn()
  .validator((code: string) => String(code))
  .handler(async ({ data: code }) => {
    const { error } = await rebun().auth.exchangeCode(code)
    return { error: error?.code ?? null }
  })

export const signOut = createServerFn({ method: "POST" }).handler(async () => {
  const { error } = await rebun().auth.signOut()
  // The SDK keeps the cookie when revoke fails (e.g. expired token); drop it anyway.
  if (error) deleteCookie(TOKEN_COOKIE, { path: "/" })
})
