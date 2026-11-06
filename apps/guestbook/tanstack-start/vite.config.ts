import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import { nitro } from "nitro/vite"
import { defineConfig } from "vite"

// Local dev reads the monorepo's root .env; a Vercel clone has none and uses its own env.
try {
  process.loadEnvFile("../../../.env")
} catch {}

export default defineConfig({
  server: { port: 3001 },
  resolve: { tsconfigPaths: true },
  plugins: [tanstackStart(), nitro(), viteReact()],
})
