# Commit Rules

1. **Follow Conventional Commits** (`feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:`… with an optional scope, e.g. `feat(blog): ...`).
2. **The commit body includes a `Critérios de aceite` section with 3 to 8 verifiable items.** Criteria describe behavior only; never list Biome or typecheck (they always run via the pre-commit hook, see `rules/git.md`).
3. **Use the criteria the user gives in the prompt.** If none are given, propose them and get the user's confirmation **before implementing**. Ask through the `AskUserQuestion` tool, never as plain chat text; this applies to every question to the user.
4. **For each criterion, point to the test that covers it, or write `sem teste`.**
5. **When done, check every criterion and say which ones passed.** If the behavior changes during implementation, update the criteria and confirm them with the user again.

Example:

```
feat(blog): paginate the post list

Critérios de aceite:
- The list shows 10 posts per page — e2e/blog.spec.ts "paginates posts"
- "Next" is disabled on the last page — e2e/blog.spec.ts "disables next on last page"
- The page number is kept in the URL (?page=2) — sem teste
```
