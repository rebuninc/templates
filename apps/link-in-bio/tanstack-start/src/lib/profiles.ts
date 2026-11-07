import { createServerFn } from "@tanstack/react-start"
import { fail, requireViewer } from "@/lib/auth"
import { BUCKET, type LinkRow, type Profile, rebun } from "@/lib/rebun"

export type ProfileView = Profile & { avatarUrl: string | null }

export const COLORS = [
  "violet",
  "blue",
  "green",
  "orange",
  "pink",
  "gray",
] as const

export const COLOR_LABELS: Record<(typeof COLORS)[number], string> = {
  violet: "Violeta",
  blue: "Azul",
  green: "Verde",
  orange: "Laranja",
  pink: "Rosa",
  gray: "Cinza",
}

export const colorOf = (color: string | null | undefined) =>
  COLORS.find((c) => c === color) ?? "violet"

export const normalizeUsername = (raw: string) => raw.trim().toLowerCase()

export const isUsername = (username: string) =>
  /^[a-z0-9_.]{3,30}$/.test(username)

async function withAvatar(
  client: ReturnType<typeof rebun>,
  profile: Profile,
): Promise<ProfileView> {
  if (!profile.avatar) return { ...profile, avatarUrl: null }
  const { data } = await client.storage.bucket(BUCKET).url(profile.avatar)
  return { ...profile, avatarUrl: data?.url ?? null }
}

export async function profileOf(
  client: ReturnType<typeof rebun>,
  ownerId: string,
) {
  const { data, error } = await client.db
    .from("profiles")
    .where("owner_id", "==", ownerId)
    .take(1)
  if (error) return { profile: null, error: error.code }
  return { profile: data[0] ?? null, error: null }
}

export const byPosition = (a: LinkRow, b: LinkRow) =>
  Number(a.position) - Number(b.position)

export const getMyProfile = createServerFn().handler(async () => {
  const client = rebun()
  const user = await requireViewer(client)
  const { profile, error } = await profileOf(client, user.id)
  if (!profile) return { profile: null, error }
  return { profile: await withAvatar(client, profile), error: null }
})

export const getPublicProfile = createServerFn()
  .validator((username: string) => normalizeUsername(String(username)))
  .handler(async ({ data: username }) => {
    const client = rebun()
    const found = await client.db
      .from("profiles")
      .where("username", "==", username)
      .take(1)
    if (found.error)
      return { profile: null, links: [], error: found.error.code }
    const profile = found.data[0]
    if (!profile) return { profile: null, links: [], error: null }
    const links = await client.db
      .from("links")
      .where("owner_id", "==", profile.owner_id)
      .take(50)
    if (links.error)
      return { profile: null, links: [], error: links.error.code }
    return {
      profile: await withAvatar(client, profile),
      links: links.data.toSorted(byPosition),
      error: null,
    }
  })

export const saveProfile = createServerFn({ method: "POST" })
  .validator((form: FormData) => {
    const avatar = form.get("avatar")
    return {
      username: normalizeUsername(String(form.get("username") ?? "")),
      name: String(form.get("name") ?? "").trim(),
      bio: String(form.get("bio") ?? "").trim(),
      color: colorOf(String(form.get("color") ?? "")),
      avatar: avatar instanceof File && avatar.size > 0 ? avatar : null,
      removeAvatar: form.get("avatar-remove") === "on",
    }
  })
  .handler(async ({ data }) => {
    if (!data.username || !data.name)
      return { error: "Preencha todos os campos" }
    if (!isUsername(data.username)) return { error: "Username inválido" }
    const client = rebun()
    const user = await requireViewer(client)
    const current = await profileOf(client, user.id)
    if (current.error) throw new Error(current.error)

    const bucket = client.storage.bucket(BUCKET)
    let avatar = data.removeAvatar ? null : (current.profile?.avatar ?? null)
    if (data.avatar) {
      const path = `${crypto.randomUUID()}-${data.avatar.name}`
      const uploaded = await bucket.upload(path, data.avatar)
      if (uploaded.error) throw fail(uploaded.error)
      avatar = path
    }

    const values = {
      username: data.username,
      name: data.name,
      bio: data.bio || null,
      color: data.color,
      avatar,
    }
    const saved = current.profile
      ? await client.db.from("profiles").update(current.profile.id, values)
      : await client.db.from("profiles").create(values)
    const old = current.profile?.avatar ?? null
    if (saved.error) {
      // Drop the just-uploaded avatar so a failed save leaves no orphan file.
      if (avatar && avatar !== old) await bucket.delete(avatar)
      if (saved.error.status === 409) return { error: "Username já em uso" }
      throw fail(saved.error)
    }
    if (old && old !== avatar) await bucket.delete(old)
    return { error: null }
  })
