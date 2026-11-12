import { existsSync } from "node:fs"

import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import { nitro } from "nitro/vite"
import { defineConfig } from "vite"

const ROOT_ENV = "../../../.env"

export default defineConfig(({ command }) => {
  // Dev in the monorepo only; a Vercel clone reads its project env.
  if (command === "serve" && existsSync(ROOT_ENV)) process.loadEnvFile(ROOT_ENV)
  return { plugins: [tanstackStart(), nitro(), viteReact()] }
})
