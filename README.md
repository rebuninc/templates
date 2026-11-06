# Rebun templates

Apps prontos para deploy na Vercel, integrados ao [`rebun-sdk`](https://www.npmjs.com/package/rebun-sdk). Cada template existe em vários frameworks, com o mesmo banco.

```
apps/<template>/
  rebun.json          # manifesto: nome, frameworks, env e tabelas (compartilhado)
  tanstack-start/     # app TanStack Start autossuficiente
```

Frameworks: `tanstack-start`.

## Regras

Veja [`rules/`](./rules/index.md) — estrutura dos templates em [`rules/architecture.md`](./rules/architecture.md).

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

Todos os apps leem o `.env` da raiz (`process.loadEnvFile` no `vite.config.ts`). No clone da Vercel o arquivo não existe e valem as envs do projeto.

```sh
bun install
cp .env.example .env
bun --filter guestbook-tanstack-start dev
```

Novo template: copie `apps/guestbook`, troque `name` em cada `package.json` e o `rebun.json`.
