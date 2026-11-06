# Architecture Rules

## Layout

```
apps/<template>/
  rebun.json          # manifest: name, frameworks, env and tables (shared)
  tanstack-start/     # self-contained TanStack Start app
```

1. **Each framework folder is self-contained.** Vercel clones only `apps/<template>/<framework>` into a new repo: no `extends` to the root, no `workspace:*`, no imports outside the folder.
2. **Same behavior across frameworks.** See `rules/parity.md`.
3. **The API key stays on the server** (`REBUN_API_KEY`, no public prefix). The SDK runs only in `createServerFn` (TanStack Start).
4. **`rebun.json` is the source of the tables.** `columns` follows the body of `POST /projects/:id/tables/:name/columns`, `access` the body of `PUT .../access`. `id`, `created_at`, `updated_at` and `owner_id` are automatic, never declare them. `frameworks` lists exactly the folders that exist.
5. **Package name is `<template>-<framework>`** (e.g. `guestbook-tanstack-start`).
6. **Env is read from the root `.env` only in dev** (`process.loadEnvFile` in `vite.config.ts`); the clone must work with only the Vercel project env.

## File Naming

1. **All file names must be lowercase and use `-` (kebab-case) to separate words.** No camelCase, PascalCase, snake_case, or spaces in file names (e.g. `insert-record.ts`, not `insertRecord.ts`, `InsertRecord.ts`, or `insert_record.ts`).
2. This applies to all files in the project, including components, actions, and route files. Keep the extension casing as required by the framework (e.g. `page.tsx`) but the descriptive part of the name must still be kebab-case.
3. **Exception — TanStack Router file-route tokens in `src/routes/`.** Dynamic segments are `$` + camelCase (e.g. `$messageId`), pathless layouts start with `_`, the root is `__root.tsx`, and a literal dot is escaped as `[.]`. The rest of each name is still kebab-case.
