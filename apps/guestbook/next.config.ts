import type { NextConfig } from "next"

// Local dev reads the monorepo's root .env; a Vercel clone has none and uses its own env.
try {
  process.loadEnvFile("../../.env")
} catch {}

export default {} satisfies NextConfig
