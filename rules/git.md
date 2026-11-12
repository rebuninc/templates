# Git Rules

1. **Never commit or push without the user's explicit permission for that specific commit/push.** A prior approval does not carry over to the next one — ask each time.
2. **Never include AI attribution or credit lines in commit messages** — no Anthropic/Claude, Cursor, or similar (e.g. `Co-Authored-By: Claude ...`, `Co-Authored-By: Cursor ...`, "Generated with Claude Code", "Made with Cursor"). Commit messages must contain only the actual change description. Never add Cursor as a co-author.
3. **Don't run tests before committing** unless the user asks. Lint, format and typecheck (`bun lint`, `bun fmt --check`, `bun check`) run via the pre-commit hook; if the hook fails, fix and create a new commit (do not amend unless the amend rules allow it).
4. **Never create a branch without the user's explicit permission for that specific branch** — no `git checkout -b`, `git switch -c`, `git branch <name>`, `git worktree add -b`, or `EnterWorktree`. Ask first, each time.
5. **Never commit or push to `main` or `preview` without the user's explicit authorization for that specific action.** Commit on `dev` (still subject to rule 1); a push to `dev` makes CI open the `dev` → `main` PR (`.github/workflows/promote-dev-to-main.yml`).
6. **Never commit while an acceptance criterion has not passed.** Check every criterion in the commit body first (see `rules/commits.md`); if any has not passed, say which and don't commit, even with permission.
