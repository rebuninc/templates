import { expect, type Page, test } from "@playwright/test"

type State = {
  posts: { table: string; values: Record<string, unknown> }[]
  patches: { table: string; id: string; values: Record<string, unknown> }[]
  deletes: { table: string; id: string }[]
  uploads: string[]
  removedFiles: string[]
}

// Software WebGL so headless Chromium can create the login shader's context.
test.use({
  launchOptions: {
    args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
  },
})

const mockUrl = () => test.info().project.metadata.mockUrl as string

async function setMock(state: Record<string, unknown>) {
  await fetch(`${mockUrl()}/__state`, {
    method: "POST",
    body: JSON.stringify(state),
  })
}

async function mock() {
  const res = await fetch(`${mockUrl()}/__state`)
  const state = (await res.json()) as State
  return state
}

// Wait for hydration so forms submit through JS, not natively.
const open = (page: Page, path: string) =>
  page.goto(path, { waitUntil: "networkidle" })

const user = { id: "u1", email: "ana@exemplo.com" }

const toast = (page: Page) => page.locator("[data-sonner-toast]")

const post = (
  id: string,
  title: string,
  day: string,
  extra: Record<string, unknown> = {},
) => ({
  id,
  owner_id: user.id,
  title,
  slug: `post-${id}`,
  content: `Primeira linha de ${title}\nSegunda linha`,
  published: "true",
  image: null,
  tags: null,
  created_at: `2026-01-${day}T00:00:00.000Z`,
  updated_at: `2026-01-${day}T00:00:00.000Z`,
  ...extra,
})

test.beforeEach(async () => {
  await setMock({
    users: [user],
    tables: {
      posts: [
        post("1", "Primeiro", "01", { tags: ["a"] }),
        post("2", "Segundo", "02", { tags: ["b", "c"], image: "x.png" }),
        post("3", "Rascunho", "03", { published: "false" }),
      ],
    },
  })
})

async function login(page: Page) {
  await open(page, "/login")
  await page.getByRole("button", { name: "Continuar com e-mail" }).click()
  await page.getByPlaceholder("E-mail").fill(user.email)
  await page.getByRole("button", { name: "Enviar código" }).click()
  await page.getByPlaceholder("Código").fill("123456")
  await page.getByRole("button", { name: "Entrar", exact: true }).click()
  await expect(page).toHaveURL(/\/admin$/)
  await page.waitForLoadState("networkidle")
}

const card = (page: Page, title: string) =>
  page.getByRole("listitem").filter({ hasText: title })

test("lists only published posts, newest first", async ({ page }) => {
  await open(page, "/")
  await expect(page.locator("main")).toMatchAriaSnapshot({
    name: "list.aria.yml",
  })
})

test("shows the load error", async ({ page }) => {
  await setMock({ fail: "BOOM" })
  await open(page, "/")
  await expect(page.locator("main").getByRole("alert")).toHaveText(
    "Erro ao carregar: BOOM",
  )
})

test("shows a published post", async ({ page }) => {
  await open(page, "/")
  await page.getByRole("link", { name: "Segundo" }).click()
  await expect(page).toHaveURL(/\/posts\/post-2$/)
  await expect(page.locator("main")).toMatchAriaSnapshot({
    name: "detail.aria.yml",
  })
})

test("shows the progress bar while a route loads", async ({ page }) => {
  await open(page, "/")
  const state = await mock()
  await setMock({ ...state, delay: 800 })
  await page.getByRole("link", { name: "Segundo" }).click()
  const bar = page.locator("[data-navigation-progress]")
  await expect(bar).toBeAttached()
  await expect(page).toHaveURL(/\/posts\/post-2$/)
  await expect(bar).not.toBeAttached()
})

test("hides a draft from visitors", async ({ page }) => {
  await open(page, "/posts/post-3")
  await expect(
    page.getByRole("heading", { name: "Post não encontrado" }),
  ).toBeVisible()
})

test("logs in with the OTP code", async ({ page }) => {
  await login(page)
  await expect(page.getByRole("heading", { name: "Meus posts" })).toBeVisible()
  await expect(card(page, "Rascunho")).toContainText("Rascunho")
})

