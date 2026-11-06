import { createClient } from "rebun-sdk"

type Schema = {
  messages: {
    id: string
    author: string
    body: string
    created_at: string
  }
}

export const rebun = createClient<Schema>({
  apiKey: process.env.REBUN_API_KEY ?? "",
  baseUrl: process.env.REBUN_URL || undefined,
})
