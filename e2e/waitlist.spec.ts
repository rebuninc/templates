import { expect, type Page, test } from "@playwright/test"

import { MOCK_URL } from "./mock-url"

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
  // The success panel takes the form's place and names the e-mail that joined.
  await expect(
    page.getByText("Avisaremos ana@exemplo.com no lançamento."),
  ).toBeVisible()
  await expect(input).toHaveCount(0)
  await page.getByRole("button", { name: "Usar outro e-mail" }).click()
  await expect(input).toBeFocused()
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

test("shows load error", async ({ page, request }) => {
  const armed = await request.post(`${MOCK_URL}/__mock/fail-next/waitlist`)
  expect(armed.ok()).toBe(true)
  await page.goto("/")
  await expect(page.getByRole("alert")).toHaveText(
    "Erro ao carregar: 500 INTERNAL_ERROR",
  )
})

test("shows countdown", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByText("Lançamento em 15 de dezembro")).toBeVisible()
  for (const unit of ["dias", "horas", "min", "seg"])
    await expect(page.getByText(unit, { exact: true })).toBeVisible()
  // The placeholder digits are replaced once the page hydrates.
  await expect(page.getByText("--", { exact: true })).toHaveCount(0)
})

test("hides countdown after launch", async ({ page, request }) => {
  for (const launchAt of ["2000-01-01T00:00:00.000Z", null]) {
    const armed = await request.post(`${MOCK_URL}/__mock/next/waitlist`, {
      data: { "launch-at": launchAt },
    })
    expect(armed.ok()).toBe(true)
    await page.goto("/")
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
    await expect(page.getByText(/Lançamento em/)).toHaveCount(0)
    await expect(page.getByText("dias", { exact: true })).toHaveCount(0)
  }
})
