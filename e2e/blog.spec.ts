import { expect, type Locator, type Page, test } from "@playwright/test"

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
  await page.getByLabel("Código").fill("123456")
  await expect(page).toHaveURL(/\/admin$/)
  await page.waitForLoadState("networkidle")
}

// Playwright has no file drop, so dispatch one with a real DataTransfer.
async function dropFile(page: Page, name: string, type: string) {
  const transfer = await page.evaluateHandle(
    ([name, type]) => {
      const data = new DataTransfer()
      data.items.add(new File(["png"], name, { type }))
      return data
    },
    [name, type],
  )
  await page
    .getByText("Arraste ou clique para escolher")
    .dispatchEvent("drop", { dataTransfer: transfer })
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

test.describe("empty state", () => {
  const empty = (page: Page) =>
    page.locator("main").getByRole("heading", { name: "Nenhum post ainda" })

  test("shows it to visitors without an action", async ({ page }) => {
    await setMock({ users: [user], tables: { posts: [] } })
    await open(page, "/")
    await expect(empty(page)).toBeVisible()
    await expect(
      page.locator("main").getByText("Os posts publicados aparecem aqui."),
    ).toBeVisible()
    await expect(
      page.locator("main").getByRole("link", { name: "Novo post" }),
    ).toHaveCount(0)
  })

  test("links a logged in user to a new post", async ({ page }) => {
    await setMock({
      users: [user],
      tables: { posts: [post("3", "Rascunho", "03", { published: "false" })] },
    })
    await login(page)
    await open(page, "/")
    await expect(empty(page)).toBeVisible()
    await page.locator("main").getByRole("link", { name: "Novo post" }).click()
    await expect(page).toHaveURL(/\/admin\/new$/)
  })

  test("shows it in /admin without posts", async ({ page }) => {
    await setMock({ users: [user], tables: { posts: [] } })
    await login(page)
    await expect(empty(page)).toBeVisible()
    await expect(
      page.locator("main").getByRole("link", { name: "Novo post" }),
    ).toBeVisible()
  })

  test("hides it when there are posts", async ({ page }) => {
    await open(page, "/")
    await expect(page.getByRole("link", { name: "Segundo" })).toBeVisible()
    await expect(empty(page)).toHaveCount(0)
  })

  test("hides it on a load error", async ({ page }) => {
    await setMock({ fail: "BOOM" })
    await open(page, "/")
    await expect(page.locator("main").getByRole("alert")).toHaveText(
      "Erro ao carregar: BOOM",
    )
    await expect(empty(page)).toHaveCount(0)
  })
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
  await page.getByLabel("Código").fill("000000")
  await expect(toast(page)).toHaveText("Erro ao entrar: INVALID_CODE")
  await expect(toast(page)).toHaveAttribute("data-y-position", "top")
  await expect(toast(page)).toHaveAttribute("data-x-position", "center")
  await expect(page.getByLabel("Código")).toBeVisible()
  await expect(page.getByText("0 de 6 dígitos")).toBeAttached()
})

test("focuses the code and keeps only digits", async ({ page }) => {
  await open(page, "/login")
  await page.getByRole("button", { name: "Continuar com e-mail" }).click()
  await page.getByPlaceholder("E-mail").fill(user.email)
  await page.getByRole("button", { name: "Enviar código" }).click()
  await expect(page.getByLabel("Código")).toBeFocused()
  await page.getByLabel("Código").fill("1a2-3")
  await expect(page.getByText("3 de 6 dígitos")).toBeAttached()
  await expect(page).toHaveURL(/\/login$/)
})

test("refuses an email without an account", async ({ page }) => {
  await open(page, "/login")
  await page.getByRole("button", { name: "Continuar com e-mail" }).click()
  await page.getByPlaceholder("E-mail").fill("nova@exemplo.com")
  await page.getByRole("button", { name: "Enviar código" }).click()
  await page.getByLabel("Código").fill("123456")
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

const signUpKey = { users: [user], permissions: ["auth:login", "auth:signup"] }

test("hides the sign-up toggle without auth:signup", async ({ page }) => {
  await open(page, "/login")
  await expect(page.getByRole("radio", { name: "Criar conta" })).toHaveCount(0)
})

test("switches the login texts to sign-up", async ({ page }) => {
  await setMock(signUpKey)
  await open(page, "/login")
  await expect(page.getByRole("radio", { name: "Entrar" })).toBeChecked()
  await page.getByRole("radio", { name: "Criar conta" }).check()
  await expect(
    page.getByRole("heading", { name: "Criar conta no Blog" }),
  ).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Cadastrar com Google" }),
  ).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Cadastrar com GitHub" }),
  ).toBeVisible()
})

test("keeps the sign-up mode after going back", async ({ page }) => {
  await setMock(signUpKey)
  await open(page, "/login")
  await page.getByRole("radio", { name: "Criar conta" }).check()
  await page.getByRole("button", { name: "Continuar com senha" }).click()
  await page.getByRole("button", { name: "Voltar" }).click()
  await expect(page.getByRole("radio", { name: "Criar conta" })).toBeChecked()
})

test("signs up with email, password and code", async ({ page }) => {
  await setMock(signUpKey)
  await open(page, "/login")
  await page.getByRole("radio", { name: "Criar conta" }).check()
  await page.getByRole("button", { name: "Continuar com senha" }).click()
  await page.getByPlaceholder("E-mail").fill(" nova@exemplo.com ")
  await page.getByPlaceholder("Senha").fill("senha123")
  await page.getByRole("button", { name: "Criar conta", exact: true }).click()
  await expect(
    page.getByText("Enviamos um código para nova@exemplo.com."),
  ).toBeVisible()
  await page.getByLabel("Código").fill("123456")
  await expect(page).toHaveURL(/\/admin$/)
  await expect(page.getByRole("heading", { name: "Meus posts" })).toBeVisible()
})

test("refuses to sign up an existing email", async ({ page }) => {
  await setMock(signUpKey)
  await open(page, "/login")
  await page.getByRole("radio", { name: "Criar conta" }).check()
  await page.getByRole("button", { name: "Continuar com senha" }).click()
  await page.getByPlaceholder("E-mail").fill(user.email)
  await page.getByPlaceholder("Senha").fill("senha123")
  await page.getByRole("button", { name: "Criar conta", exact: true }).click()
  await expect(toast(page)).toHaveText("Erro ao entrar: USER_ALREADY_EXISTS")
  await expect(page.getByPlaceholder("Senha")).toBeVisible()
})

test("sends visitors from /admin to /login", async ({ page }) => {
  await open(page, "/admin")
  await expect(page).toHaveURL(/\/login$/)
})

test("shows placeholders in the post form", async ({ page }) => {
  await login(page)
  await page.getByRole("link", { name: "Novo post" }).click()
  await expect(page.getByLabel("Título")).toHaveAttribute(
    "placeholder",
    "Digite o título",
  )
  await expect(page.getByLabel("Conteúdo")).toHaveAttribute(
    "placeholder",
    "Digite o conteúdo",
  )
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
  await dropFile(page, "capa.png", "image/png")
  await expect(
    page.getByRole("listitem").filter({ hasText: "capa.png" }),
  ).toContainText("3 B")
  await page.getByRole("checkbox", { name: "Publicado" }).check()
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
  await expect(page.getByRole("checkbox", { name: "Publicado" })).toBeChecked()
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

test("refuses an image larger than 5 MB", async ({ page }) => {
  await login(page)
  await page.getByRole("link", { name: "Novo post" }).click()
  await page.waitForLoadState("networkidle")
  await page.getByLabel("Imagem").setInputFiles({
    name: "grande.png",
    mimeType: "image/png",
    buffer: Buffer.alloc(5 * 1024 * 1024 + 1),
  })
  await expect(page.getByRole("alert")).toHaveText(
    "grande.png é maior que 5 MB",
  )
  await expect(
    page.getByRole("button", { name: "Remover grande.png" }),
  ).toHaveCount(0)
})

test("removes a chosen image before saving", async ({ page }) => {
  await login(page)
  await page.getByRole("link", { name: "Novo post" }).click()
  await page.waitForLoadState("networkidle")
  await page.getByLabel("Título").fill("Sem capa")
  await page.getByLabel("Conteúdo").fill("Texto")
  await dropFile(page, "capa.png", "image/png")
  await page.getByRole("button", { name: "Remover capa.png" }).click()
  await expect(
    page.getByRole("button", { name: "Remover capa.png" }),
  ).toHaveCount(0)
  await page.getByRole("button", { name: "Salvar" }).click()
  await expect(page).toHaveURL(/\/admin$/)
  const { posts, uploads } = await mock()
  expect(uploads).toEqual([])
  expect(posts[0].values.image).toBeNull()
})

test("keeps the current image when editing without touching it", async ({
  page,
}) => {
  await login(page)
  await card(page, "Segundo").getByRole("link", { name: "Editar" }).click()
  await page.waitForLoadState("networkidle")
  await expect(
    page.getByRole("button", { name: "Remover x.png" }),
  ).toBeVisible()
  await page.getByRole("button", { name: "Salvar" }).click()
  await expect(page).toHaveURL(/\/admin$/)
  const { patches, removedFiles } = await mock()
  expect(patches[0].values.image).toBe("x.png")
  expect(removedFiles).toEqual([])
})

test("removes the current image and deletes it from storage", async ({
  page,
}) => {
  await login(page)
  await card(page, "Segundo").getByRole("link", { name: "Editar" }).click()
  await page.waitForLoadState("networkidle")
  await page.getByRole("button", { name: "Remover x.png" }).click()
  await page.getByRole("button", { name: "Salvar" }).click()
  await expect(page).toHaveURL(/\/admin$/)
  const { patches, removedFiles } = await mock()
  expect(patches[0].values.image).toBeNull()
  expect(removedFiles).toEqual(["x.png"])
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

    test("animates the theme toggle", async ({ page }) => {
      type Counted = { __transitions: number }
      await page.addInitScript(() => {
        const counted = window as unknown as Counted
        counted.__transitions = 0
        const start = document.startViewTransition.bind(document)
        document.startViewTransition = (update) => {
          counted.__transitions++
          return start(update)
        }
      })
      await open(page, "/")
      await page.getByRole("button", { name: /^Ativar tema/ }).click()
      const count = await page.evaluate(
        () => (window as unknown as Counted).__transitions,
      )
      expect(count).toBe(reduce ? 0 : 1)
    })
  })
}

test.describe("theme", () => {
  const html = (page: Page) => page.locator("html")

  for (const scheme of ["light", "dark"] as const) {
    test(`follows the ${scheme} system theme`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme })
      await page.goto("/", { waitUntil: "domcontentloaded" })
      await expect(html(page)).toHaveAttribute("data-theme", scheme)
    })
  }

  test("toggles and keeps the chosen theme", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" })
    await open(page, "/")
    await page.getByRole("button", { name: "Ativar tema claro" }).click()
    await expect(html(page)).toHaveAttribute("data-theme", "light")
    await expect(
      page.getByRole("button", { name: "Ativar tema escuro" }),
    ).toBeVisible()
    await page.reload()
    await expect(html(page)).toHaveAttribute("data-theme", "light")
  })

  test("toggles the theme on the login page", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" })
    await open(page, "/login")
    await page.getByRole("button", { name: "Ativar tema escuro" }).click()
    await expect(html(page)).toHaveAttribute("data-theme", "dark")
  })
})

