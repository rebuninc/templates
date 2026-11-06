# Git Rules

1. **Never commit or push without the user's explicit permission for that specific commit/push.** A prior approval does not carry over to the next one — ask each time.
2. **Never include AI attribution or credit lines in commit messages** — no Anthropic/Claude, Cursor, or similar (e.g. `Co-Authored-By: Claude ...`, `Co-Authored-By: Cursor ...`, "Generated with Claude Code", "Made with Cursor"). Commit messages must contain only the actual change description. Never add Cursor as a co-author.
3. **Don't run tests before committing** unless the user asks. Biome and typecheck run via the pre-commit hook; if the hook fails, fix and create a new commit (do not amend unless the amend rules allow it).
4. **Never create a branch without the user's explicit permission for that specific branch** — no `git checkout -b`, `git switch -c`, `git branch <name>`, `git worktree add -b`, or `EnterWorktree`. Ask first, each time.
5. **Never commit or push to `main` or `preview` without the user's explicit authorization for that specific action.** `dev` is the development branch: feature branches start from it and work lands there (still subject to rule 1).
6. **Never commit while the spec being implemented has an open acceptance criterion (`- [ ]`).** Mark each one `- [x]` only after checking it passed (see `rules/specs.md` rule 6); if any is still open, say which and don't commit, even with permission.
