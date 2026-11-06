import { createFileRoute, useRouter } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"
import { rebun } from "@/lib/rebun"

const listMessages = createServerFn().handler(async () => {
  const { data, error } = await rebun.db.from("messages").take(50)
  return error
    ? { messages: [], error: error.code }
    : { messages: data, error: null }
})

const sendMessage = createServerFn({ method: "POST" })
  .validator((form: FormData) => ({
    author: String(form.get("author") ?? "").trim(),
    body: String(form.get("body") ?? "").trim(),
  }))
  .handler(async ({ data }) => {
    if (!data.author || !data.body) return
    const { error } = await rebun.db.from("messages").create(data)
    if (error) throw new Error(`${error.status} ${error.code}`)
  })

export const Route = createFileRoute("/")({
  loader: () => listMessages(),
  component: Home,
})

function Home() {
  const { messages, error } = Route.useLoaderData()
  const router = useRouter()

  return (
    <main>
      <h1>Guestbook</h1>
      <form
        style={{ display: "grid", gap: 8 }}
        onSubmit={async (e) => {
          e.preventDefault()
          const form = e.currentTarget
          await sendMessage({ data: new FormData(form) })
          form.reset()
          await router.invalidate()
        }}
      >
        <input name="author" placeholder="Nome" required maxLength={80} />
        <textarea name="body" placeholder="Recado" required maxLength={500} />
        <button type="submit">Enviar</button>
      </form>
      {error ? (
        <p role="alert">Erro ao carregar: {error}</p>
      ) : (
        <ul>
          {messages.map((m) => (
            <li key={m.id}>
              <strong>{m.author}</strong>: {m.body}
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
