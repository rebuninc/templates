import { createFileRoute, Link, redirect } from "@tanstack/react-router"
import { exchangeCode } from "@/lib/posts"

export const Route = createFileRoute("/callback")({
  validateSearch: (search: Record<string, unknown>) => ({
    code: String(search.code ?? ""),
    error: search.error ? String(search.error) : undefined,
  }),
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    if (deps.error) return { error: deps.error }
    const result = await exchangeCode({ data: deps.code })
    if (result.error) return result
    throw redirect({ to: "/admin" })
  },
  component: Callback,
})

function Callback() {
  const { error } = Route.useLoaderData()

  return (
    <main className="mx-auto grid max-w-sm gap-4 px-5 py-24 text-center">
      <p role="alert" className="animate-alert-in text-red-400">
        Erro ao entrar: {error}
      </p>
      <Link to="/login" className="text-muted hover:text-fg">
        Voltar para o login
      </Link>
    </main>
  )
}