test("shows a wrong OTP code", async ({ page }) => {
  await open(page, "/login")
  await page.getByRole("button", { name: "Continuar com e-mail" }).click()
  await page.getByPlaceholder("E-mail").fill(user.email)
  await page.getByRole("button", { name: "Enviar código" }).click()
  await page.getByPlaceholder("Código").fill("000000")
  await page.getByRole("button", { name: "Entrar", exact: true }).click()
  await expect(toast(page)).toHaveText("Erro ao entrar: INVALID_CODE")
  await expect(toast(page)).toHaveAttribute("data-y-position", "top")
  await expect(toast(page)).toHaveAttribute("data-x-position", "center")
  await expect(page.getByPlaceholder("Código")).toBeVisible()
})

test("refuses an email without an account", async ({ page }) => {
  await open(page, "/login")
  await page.getByRole("button", { name: "Continuar com e-mail" }).click()
  await page.getByPlaceholder("E-mail").fill("nova@exemplo.com")
  await page.getByRole("button", { name: "Enviar código" }).click()
  await page.getByPlaceholder("Código").fill("123456")
  await page.getByRole("button", { name: "Entrar", exact: true }).click()
  await expect(toast(page)).toHaveText("Erro ao entrar: SIGNUP_NOT_ALLOWED")
})

test("logs in with Google through the callback", async ({ page }) => {
  await open(page, "/login")
  await page.getByRole("button", { name: "Entrar com Google" }).click()
  await expect(page).toHaveURL(/\/admin$/)
  await expect(page.getByRole("heading", { name: "Meus posts" })).toBeVisible()
})

test("logs in with GitHub through the callback", async ({ page }) => {
  await open(page, "/login")
  await page.getByRole("button", { name: "Entrar com GitHub" }).click()
  await expect(page).toHaveURL(/\/admin$/)
  await expect(page.getByRole("heading", { name: "Meus posts" })).toBeVisible()
})

test("logs in with email and password", async ({ page }) => {
  await open(page, "/login")
  await page.getByRole("button", { name: "Continuar com senha" }).click()
  await page.getByPlaceholder("E-mail").fill(user.email)
  await page.getByPlaceholder("Senha").fill("senha123")
  await page.getByRole("button", { name: "Entrar", exact: true }).click()
  await expect(page).toHaveURL(/\/admin$/)
  await expect(page.getByRole("heading", { name: "Meus posts" })).toBeVisible()
})

test("shows a wrong password", async ({ page }) => {
  await open(page, "/login")
  await page.getByRole("button", { name: "Continuar com senha" }).click()
  await page.getByPlaceholder("E-mail").fill(user.email)
  await page.getByPlaceholder("Senha").fill("errada")
  await page.getByRole("button", { name: "Entrar", exact: true }).click()
  await expect(toast(page)).toHaveText("Erro ao entrar: INVALID_CREDENTIALS")
  await expect(page.getByPlaceholder("Senha")).toBeVisible()
})

test("shows only the active login providers", async ({ page }) => {
  await setMock({ users: [user], providers: ["otp", "google"] })
  await open(page, "/login")
  await expect(
    page.getByRole("button", { name: "Entrar com Google" }),
  ).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Continuar com e-mail" }),
  ).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Entrar com GitHub" }),
  ).toHaveCount(0)
  await expect(
    page.getByRole("button", { name: "Continuar com senha" }),
  ).toHaveCount(0)
})

test("says when no login provider is active", async ({ page }) => {
  await setMock({ users: [user], providers: [] })
  await open(page, "/login")
  await expect(page.getByText("Nenhum método de login ativo.")).toBeVisible()
  await expect(page.locator("main button")).toHaveCount(0)
})

test("shows a failure to load the providers", async ({ page }) => {
  await setMock({ users: [user], projectFail: "INTERNAL" })
  await open(page, "/login")
  await expect(toast(page)).toHaveText("Erro ao carregar: INTERNAL")
  await expect(page.locator("main button")).toHaveCount(0)
})

