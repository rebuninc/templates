import { createFileRoute, Link, redirect } from "@tanstack/react-router"
import { Avatar } from "@/components/avatar"
import { LinkForm } from "@/components/link-form"
import { LinkList } from "@/components/link-list"
import { listMyLinks } from "@/lib/links"
import { colorOf, getMyProfile } from "@/lib/profiles"

export const Route = createFileRoute("/admin/")({
  loader: async () => {
    const { profile, error } = await getMyProfile()
    if (error) return { profile: null, links: [], error }
    if (!profile) throw redirect({ to: "/admin/setup" })
    const links = await listMyLinks()
    return { profile, ...links }
  },
  component: Admin,
})

function Admin() {
  const { profile, links, error } = Route.useLoaderData()

  return (
    <main className="mx-auto grid max-w-3xl gap-10 px-5 py-16 md:py-20">
      {profile ? (
        <section
          data-color={colorOf(profile.color)}
          className="flex flex-wrap items-center gap-5"
        >
          <Avatar
            src={profile.avatarUrl}
            name={profile.name}
            className="size-16 text-2xl"
          />
          <div className="grid flex-1 gap-1">
            <h1 className="text-3xl font-[510] tracking-[-0.022em]">
              {profile.name}
            </h1>
            <p className="text-muted">@{profile.username}</p>
          </div>
          <div className="flex gap-2 text-sm font-[510]">
            <Link
              to="/u/$username"
              params={{ username: profile.username }}
              className="press rounded-full bg-fg px-4 py-2 text-bg"
            >
              Ver minha página
            </Link>
            <Link
              to="/admin/profile"
              className="press rounded-full border border-line px-4 py-2 hover:bg-surface"
            >
              Editar perfil
            </Link>
          </div>
        </section>
      ) : null}
      {error ? (
        <p role="alert" className="animate-alert-in text-red-400">
          Erro ao carregar: {error}
        </p>
      ) : (
        <>
          <section className="grid gap-4">
            <h2 className="text-xl font-[510]">Novo link</h2>
            <LinkForm />
          </section>
          <section className="grid gap-4">
            <h2 className="text-xl font-[510]">Links</h2>
            <LinkList links={links} />
          </section>
        </>
      )}
    </main>
  )
}
