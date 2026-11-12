import { expect, test } from "@playwright/test"

test("lists posts", async ({ page }) => {
  await page.goto("/")
  await expect(page.locator("main")).toMatchAriaSnapshot({
    name: "home.aria.yml",
  })
  await page.getByRole("link", { name: "Segundo post" }).click()
  await expect(page).toHaveURL("/posts/segundo-post")
})

test("aligns covers", async ({ page }) => {
  await page.goto("/")
  const covers = page.locator("main [data-cover]")
  await expect(covers).toHaveCount(2)
  const withImage = await covers.nth(0).boundingBox()
  const withoutImage = await covers.nth(1).boundingBox()
  expect(withImage?.height).toBeGreaterThan(0)
  expect(withoutImage?.height).toBe(withImage?.height)
})

test("shows a post", async ({ page }) => {
  await page.goto("/posts/primeiro-post")
  await expect(page.locator("main")).toMatchAriaSnapshot({
    name: "post.aria.yml",
  })
})

test("post not found", async ({ page }) => {
  await page.goto("/posts/nao-existe")
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Post não encontrado",
  )
  await expect(page.getByText("Erro 404 · NOT_FOUND")).toBeVisible()
})

test("shows 404 page", async ({ page }) => {
  await page.goto("/nao-existe")
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Página não encontrada",
  )
  await expect(page.locator("header")).toBeHidden()
  await expect(page.locator("footer")).toBeHidden()
  await page.getByRole("link", { name: "Início" }).click()
  await expect(page).toHaveURL("/")
})

test("shows 500 page", async ({ page }) => {
  await page.goto("/posts/quebra")
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Algo deu errado",
  )
  await expect(page.getByText("Erro 500 · INTERNAL_ERROR")).toBeVisible()
  await expect(page.getByText(/destructure|null/i)).toHaveCount(0)
  await expect(
    page.getByRole("button", { name: "Tentar novamente" }),
  ).toBeVisible()
  await expect(page.getByRole("link", { name: "Início" })).toBeVisible()
  await expect(page.locator("header")).toBeHidden()
  await expect(page.locator("footer")).toBeHidden()
})

test("shows api error", async ({ page }) => {
  await page.goto("/posts/erro")
  await expect(page.getByRole("alert")).toHaveText(
    "Erro ao carregar: 500 INTERNAL_ERROR",
  )
})

test.describe("theme", () => {
  test.use({ colorScheme: "dark" })

  test("toggles theme", async ({ page }) => {
    await page.goto("/")
    const html = page.locator("html")
    await expect(html).toHaveAttribute("data-theme", "dark")
    // Retries the click until hydration attaches the handler.
    await expect(async () => {
      await page
        .getByRole("button", { name: "Ativar tema claro" })
        .click({ timeout: 1000 })
      await expect(html).toHaveAttribute("data-theme", "light", {
        timeout: 1000,
      })
    }).toPass()
    await expect(
      page.getByRole("button", { name: "Ativar tema escuro" }),
    ).toBeVisible()
    await page.reload()
    await expect(html).toHaveAttribute("data-theme", "light")
  })
})