test("sends visitors from /admin to /login", async ({ page }) => {
  await open(page, "/admin")
  await expect(page).toHaveURL(/\/login$/)
})

test("creates a post with a trimmed title, tags and image", async ({
  page,
}) => {
  await login(page)
  await page.getByRole("link", { name: "Novo post" }).click()
  await page.waitForLoadState("networkidle")
  await page.getByLabel("Título").fill("  Olá Mundo  ")
  await page.getByLabel("Conteúdo").fill("  Texto  ")
  await page.getByLabel("Tags").fill(" a, ,b ")
  await page.getByLabel("Imagem").setInputFiles({
    name: "capa.png",
    mimeType: "image/png",
    buffer: Buffer.from("png"),
  })
  await page.getByLabel("Publicado").check()
  await page.getByRole("button", { name: "Salvar" }).click()

  await expect(page).toHaveURL(/\/admin$/)
  await expect(card(page, "Olá Mundo")).toBeVisible()
  const { posts, uploads } = await mock()
  expect(uploads).toHaveLength(1)
  expect(uploads[0]).toMatch(/-capa\.png$/)
  expect(posts).toEqual([
    {
      table: "posts",
      values: {
        title: "Olá Mundo",
        content: "Texto",
        tags: ["a", "b"],
        published: "true",
        image: uploads[0],
        slug: expect.stringMatching(/^ola-mundo-[0-9a-f]{6}$/),
      },
    },
  ])
})

test("refuses a blank title", async ({ page }) => {
  await login(page)
  await page.getByRole("link", { name: "Novo post" }).click()
  await page.waitForLoadState("networkidle")
  await page.getByLabel("Título").fill("   ")
  await page.getByLabel("Conteúdo").fill("   ")
  await page.getByRole("button", { name: "Salvar" }).click()
  await expect(page.getByRole("alert")).toHaveText("Preencha título e conteúdo")
  const { posts } = await mock()
  expect(posts).toEqual([])
})

test("edits a post without changing its slug", async ({ page }) => {
  await login(page)
  await card(page, "Primeiro").getByRole("link", { name: "Editar" }).click()
  await page.waitForLoadState("networkidle")
  await page.getByLabel("Título").fill("Primeiro editado")
  await page.getByRole("button", { name: "Salvar" }).click()

  await expect(page).toHaveURL(/\/admin$/)
  await expect(card(page, "Primeiro editado")).toBeVisible()
  const { patches } = await mock()
  expect(patches).toHaveLength(1)
  expect(patches[0].id).toBe("1")
  expect(patches[0].values.title).toBe("Primeiro editado")
  expect(patches[0].values).not.toHaveProperty("slug")
})

test("deletes a post and its image", async ({ page }) => {
  await login(page)
  page.once("dialog", (dialog) => dialog.accept())
  await card(page, "Segundo").getByRole("button", { name: "Excluir" }).click()

  await expect(card(page, "Segundo")).toHaveCount(0)
  const { deletes, removedFiles } = await mock()
  expect(deletes).toEqual([{ table: "posts", id: "2" }])
  expect(removedFiles).toEqual(["x.png"])
})

test("signs out", async ({ page }) => {
  await login(page)
  await page.getByRole("button", { name: "Conta" }).click()
  await page.getByRole("button", { name: "Sair" }).click()
  await expect(page).toHaveURL(/\/login$/)
  await open(page, "/admin")
  await expect(page).toHaveURL(/\/login$/)
})

test("shows the viewer in the navbar", async ({ page }) => {
  const nav = page.getByRole("banner").getByRole("link")
  await open(page, "/")
  await expect(nav).toHaveText(["Blog", "Entrar"])
  await login(page)
  await expect(nav).toHaveText(["Blog", "Meus posts", "Novo post"])
  await expect(page.getByRole("button", { name: "Conta" })).toHaveText("a")
  await page.getByRole("button", { name: "Conta" }).click()
  await expect(page.getByText(user.email)).toBeVisible()
  await expect(page.getByRole("button", { name: "Sair" })).toBeVisible()
})

