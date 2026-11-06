import { createFileRoute, redirect } from "@tanstack/react-router"
import { ProfileForm } from "@/components/profile-form"
import { getMyProfile } from "@/lib/profiles"

export const Route = createFileRoute("/admin/setup")({
  loader: async () => {
    const { profile, error } = await getMyProfile()
    if (profile) throw redirect({ to: "/admin" })
    return { error }
  },
  component: Setup,
})

function Setup() {
  const { error } = Route.useLoaderData()

  return (
    <main className="mx-auto grid max-w-2xl gap-8 px-5 py-16 md:py-20">
      <div className="grid gap-2">
        <h1 className="text-4xl font-[510] tracking-[-0.022em]">
          Crie sua página
        </h1>
        <p className="text-muted">
          Seu username vira o endereço da página: /u/username.
        </p>
      </div>
      {error ? (
        <p role="alert" className="animate-alert-in text-red-400">
          Erro ao carregar: {error}
        </p>
      ) : (
        <ProfileForm />
      )}
    </main>
  )
}
