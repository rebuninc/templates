# Test Rules

1. **For every new feature or bug fix, check whether tests already cover it. If not, write them as part of the same change.**
2. A bug fix needs a regression test that fails without the fix and passes with it.
3. **Do not run tests, Biome, or typecheck unless the user explicitly asks** — not while implementing, and not before committing. Biome and typecheck run via the pre-commit hook (`bun run biome`, `bun run typecheck`).
