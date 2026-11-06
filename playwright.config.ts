import { readdirSync, readFileSync } from "node:fs"
import { defineConfig, type PlaywrightTestConfig } from "@playwright/test"

const templates = readdirSync("apps", { withFileTypes: true }).filter((d) =>
  d.isDirectory(),
)
const targets = templates
  .flatMap(({ name: template }) => {
    const manifest = JSON.parse(
      readFileSync(`apps/${template}/rebun.json`, "utf8"),
    )
    return (manifest.frameworks as string[]).map((framework) => ({
      template,
      framework,
    }))
  })
  .map((t, i) => ({ ...t, mockPort: 4100 + i * 2, appPort: 4101 + i * 2 }))

const webServer: PlaywrightTestConfig["webServer"] = targets.flatMap((t) => [
  {
    command: `bun e2e/mock-rebun.ts ${t.mockPort}`,
    url: `http://localhost:${t.mockPort}/__state`,
    reuseExistingServer: false,
  },
  {
    command: `bun run --cwd apps/${t.template}/${t.framework} dev --port ${t.appPort}`,
    url: `http://localhost:${t.appPort}`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: { REBUN_URL: `http://localhost:${t.mockPort}`, REBUN_API_KEY: "e2e" },
  },
])

export default defineConfig({
  testDir: "e2e",
  // Shared across projects so every framework must match the same snapshot.
  expect: {
    toMatchAriaSnapshot: {
      pathTemplate: "{testDir}/__snapshots__/{testFileName}/{arg}{ext}",
    },
  },
  webServer,
  projects: targets.map((t) => ({
    name: `${t.template}-${t.framework}`,
    testMatch: `${t.template}.spec.ts`,
    use: { baseURL: `http://localhost:${t.appPort}` },
    metadata: { mockUrl: `http://localhost:${t.mockPort}` },
  })),
})
