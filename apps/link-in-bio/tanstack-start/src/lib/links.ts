import { createServerFn } from "@tanstack/react-start"
import { fail, requireViewer } from "@/lib/auth"
import { byPosition } from "@/lib/profiles"
import { type LinkRow, rebun } from "@/lib/rebun"

export type LinkView = LinkRow & { clicks: number }

// Bare domains get https://; only http(s) survives, so no javascript: links.
export function normalizeUrl(raw: string) {
  const trimmed = raw.trim()
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`
  try {
    const url = new URL(withScheme)
    return url.protocol === "http:" || url.protocol === "https:"
      ? withScheme
      : null
  } catch {
    return null
  }
}

async function myLinks(client: ReturnType<typeof rebun>, ownerId: string) {
  const { data, error } = await client.db
    .from("links")
    .where("owner_id", "==", ownerId)
    .take(50)
  if (error) throw fail(error)
  return data.toSorted(byPosition)
}

const parseLink = (input: { id?: string; title: string; url: string }) => ({
  id: String(input.id ?? ""),
  title: String(input.title).trim(),
  url: String(input.url).trim(),
})

function validLink(input: { title: string; url: string }) {
  if (!input.title || !input.url)
    return { error: "Preencha todos os campos", url: null }
  const url = normalizeUrl(input.url)
  return url ? { error: null, url } : { error: "URL inválida", url: null }
}

export const listMyLinks = createServerFn().handler(async () => {
  const client = rebun()
  const user = await requireViewer(client)
  const { data, error } = await client.db
    .from("links")
    .where("owner_id", "==", user.id)
    .take(50)
  if (error) return { links: [], error: error.code }
  // ponytail: one count query per link (max 50); a grouped count endpoint would make it one.
  const links = await Promise.all(
    data.toSorted(byPosition).map(async (link) => {
      const { total } = await client.db
        .from("clicks")
        .where("link_id", "==", link.id)
        .take(1)
      return { ...link, clicks: total ?? 0 }
    }),
  )
  return { links, error: null }
})

export const getMyLink = createServerFn()
  .validator((id: string) => String(id))
  .handler(async ({ data: id }) => {
    const client = rebun()
    const user = await requireViewer(client)
    const { data } = await client.db.from("links").get(id)
    return data && data.owner_id === user.id ? data : null
  })

export const addLink = createServerFn({ method: "POST" })
  .validator(parseLink)
  .handler(async ({ data }) => {
    const { error, url } = validLink(data)
    if (!url) return { error }
    const client = rebun()
    const user = await requireViewer(client)
    const links = await myLinks(client, user.id)
    const last = links.at(-1)
    const position = last ? Number(last.position) + 1 : 0
    const created = await client.db
      .from("links")
      .create({ title: data.title, url, position: String(position) })
    if (created.error) throw fail(created.error)
    return { error: null }
  })

export const updateLink = createServerFn({ method: "POST" })
  .validator(parseLink)
  .handler(async ({ data }) => {
    const { error, url } = validLink(data)
    if (!url) return { error }
    const client = rebun()
    await requireViewer(client)
    const saved = await client.db
      .from("links")
      .update(data.id, { title: data.title, url })
    if (saved.error) throw fail(saved.error)
    return { error: null }
  })

export const moveLink = createServerFn({ method: "POST" })
  .validator((input: { id: string; direction: "up" | "down" }) => ({
    id: String(input.id),
    direction: input.direction === "up" ? "up" : "down",
  }))
  .handler(async ({ data }) => {
    const client = rebun()
    const user = await requireViewer(client)
    const links = await myLinks(client, user.id)
    const index = links.findIndex((link) => link.id === data.id)
    const other = links[index + (data.direction === "up" ? -1 : 1)]
    if (index < 0 || !other) return
    const link = links[index]
    const first = await client.db
      .from("links")
      .update(link.id, { position: other.position })
    if (first.error) throw fail(first.error)
    const second = await client.db
      .from("links")
      .update(other.id, { position: link.position })
    if (second.error) throw fail(second.error)
  })

export const deleteLink = createServerFn({ method: "POST" })
  .validator((id: string) => String(id))
  .handler(async ({ data: id }) => {
    const deleted = await rebun().db.from("links").delete(id)
    if (deleted.error) throw fail(deleted.error)
  })

// Called by the /go server route; a failed click write must not block the visitor.
export const recordClick = createServerFn()
  .validator((id: string) => String(id))
  .handler(async ({ data: id }) => {
    const client = rebun()
    const { data } = await client.db.from("links").get(id)
    if (!data) return null
    await client.db.from("clicks").create({ link_id: id })
    return data.url
  })
