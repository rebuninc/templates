# Rebun templates

Apps prontos para deploy na Vercel, integrados ao [`rebun-sdk`](https://www.npmjs.com/package/rebun-sdk). Cada template existe em vários frameworks, com o mesmo banco.

```
apps/<template>/
  rebun.json          # manifesto: nome, frameworks, env e tabelas (compartilhado)
  next/               # app Next.js autossuficiente
  tanstack-start/     # app TanStack Start autossuficiente
```

Frameworks: `next`, `tanstack-start`.

## Regras

1. **Cada pasta de framework é autossuficiente.** A Vercel clona só `apps/<template>/<framework>` para um repo novo: nada de `extends` para a raiz, `workspace:*` ou imports fora da pasta.
2. **Mesmo comportamento em todos os frameworks.** Mesmas telas, mesmas tabelas, mesmo `Schema` em `lib/rebun.ts`. Mudou em um, muda nos outros.
3. **Versões exatas** em todo `package.json` (sem lockfile no clone, o install usa os pins). Exceção: `nitro` só tem release `rc`, e a Vercel exige ele para TanStack Start.
4. **A chave fica no servidor** (`REBUN_API_KEY`, sem prefixo público). O SDK roda em Server Components/Actions (Next) e `createServerFn` (TanStack Start).
5. **`rebun.json` é a fonte das tabelas.** `columns` segue o body de `POST /projects/:id/tables/:name/columns`, `access` o de `PUT .../access`. `id`, `created_at`, `updated_at` e `owner_id` são automáticos. `frameworks` lista as pastas que existem.
6. **Nome do pacote:** `<template>-<framework>` (ex.: `guestbook-next`).

## Fluxo do botão no core

1. Usuário escolhe o template e o framework (de `rebun.json` → `frameworks`).
2. Core lê `apps/<template>/rebun.json` (raw do GitHub), cria as tabelas e o acesso, e gera uma API key.
3. Mostra a key e abre:

```
https://vercel.com/new/clone
  ?repository-url=https://github.com/rebuninc/templates/tree/main/apps/<template>/<framework>
  &env=REBUN_API_KEY                       # rebun.json → env.join(",")
  &envDescription=API%20key%20do%20projeto%20Rebun
  &project-name=rebun-<template>
```

A Vercel não aceita valor pré-preenchido para env; o usuário cola a key mostrada no passo 3.

## Dev

Todos os apps leem o `.env` da raiz (`process.loadEnvFile` no `next.config.ts` / `vite.config.ts`). No clone da Vercel o arquivo não existe e valem as envs do projeto.

```sh
bun install
cp .env.example .env
bun --filter guestbook-next dev            # :3000
bun --filter guestbook-tanstack-start dev  # :3001
```

Novo template: copie `apps/guestbook`, troque `name` em cada `package.json` e o `rebun.json`.
