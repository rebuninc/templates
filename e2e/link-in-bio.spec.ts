import { expect, type Locator, type Page, test } from "@playwright/test"

type State = {
  posts: { table: string; values: Record<string, unknown> }[]
  patches: { table: string; id: string; values: Record<string, unknown> }[]
  deletes: { table: string; id: string }[]
  uploads: string[]
  removedFiles: string[]
  tables: Record<string, Record<string, unknown>[]>
}

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

const ana = { id: "u1", email: "ana@exemplo.com" }
const bia = { id: "u2", email: "bia@exemplo.com" }

const stamp = {
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
}

const profile = {
  id: "p1",
  owner_id: ana.id,
  username: "ana",
  name: "Ana Souza",
  bio: "Design e código",
  avatar: "ana.png",
  color: "blue",
  ...stamp,
}

const link = (id: string, title: string, position: number) => ({
  id,
  owner_id: ana.id,
  title,
  url: `https://${title.toLowerCase()}.com`,
  position: String(position),
  ...stamp,
})

const click = (id: string, linkId: string) => ({
  id,
  owner_id: null,
  link_id: linkId,
  ...stamp,
})

test.beforeEach(async () => {
  await setMock({
    users: [ana, bia],
    permissions: ["auth:login", "auth:signup"],
    unique: { profiles: ["username", "owner_id"] },
    tables: {
      profiles: [profile],
      // Stored out of order: the page must sort by position.
      links: [link("l2", "Blog", 1), link("l1", "Site", 0)],
      clicks: [click("c1", "l1"), click("c2", "l1"), click("c3", "l1")],
    },
  })
})

async function login(page: Page, who = ana) {
  await open(page, "/login")
  await page.getByRole("button", { name: "Continuar com e-mail" }).click()
  await page.getByPlaceholder("E-mail").fill(who.email)
  await page.getByRole("button", { name: "Enviar código" }).click()
  await page.getByLabel("Código").fill("123456")
  await page.waitForURL(/\/admin(\/setup)?$/)
  await page.waitForLoadState("networkidle")
}

const row = (page: Page, title: string) =>
  page
    .getByRole("list", { name: "Meus links" })
    .getByRole("listitem")
    .filter({ hasText: title })

const publicLinks = (page: Page) =>
  page.getByRole("list", { name: "Links" }).getByRole("link")

test("shows the landing call to action", async ({ page }) => {
  await open(page, "/")
  await page.getByRole("link", { name: "Criar minha página" }).click()
  await expect(page).toHaveURL(/\/login$/)
})

test("sends visitors from /admin to /login", async ({ page }) => {
  await open(page, "/admin")
  await expect(page).toHaveURL(/\/login$/)
})

test("sends a user without a profile to the setup", async ({ page }) => {
  await login(page, bia)
  await expect(page).toHaveURL(/\/admin\/setup$/)
})

test("shows placeholders in the profile form", async ({ page }) => {
  await login(page, bia)
  await expect(page.getByLabel("Nome")).toHaveAttribute(
    "placeholder",
    "Digite seu nome",
  )
  await expect(page.getByLabel("Bio")).toHaveAttribute(
    "placeholder",
    "Digite sua bio",
  )
})

test("creates the profile with a normalized username", async ({ page }) => {
  await login(page, bia)
  await page.getByLabel("Username").fill("  Bia.R  ")
  await page.getByLabel("Nome").fill("  Bia Lima  ")
  await page.getByLabel("Bio").fill("Oi")
  await page.getByLabel("Avatar").setInputFiles({
    name: "eu.png",
    mimeType: "image/png",
    buffer: Buffer.from("png"),
  })
  await expect(
    page.getByRole("button", { name: "Remover eu.png" }),
  ).toBeVisible()
  await page.getByText("Verde").click()
  await page.getByRole("button", { name: "Salvar" }).click()

  await expect(page).toHaveURL(/\/admin$/)
  await expect(page.getByRole("heading", { name: "Bia Lima" })).toBeVisible()
  const { posts, uploads } = await mock()
  expect(uploads).toHaveLength(1)
  expect(uploads[0]).toMatch(/-eu\.png$/)
  expect(posts).toEqual([
    {
      table: "profiles",
      values: {
        username: "bia.r",
        name: "Bia Lima",
        bio: "Oi",
        color: "green",
        avatar: uploads[0],
      },
    },
  ])
})

for (const username of ["ab", "a b", "ação"])
  test(`refuses the username "${username}"`, async ({ page }) => {
    await login(page, bia)
    await page.getByLabel("Username").fill(username)
    await page.getByLabel("Nome").fill("Bia")
    await page.getByRole("button", { name: "Salvar" }).click()
    await expect(page.getByRole("alert")).toHaveText("Username inválido")
    const { posts } = await mock()
    expect(posts).toEqual([])
  })

