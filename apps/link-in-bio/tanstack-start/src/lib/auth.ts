import { redirect } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"
import { deleteCookie, getRequestUrl } from "@tanstack/react-start/server"
import { TOKEN_COOKIE } from "rebun-sdk"
import { rebun } from "@/lib/rebun"

export const fail = (error: { status: number; code: string }) =>
  new Error(`${error.status} ${error.code}`)

export async function viewerOf(client: ReturnType<typeof rebun>) {
  const { data } = await client.auth.getSession()
  return data?.user ?? null
}

export async function requireViewer(client: ReturnType<typeof rebun>) {
  const user = await viewerOf(client)
  if (!user) throw redirect({ to: "/login" })
  return user
}

export const getViewer = createServerFn().handler(async () => {
  const user = await viewerOf(rebun())
  return user ? { id: user.id, email: user.email } : null
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
  return {
    providers: data?.providers ?? [],
    signUp: data?.permissions.includes("auth:signup") ?? false,
    error: error?.code ?? null,
  }
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

export const signUpPassword = createServerFn({ method: "POST" })
  .validator((input: { email: string; password: string }) => ({
    email: String(input.email).trim(),
    password: String(input.password),
  }))
  .handler(async ({ data }) => {
    const { error } = await rebun().auth.signUp({
      ...data,
      redirectUri: redirectUri(),
    })
    return { error: error?.code ?? null }
  })

export const verifySignUp = createServerFn({ method: "POST" })
  .validator((input: { email: string; code: string }) => ({
    email: String(input.email).trim(),
    code: String(input.code).trim(),
  }))
  .handler(async ({ data }) => {
    const { error } = await rebun().auth.verifySignUp(data)
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
