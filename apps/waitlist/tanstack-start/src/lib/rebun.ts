import { createClient, RebunError } from "rebun-cms"

// Matches the "Lista de espera" template models created in the Rebun project.
export interface Home {
  id: string
  publishedAt: string | null
  updatedAt: string
  eyebrow: string | null
  headline: string | null
  description: string | null
  launchAt: string | null
}

export interface WaitlistForm {
  email: string
}

type Schema = {
  collections: Record<never, never>
  pages: { waitlist: Home }
  forms: { waitlist: WaitlistForm }
}

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

export const getHome = () => run(() => cms().page("waitlist").get())

export const joinWaitlist = (email: string) =>
  run(() => cms().form("waitlist").submit({ email }))
