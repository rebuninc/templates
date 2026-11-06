import { getCookie, setCookie } from "@tanstack/react-start/server"
import { createClient } from "rebun-sdk"

export type Post = {
  id: string
  owner_id: string
  title: string
  slug: string
  content: string
  published: string
  image: string | null
  tags: string[] | null
  created_at: string
  updated_at: string
}

type Schema = { posts: Post }

export const BUCKET = "post-images"

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
