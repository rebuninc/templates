import { createFileRoute } from "@tanstack/react-router"
import { Avatar } from "@/components/avatar"
import { colorOf, getPublicProfile } from "@/lib/profiles"

export const Route = createFileRoute("/u/$username")({
  loader: ({ params }) => getPublicProfile({ data: params.username }),
  head: ({ loaderData }) => ({
    meta: loaderData?.profile ? [{ title: loaderData.profile.name }] : [],
  }),
  component: PublicProfile,
})

function PublicProfile() {
  const { profile, links, error } = Route.useLoaderData()

  if (error)
    return (
      <main className="mx-auto max-w-md px-5 py-24 text-center">
        <p role="alert" className="animate-alert-in text-red-400">
          Erro ao carregar: {error}
        </p>
      </main>
    )
  if (!profile)
    return (
      <main className="mx-auto max-w-md px-5 py-24 text-center">
        <h1 className="text-2xl font-[510]">Perfil não encontrado</h1>
      </main>
    )

  return (
    <main
      data-color={colorOf(profile.color)}
      className="mx-auto grid max-w-md justify-items-center gap-6 px-5 py-16 text-center"
    >
      <Avatar src={profile.avatarUrl} name={profile.name} />
      <div className="grid gap-2">
        <h1 className="text-3xl font-[590] tracking-[-0.018em]">
          {profile.name}
        </h1>
        {profile.bio ? <p className="text-muted">{profile.bio}</p> : null}
      </div>
      <ul aria-label="Links" className="grid w-full gap-3">
        {links.map((link) => (
          <li key={link.id}>
            <a
              href={`/go/${link.id}`}
              className="press block rounded-full bg-(--accent) px-6 py-3.5 font-[510] text-white hover:brightness-110"
            >
              {link.title}
            </a>
          </li>
        ))}
      </ul>
    </main>
  )
}
