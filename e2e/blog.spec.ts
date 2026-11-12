import { expect, test } from "@playwright/test"

test("lists posts", async ({ page }) => {
  await page.goto("/")
  await expect(page.locator("main")).toMatchAriaSnapshot({
    name: "home.aria.yml",
  })
  await page.getByRole("link", { name: "Segundo post" }).click()
  await expect(page).toHaveURL("/posts/segundo-post")
})

test("shows a post", async ({ page }) => {
  await page.goto("/posts/primeiro-post")
  await expect(page.locator("main")).toMatchAriaSnapshot({
    name: "post.aria.yml",
  })
})

test("post not found", async ({ page }) => {
  await page.goto("/posts/nao-existe")
  await expect(page.getByText("Post não encontrado")).toBeVisible()
})

test("shows api error", async ({ page }) => {
  await page.goto("/posts/erro")
  await expect(page.getByRole("alert")).toHaveText(
    "Erro ao carregar: 500 INTERNAL_ERROR",
  )
})