test("refuses a username in use", async ({ page }) => {
  await login(page, bia)
  await page.getByLabel("Username").fill("ana")
  await page.getByLabel("Nome").fill("Bia")
  await page.getByRole("button", { name: "Salvar" }).click()
  await expect(page.getByRole("alert")).toHaveText("Username já em uso")
  await expect(page.getByLabel("Nome")).toHaveValue("Bia")
})

test("shows the public profile in order", async ({ page }) => {
  await open(page, "/u/ana")
  await expect(page.locator("main")).toMatchAriaSnapshot({
    name: "profile.aria.yml",
  })
  await expect(page.locator("main img")).toHaveAttribute(
    "src",
    /\/__files\/avatars\/ana\.png$/,
  )
})

test("says when a profile does not exist", async ({ page }) => {
  await open(page, "/u/ninguem")
  await expect(
    page.getByRole("heading", { name: "Perfil não encontrado" }),
  ).toBeVisible()
})

test("shows the public profile load error", async ({ page }) => {
  await setMock({ fail: "BOOM" })
  await open(page, "/u/ana")
  await expect(page.getByRole("alert")).toHaveText("Erro ao carregar: BOOM")
})

test("counts a click and redirects", async ({ request }) => {
  const res = await request.get("/go/l2", { maxRedirects: 0 })
  expect(res.status()).toBe(302)
  expect(res.headers().location).toBe("https://blog.com/")
  const { posts } = await mock()
  expect(posts).toEqual([{ table: "clicks", values: { link_id: "l2" } }])
})

test("returns 404 for an unknown link", async ({ request }) => {
  const res = await request.get("/go/nada", { maxRedirects: 0 })
  expect(res.status()).toBe(404)
  expect(await res.text()).toBe("Link não encontrado")
})

test("shows the links with their clicks", async ({ page }) => {
  await login(page)
  await expect(row(page, "Site")).toContainText("3 cliques")
  await expect(row(page, "Blog")).toContainText("0 cliques")
  await expect(
    row(page, "Site").getByRole("button", { name: "Mover para cima" }),
  ).toBeDisabled()
  await expect(
    row(page, "Blog").getByRole("button", { name: "Mover para baixo" }),
  ).toBeDisabled()
})

test("shows a placeholder in the link form", async ({ page }) => {
  await login(page)
  const form = page.getByRole("form", { name: "Novo link" })
  await expect(form.getByLabel("Título")).toHaveAttribute(
    "placeholder",
    "Digite o título",
  )
})

test("adds a link with https and the next position", async ({ page }) => {
  await login(page)
  const form = page.getByRole("form", { name: "Novo link" })
  await form.getByLabel("Título").fill("  Loja  ")
  await form.getByLabel("URL").fill(" exemplo.com ")
  await form.getByRole("button", { name: "Adicionar" }).click()

  await expect(row(page, "Loja")).toContainText("https://exemplo.com")
  await expect(form.getByLabel("Título")).toHaveValue("")
  await expect(form.getByLabel("URL")).toHaveValue("")
  const { posts } = await mock()
  expect(posts).toEqual([
    {
      table: "links",
      values: { title: "Loja", url: "https://exemplo.com", position: "2" },
    },
  ])
})

for (const url of ["javascript:alert(1)", "ftp://x.com"])
  test(`refuses the url ${url}`, async ({ page }) => {
    await login(page)
    const form = page.getByRole("form", { name: "Novo link" })
    await form.getByLabel("Título").fill("Ruim")
    await form.getByLabel("URL").fill(url)
    await form.getByRole("button", { name: "Adicionar" }).click()
    await expect(form.getByRole("alert")).toHaveText("URL inválida")
    const { posts } = await mock()
    expect(posts).toEqual([])
  })

test("moves a link down", async ({ page }) => {
  await login(page)
  await row(page, "Site")
    .getByRole("button", { name: "Mover para baixo" })
    .click()
  await expect(
    page.getByRole("list", { name: "Meus links" }).getByRole("listitem"),
  ).toHaveText([/^Blog/, /^Site/])
  const { patches } = await mock()
  expect(patches).toEqual([
    { table: "links", id: "l1", values: { position: "1" } },
    { table: "links", id: "l2", values: { position: "0" } },
  ])
  await open(page, "/u/ana")
  await expect(publicLinks(page)).toHaveText(["Blog", "Site"])
})