test("serves the favicon", async ({ page, request }) => {
  await open(page, "/")
  const icons = page.locator('head link[rel="icon"]')
  await expect(icons).toHaveCount(2)
  for (const path of ["/icon.svg", "/favicon.ico"]) {
    const res = await request.get(path)
    expect(res.status()).toBe(200)
  }
})

for (const reduce of [false, true]) {
  test(`slides the login mode pill${reduce ? " with reduced motion" : ""}`, async ({
    page,
  }) => {
    await page.emulateMedia({
      reducedMotion: reduce ? "reduce" : "no-preference",
    })
    await setMock(signUpKey)
    await open(page, "/login")
    const transforms = await watchTransforms(page, "[data-mode-pill]")
    await page.getByRole("radio", { name: "Criar conta" }).check()
    await page.waitForTimeout(500)
    const seen = await transforms()
    if (reduce) expect(seen).toEqual([])
    else expect(seen.length).toBeGreaterThan(0)
  })
}

test("shows a spinner on the submit button while it runs", async ({ page }) => {
  await open(page, "/login")
  await page.getByRole("button", { name: "Continuar com senha" }).click()
  await page.getByPlaceholder("E-mail").fill(user.email)
  await page.getByPlaceholder("Senha").fill("errada")
  const button = page.getByRole("button", { name: "Entrar", exact: true })
  const before = await button.boundingBox()
  const state = await mock()
  await setMock({ ...state, delay: 800 })
  await button.click()
  await expect(button).toHaveAttribute("aria-busy", "true")
  await expect(button).toBeDisabled()
  await expect(button.locator("[data-spinner]")).toBeVisible()
  const during = await button.boundingBox()
  // Only the size: the page may still be animating in.
  expect([during?.width, during?.height]).toEqual([
    before?.width,
    before?.height,
  ])
  await expect(toast(page)).toHaveText("Erro ao entrar: INVALID_CREDENTIALS")
  await expect(button).not.toHaveAttribute("aria-busy")
  await expect(button).toBeEnabled()
  await expect(button.locator("[data-spinner]")).toHaveCount(0)
})

// Focus ring is box-shadow; 2px border matches the Checkbox.
async function expectCheckboxBase(field: Locator, radius?: string) {
  await field.focus()
  await expect(field).toHaveCSS("border-top-width", "2px")
  if (radius) await expect(field).toHaveCSS("border-top-left-radius", radius)
  await expect(field).not.toHaveCSS("box-shadow", "none")
}

test("gives the inputs the checkbox base", async ({ page }) => {
  await open(page, "/login")
  await page.getByRole("button", { name: "Continuar com e-mail" }).click()
  await expectCheckboxBase(page.getByPlaceholder("E-mail"))
  for (const el of [
    page.getByPlaceholder("E-mail"),
    page.getByRole("button", { name: "Enviar código" }),
  ])
    await expect(el).toHaveCSS("height", "48px")
  await login(page)
  await page.getByRole("link", { name: "Novo post" }).click()
  await page.waitForLoadState("networkidle")
  await expectCheckboxBase(page.getByLabel("Título"), "6px")
  await expect(page.getByRole("checkbox", { name: "Publicado" })).toHaveCSS(
    "border-top-left-radius",
    "6px",
  )
})
