# Architecture Rules

## Layout

```
apps/<template>/
  tanstack-start/     # self-contained TanStack Start app (one folder per framework)
```

1. **Each framework folder is self-contained.** Vercel clones only `apps/<template>/<framework>` into a new repo: no `extends` to the root, no `workspace:*`, no imports outside the folder.
2. **Same behavior across frameworks.** See `rules/parity.md`.
3. **The API key stays on the server** (`REBUN_API_KEY`, no public prefix). The SDK runs only in `createServerFn` (TanStack Start).
4. **Tables, access, providers and buckets live in the template's config in the core** (kept by hand). Its spec here describes them; every folder in `apps/<template>/` is a framework app.
5. **Package name is `<template>-<framework>`** (e.g. `blog-tanstack-start`).
6. **Env is read from the root `.env` only in dev** (`process.loadEnvFile` in `vite.config.ts`); the clone must work with only the Vercel project env.

## File Naming

1. **All file names must be lowercase and use `-` (kebab-case) to separate words.** No camelCase, PascalCase, snake_case, or spaces in file names (e.g. `insert-record.ts`, not `insertRecord.ts`, `InsertRecord.ts`, or `insert_record.ts`).
2. This applies to all files in the project, including components, actions, and route files. Keep the extension casing as required by the framework (e.g. `page.tsx`) but the descriptive part of the name must still be kebab-case.
3. **Exception — TanStack Router file-route tokens in `src/routes/`.** Dynamic segments are `$` + camelCase (e.g. `$messageId`), pathless layouts start with `_`, the root is `__root.tsx`, and a literal dot is escaped as `[.]`. The rest of each name is still kebab-case.
