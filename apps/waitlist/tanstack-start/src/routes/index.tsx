import { createFileRoute } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"

import { WaitlistForm } from "../components/waitlist-form"
import { getHome, joinWaitlist } from "../lib/rebun"

const loadHome = createServerFn().handler(() => getHome())

const join = createServerFn({ method: "POST" })
  .validator((email: string) => String(email).trim())
  .handler(({ data }) => joinWaitlist(data))

export const Route = createFileRoute("/")({
  loader: () => loadHome(),
  component: Home,
})

const page =
  "mx-auto flex w-full max-w-4xl flex-col items-center gap-10 px-5 py-28 text-center md:px-10 md:py-40"

function Home() {
  const { data: home, error } = Route.useLoaderData()
  if (error !== null)
    return (
      <main className={page}>
        <p role="alert" className="animate-alert-in text-red-400">
          Erro ao carregar: {error}
        </p>
      </main>
    )
  return (
    <main className={page}>
      <div className="grid gap-5">
        <h1 className="text-5xl leading-[1.02] font-[590] tracking-[-0.03em] text-balance md:text-7xl">
          {home.title}
        </h1>
        {home.subtitle && (
          <p className="mx-auto max-w-xl text-lg text-pretty text-muted">
            {home.subtitle}
          </p>
        )}
      </div>
      <WaitlistForm onJoin={(email) => join({ data: email })} />
    </main>
  )
}
