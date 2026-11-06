import { expect, type Page, test } from "@playwright/test"

type Mock = { tables?: Record<string, unknown[]>; fail?: string | null }
type Post = { table: string; values: Record<string, unknown> }

const mockUrl = () => test.info().project.metadata.mockUrl as string

async function setMock(state: Mock) {
  await fetch(`${mockUrl()}/__state`, {
    method: "POST",
    body: JSON.stringify(state),
  })
}

async function posts() {
  const res = await fetch(`${mockUrl()}/__state`)
  const state = (await res.json()) as { posts: Post[] }
  return state.posts
}

// Wait for hydration so the TanStack form submits through JS, not natively.
const open = (page: Page) => page.goto("/", { waitUntil: "networkidle" })

const message = (id: string, author: string, body: string) => ({
  id,
  author,
  body,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
})

test.beforeEach(async () => {
  await setMock({
    tables: {
      messages: [message("1", "Ana", "Olá"), message("2", "Bia", "Oi")],
    },
  })
})

test("renders the same screen", async ({ page }) => {
  await open(page)
  await expect(page.locator("main")).toMatchAriaSnapshot({
    name: "list.aria.yml",
  })
})

test("fields have the same attributes", async ({ page }) => {
  await open(page)
  const author = page.getByPlaceholder("Nome")
  const body = page.getByPlaceholder("Recado")
  await expect(author).toHaveAttribute("required", "")
  await expect(author).toHaveAttribute("maxlength", "80")
  await expect(body).toHaveAttribute("required", "")
  await expect(body).toHaveAttribute("maxlength", "500")
})

test("shows the load error", async ({ page }) => {
  await setMock({ fail: "BOOM" })
  await open(page)
  // Scoped to main: Next adds its own route announcer with role="alert".
  await expect(page.locator("main").getByRole("alert")).toHaveText(
    "Erro ao carregar: BOOM",
  )
})

test("sends a trimmed message and clears the form", async ({ page }) => {
  await open(page)
  await page.getByPlaceholder("Nome").fill("  Caio  ")
  await page.getByPlaceholder("Recado").fill("  Bom dia  ")
  await page.getByRole("button", { name: "Enviar" }).click()

  await expect(
    page.getByRole("listitem").filter({ hasText: "Caio: Bom dia" }),
  ).toBeVisible()
  await expect(page.getByPlaceholder("Nome")).toHaveValue("")
  await expect(page.getByPlaceholder("Recado")).toHaveValue("")
  const sent = await posts()
  expect(sent).toEqual([
    { table: "messages", values: { author: "Caio", body: "Bom dia" } },
  ])
})

test("ignores a blank message and clears the form", async ({ page }) => {
  await open(page)
  await page.getByPlaceholder("Nome").fill("   ")
  await page.getByPlaceholder("Recado").fill("   ")
  await page.getByRole("button", { name: "Enviar" }).click()

  await expect(page.getByPlaceholder("Nome")).toHaveValue("")
  await expect(page.getByPlaceholder("Recado")).toHaveValue("")
  const sent = await posts()
  expect(sent).toEqual([])
})