test("changes the username", async ({ page }) => {
  await login(page)
  await page.getByRole("link", { name: "Editar perfil" }).click()
  await expect(
    page.getByRole("heading", { name: "Editar perfil" }),
  ).toBeVisible()
  await page.getByLabel("Username").fill("ana.nova")
  await page.getByRole("button", { name: "Salvar" }).click()
  await expect(page).toHaveURL(/\/admin$/)

  await open(page, "/u/ana.nova")
  await expect(page.getByRole("heading", { name: "Ana Souza" })).toBeVisible()
  await open(page, "/u/ana")
  await expect(
    page.getByRole("heading", { name: "Perfil não encontrado" }),
  ).toBeVisible()
})

test("replaces the avatar and deletes the old one", async ({ page }) => {
  await login(page)
  await page.getByRole("link", { name: "Editar perfil" }).click()
  await expect(
    page.getByRole("heading", { name: "Editar perfil" }),
  ).toBeVisible()
  await page.getByLabel("Avatar").setInputFiles({
    name: "nova.png",
    mimeType: "image/png",
    buffer: Buffer.from("png"),
  })
  await page.getByRole("button", { name: "Salvar" }).click()
  await expect(page).toHaveURL(/\/admin$/)
  const { patches, removedFiles, uploads } = await mock()
  expect(patches[0].values.avatar).toBe(uploads[0])
  expect(removedFiles).toEqual(["ana.png"])
})

test("refuses an avatar that is not an image", async ({ page }) => {
  await login(page, bia)
  await page.getByLabel("Avatar").setInputFiles({
    name: "nota.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("oi"),
  })
  await expect(page.getByRole("alert")).toHaveText(
    "nota.txt não é um tipo aceito",
  )
  await expect(
    page.getByRole("button", { name: "Remover nota.txt" }),
  ).toHaveCount(0)
})

test("removes the current avatar and deletes it from storage", async ({
  page,
}) => {
  await login(page)
  await page.getByRole("link", { name: "Editar perfil" }).click()
  await page.getByRole("button", { name: "Remover ana.png" }).click()
  await page.getByRole("button", { name: "Salvar" }).click()
  await expect(page).toHaveURL(/\/admin$/)
  const { patches, removedFiles, uploads } = await mock()
  expect(uploads).toEqual([])
  expect(patches[0].values.avatar).toBeNull()
  expect(removedFiles).toEqual(["ana.png"])
})

test("edits a link", async ({ page }) => {
  await login(page)
  await row(page, "Blog").getByRole("link", { name: "Editar" }).click()
  // /admin has the same Título/URL labels, so wait until the edit page renders.
  await expect(page.getByRole("heading", { name: "Editar link" })).toBeVisible()
  await page.getByLabel("Título").fill("Diário")
  await page.getByLabel("URL").fill("diario.com")
  await page.getByRole("button", { name: "Salvar" }).click()

  await expect(page).toHaveURL(/\/admin$/)
  await expect(row(page, "Diário")).toBeVisible()
  const { patches } = await mock()
  expect(patches).toEqual([
    {
      table: "links",
      id: "l2",
      values: { title: "Diário", url: "https://diario.com" },
    },
  ])
})

test("deletes a link", async ({ page }) => {
  await login(page)
  page.once("dialog", (dialog) => dialog.accept())
  await row(page, "Blog").getByRole("button", { name: "Excluir" }).click()
  await expect(row(page, "Blog")).toHaveCount(0)
  const { deletes } = await mock()
  expect(deletes).toEqual([{ table: "links", id: "l2" }])
})

test("signs out", async ({ page }) => {
  await login(page)
  await page.getByRole("button", { name: "Conta" }).click()
  await page.getByRole("button", { name: "Sair" }).click()
  await expect(page).toHaveURL(/\/login$/)
  await open(page, "/admin")
  await expect(page).toHaveURL(/\/login$/)
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

for (const reduce of [false, true]) {
  test(`slides the login mode pill${reduce ? " with reduced motion" : ""}`, async ({
    page,
  }) => {
    await page.emulateMedia({
      reducedMotion: reduce ? "reduce" : "no-preference",
    })
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
  await login(page)
  const form = page.getByRole("form", { name: "Novo link" })
  await form.getByLabel("Título").fill("Loja")
  await form.getByLabel("URL").fill("exemplo.com")
  const button = form.getByRole("button", { name: "Adicionar" })
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
  // Each mock call waits 800ms and adding a link makes several.
  await expect(row(page, "Loja")).toBeVisible({ timeout: 15_000 })
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
  const form = page.getByRole("form", { name: "Novo link" })
  await expectCheckboxBase(form.getByLabel("Título"), "6px")
})
