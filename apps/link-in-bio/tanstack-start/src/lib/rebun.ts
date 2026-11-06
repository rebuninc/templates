import { getCookie, setCookie } from "@tanstack/react-start/server"
import { createClient } from "rebun-sdk"

type Row = {
  id: string
  owner_id: string
  created_at: string
  updated_at: string
}

export type Profile = Row & {
  username: string
  name: string
  bio: string | null
  avatar: string | null
  color: string
}

export type LinkRow = Row & { title: string; url: string; position: string }

export type Click = Row & { link_id: string }

type Schema = { profiles: Profile; links: LinkRow; clicks: Click }

export const BUCKET = "avatars"

// One client per request so the session lives only in this request's httpOnly cookie.
export const rebun = () => {
  // Password sign-in reads the PKCE cookie it just set, which the request doesn't carry yet.
  const written = new Map<string, string>()
  return createClient<Schema>({
    apiKey: process.env.REBUN_API_KEY ?? "",
    baseUrl: process.env.REBUN_URL || undefined,
    cookies: {
      get: (name) => written.get(name) ?? getCookie(name),
      set: (name, value, options) => {
        written.set(name, value)
        setCookie(name, value, options)
      },
    },
  })
}
