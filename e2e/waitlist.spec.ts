import { expect, type Page, test } from "@playwright/test"

// Retries the submit until hydration attaches the handler.
async function join(page: Page, email: string, expected: string) {
  const input = page.getByRole("textbox", { name: "E-mail" })
  await expect(async () => {
    await input.fill(email)
    await page
      .getByRole("button", { name: "Entrar na lista" })
      .click({ timeout: 1000 })
    await expect(page.getByText(expected)).toBeVisible({ timeout: 1000 })
  }).toPass()
  return input
}

test("shows hero", async ({ page }) => {
  await page.goto("/")
  await expect(page.locator("main")).toMatchAriaSnapshot({
    name: "home.aria.yml",
  })
  const input = page.getByRole("textbox", { name: "E-mail" })
  await expect(input).toHaveAttribute("type", "email")
  await expect(input).toHaveAttribute("required")
})

test("joins the waitlist", async ({ page }) => {
  await page.goto("/")
  const input = await join(
    page,
    "  ana@exemplo.com  ",
    "Pronto! Você está na lista.",
  )
  await expect(page.getByRole("status")).toHaveText(
    "Pronto! Você está na lista.",
  )
  await expect(input).toHaveValue("")
})

test("shows api error", async ({ page }) => {
  await page.goto("/")
  const input = await join(
    page,
    "erro@exemplo.com",
    "Erro ao enviar: 500 INTERNAL_ERROR",
  )
  await expect(page.getByRole("alert")).toHaveText(
    "Erro ao enviar: 500 INTERNAL_ERROR",
  )
  await expect(input).toHaveValue("erro@exemplo.com")
})

test("shows 404 page", async ({ page }) => {
  await page.goto("/nao-existe")
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Página não encontrada",
  )
  await page.getByRole("link", { name: "Início" }).click()
  await expect(page).toHaveURL("/")
})
