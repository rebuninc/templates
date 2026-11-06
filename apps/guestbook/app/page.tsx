import { revalidatePath } from "next/cache"
import { rebun } from "@/lib/rebun"

export const dynamic = "force-dynamic"

async function send(form: FormData) {
  "use server"
  const author = String(form.get("author") ?? "").trim()
  const body = String(form.get("body") ?? "").trim()
  if (!author || !body) return
  const { error } = await rebun.db.from("messages").create({ author, body })
  if (error) throw new Error(`${error.status} ${error.code}`)
  revalidatePath("/")
}

export default async function Home() {
  const { data, error } = await rebun.db.from("messages").take(50)

  return (
    <main>
      <h1>Guestbook</h1>
      <form action={send} style={{ display: "grid", gap: 8 }}>
        <input name="author" placeholder="Nome" required maxLength={80} />
        <textarea name="body" placeholder="Recado" required maxLength={500} />
        <button type="submit">Enviar</button>
      </form>
      {error ? (
        <p role="alert">Erro ao carregar: {error.code}</p>
      ) : (
        <ul>
          {data.map((m) => (
            <li key={m.id}>
              <strong>{m.author}</strong>: {m.body}
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
