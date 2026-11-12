# Test Rules

1. **For every new feature or bug fix, check whether tests already cover it. If not, write them as part of the same change.**
2. A bug fix needs a regression test that fails without the fix and passes with it.
3. **Do not run tests, lint, format, or typecheck unless the user explicitly asks** — not while implementing, and not before committing. `bun lint`, `bun fmt --check` and typecheck (`bun check`) run via the pre-commit hook.
4. **When asked to validate, run only the tests that cover the commit's acceptance criteria. Never run a whole suite without the user's explicit authorization for that run.** For one file use `bun run test:e2e e2e/<template>.spec.ts`.
