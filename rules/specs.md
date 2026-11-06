# Spec Workflow Rules

1. **Every new feature or behavior change starts with a spec** in `docs/specs/NNN-name.md` (zero-padded, sequential, kebab-case — e.g. `001-project-invites.md`), following the template in `docs/specs/_template.md`.
2. **Specs live only in `docs/specs/`.** Never treat an issue or card as a spec.
3. **If there is no spec, always interview the user — one question at a time — and write it before any code.**
   - **Always ask through the `AskUserQuestion` tool, never as plain chat text.** This applies to every question to the user (interview, clarifications, choosing between approaches), in any workflow.
4. **Don't implement anything that isn't in the spec.** If something is missing, ask.
5. **Before coding, list in 3 to 6 bullets what will change and in which files, and wait for the user's confirmation.**
6. **When done, check every acceptance criterion and say which ones passed.**
7. **If the behavior changes during implementation, update the spec.**
8. **Never list Biome or typecheck in acceptance criteria** — they always run via the pre-commit hook (see `rules/git.md`). Criteria describe behavior only.
9. **Link related specs in both directions.** When a spec changes, continues, or replaces behavior from another spec, both files get a `## Relacionadas` section (right below the title) with relative links: the new spec lists `Altera`/`Continua` and the older one gets the matching `Alterada por`/`Continuada por` (e.g. `- Alterada por: [002 — account-references](./002-account-references.md) — renomeia members[].user`). This also applies when an existing spec is edited (rule 7) and the edit touches another spec. Omit the section when there are no relations.
