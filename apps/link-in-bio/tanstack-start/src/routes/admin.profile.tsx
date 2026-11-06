import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { createFileRoute, Link, redirect } from "@tanstack/react-router"
import { ProfileForm } from "@/components/profile-form"
import { getMyProfile } from "@/lib/profiles"

export const Route = createFileRoute("/admin/profile")({
  loader: async () => {
    const result = await getMyProfile()
    if (!result.profile && !result.error) throw redirect({ to: "/admin/setup" })
    return result
  },
  component: EditProfile,
})

function EditProfile() {
  const { profile, error } = Route.useLoaderData()

  return (
    <main className="mx-auto grid max-w-2xl gap-8 px-5 py-16 md:py-20">
      <Link
        to="/admin"
        className="flex items-center gap-1 justify-self-start text-sm text-muted hover:text-fg"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
        Minha página
      </Link>
      <h1 className="text-4xl font-[510] tracking-[-0.022em]">Editar perfil</h1>
      {profile ? (
        <ProfileForm profile={profile} />
      ) : (
        <p role="alert" className="animate-alert-in text-red-400">
          Erro ao carregar: {error}
        </p>
      )}
    </main>
  )
}
