import { createClient, RebunError, type RebunMedia } from "rebun-cms"

// Matches the "Blog" template models created in the Rebun project.
export interface Post {
  id: string
  publishedAt: string | null
  updatedAt: string
  title: string | null
  slug: string | null
  excerpt: string | null
  cover: RebunMedia | null
  content: string | null
}

export interface Home {
  id: string
  publishedAt: string | null
  updatedAt: string
  title: string | null
  subtitle: string | null
}

type Schema = { collections: { post: Post }; pages: { blog: Home } }

export type Result<T> = { data: T; error: null } | { data: null; error: string }

const cms = () =>
  createClient<Schema>({
    apiKey: process.env.REBUN_API_KEY ?? "",
    baseUrl: process.env.REBUN_URL || undefined,
  })

async function run<T>(load: () => Promise<T>): Promise<Result<T>> {
  try {
    const data = await load()
    return { data, error: null }
  } catch (error) {
    if (error instanceof RebunError)
      return { data: null, error: `${error.status} ${error.code}` }
    throw error
  }
}

export const getHome = () =>
  run(async () => {
    const client = cms()
    const [home, posts] = await Promise.all([
      client.page("blog").get(),
      client.collection("post").list({ limit: 50 }),
    ])
    return { home, posts: posts.items }
  })

export const getPost = (slug: string) =>
  run(async () => {
    const { items } = await cms()
      .collection("post")
      .list({ filter: { slug }, limit: 1 })
    return items[0] ?? null
  })
