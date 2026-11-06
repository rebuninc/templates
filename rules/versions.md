# Package Version Rules

1. **Pin every dependency to an exact stable version** in every `package.json` (e.g. `"zod": "4.4.3"`) — never use `^`, `~`, `>`, `*`, `x`, or `latest` ranges. This applies to `dependencies`, `devDependencies`, `peerDependencies`, and `overrides`.
2. Only use stable releases — no `beta`, `rc`, `canary`, `next`, or other pre-release tags.
3. When adding or upgrading a package, install it with `bun add --exact <pkg>@<version>` (or `bun add -E`) so the range prefix is never written.
4. **Exception — `nitro`** only ships `rc` releases and Vercel requires it for TanStack Start; pin the exact `rc` version.
5. **Template apps ship without a lockfile** (Vercel installs from the clone), so the exact pins are the only thing locking versions.
