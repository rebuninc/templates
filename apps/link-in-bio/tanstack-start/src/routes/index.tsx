import { createFileRoute, getRouteApi, Link } from "@tanstack/react-router"

export const Route = createFileRoute("/")({ component: Home })

const root = getRouteApi("__root__")

function Home() {
  const viewer = root.useLoaderData()

  return (
    <main className="mx-auto grid max-w-3xl justify-items-center gap-8 px-5 py-24 text-center md:py-32">
      <h1 className="text-5xl leading-none font-[510] tracking-[-0.022em] md:text-6xl">
        Todos os seus links numa página só
      </h1>
      <p className="max-w-xl text-lg text-muted">
        Crie sua página, compartilhe um único link e veja quantos cliques cada
        um recebe.
      </p>
      <Link
        to={viewer ? "/admin" : "/login"}
        className="press rounded-full bg-fg px-6 py-3 font-[510] text-bg"
      >
        {viewer ? "Minha página" : "Criar minha página"}
      </Link>
    </main>
  )
}