test("keeps covers aligned with and without an image", async ({ page }) => {
  await open(page, "/")
  const covers = page.locator("main li > :first-child")
  const first = await covers.nth(0).boundingBox()
  const second = await covers.nth(1).boundingBox()
  expect(Math.abs((first?.height ?? 0) - (second?.height ?? -9))).toBeLessThan(
    2,
  )
})

test("shows the login options and goes back from the email step", async ({
  page,
}) => {
  await open(page, "/login")
  await expect(page.getByRole("banner")).toBeHidden()
  await expect(
    page.getByRole("heading", { name: "Entrar no Blog" }),
  ).toBeVisible()
  await expect(page.getByPlaceholder("E-mail")).toHaveCount(0)

  await page.getByRole("button", { name: "Continuar com e-mail" }).click()
  await expect(page.getByPlaceholder("E-mail")).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Enviar código" }),
  ).toBeVisible()

  await page.getByRole("button", { name: "Voltar" }).click()
  await expect(page.getByPlaceholder("E-mail")).toHaveCount(0)
  await expect(
    page.getByRole("button", { name: "Continuar com e-mail" }),
  ).toBeVisible()
})

test.describe("login shader", () => {
  test("draws on wide screens and hides on phones", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await open(page, "/login")
    await expect(
      page.getByText("Escreva. Publique. Compartilhe."),
    ).toBeVisible()
    const lost = await page
      .locator("canvas")
      .evaluate(
        (c: HTMLCanvasElement) =>
          c.getContext("webgl")?.isContextLost() ?? true,
      )
    expect(lost).toBe(false)

    await page.setViewportSize({ width: 390, height: 844 })
    await expect(page.locator("canvas")).toBeHidden()
  })
})

// Records every non-none transform on the matching elements, frame by frame.
async function watchTransforms(page: Page, selector: string) {
  type Seen = { __transforms: string[] }
  await page.evaluate((sel) => {
    const seen: string[] = []
    ;(window as unknown as Seen).__transforms = seen
    const tick = () => {
      for (const el of document.querySelectorAll(sel)) {
        const transform = getComputedStyle(el).transform
        if (transform !== "none") seen.push(transform)
      }
      requestAnimationFrame(tick)
    }
    tick()
  }, selector)
  return () => page.evaluate(() => (window as unknown as Seen).__transforms)
}

test("renders the server HTML visible", async ({ request }) => {
  for (const path of ["/", "/posts/post-2", "/login"]) {
    const res = await request.get(path)
    const html = await res.text()
    expect(html).not.toContain("opacity:0")
  }
})

for (const reduce of [false, true]) {
  test.describe(reduce ? "with reduced motion" : "with motion", () => {
    test.use({ reducedMotion: reduce ? "reduce" : "no-preference" })

    test("animates the page entrance", async ({ page }) => {
      await open(page, "/")
      const transforms = await watchTransforms(page, "[data-page], main h1")
      await page.getByRole("link", { name: "Segundo" }).click()
      await expect(page.getByRole("heading", { name: "Segundo" })).toBeVisible()
      await page.waitForTimeout(600)
      const seen = await transforms()
      if (reduce) expect(seen).toEqual([])
      else expect(seen.length).toBeGreaterThan(0)
    })

    test("animates the user menu", async ({ page }) => {
      await login(page)
      const transforms = await watchTransforms(page, "#user-menu")
      await page.getByRole("button", { name: "Conta" }).click()
      await expect(page.getByRole("button", { name: "Sair" })).toBeVisible()
      await page.waitForTimeout(300)
      const seen = await transforms()
      if (reduce) expect(seen).toEqual([])
      else expect(seen.length).toBeGreaterThan(0)
    })
  })
}

test("serves the favicon", async ({ page, request }) => {
  await open(page, "/")
  const icons = page.locator('head link[rel="icon"]')
  await expect(icons).toHaveCount(2)
  for (const path of ["/icon.svg", "/favicon.ico"]) {
    const res = await request.get(path)
    expect(res.status()).toBe(200)
  }
})
