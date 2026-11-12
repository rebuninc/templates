import { readdirSync } from "node:fs"

import { defineConfig } from "@playwright/test"

import { MOCK_PORT, MOCK_URL } from "./e2e/mock-url"

// One project per apps/<template>/<framework>; they share the spec and the snapshots.
const apps = readdirSync("apps").flatMap((template) =>
  readdirSync(`apps/${template}`).map((framework) => ({ template, framework })),
)
const servers = apps.map((app, i) => ({
  ...app,
  url: `http://localhost:${3300 + i}`,
}))

export default defineConfig({
  testDir: "e2e",
  snapshotPathTemplate: "{testDir}/__snapshots__/{testFileName}/{arg}{ext}",
  projects: servers.map((s) => ({
    name: `${s.template}-${s.framework}`,
    testMatch: `${s.template}.spec.ts`,
    use: { baseURL: s.url },
  })),
  webServer: [
    {
      command: "bun e2e/mock-api.ts",
      port: MOCK_PORT,
      env: { MOCK_PORT: String(MOCK_PORT) },
    },
    ...servers.map((s) => ({
      command: `cd apps/${s.template}/${s.framework} && bun run dev --port ${new URL(s.url).port} --strictPort`,
      url: s.url,
      env: { REBUN_URL: MOCK_URL, REBUN_API_KEY: `e2e-${s.template}` },
    })),
  ],
})
