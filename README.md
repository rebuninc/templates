# Rebun templates

Apps prontos para deploy na Vercel, integrados ao [`rebun-sdk`](https://www.npmjs.com/package/rebun-sdk). Cada template existe em vários frameworks, com o mesmo banco.

```
apps/<template>/
  tanstack-start/     # app TanStack Start autossuficiente (uma pasta por framework)
```

Frameworks: `tanstack-start`.

Templates:

- `blog` (lista pública de posts, login OTP/Google e CRUD dos próprios posts).
- `link-in-bio` (cadastro aberto, página pública `/u/<username>` com links ordenáveis e contagem de cliques).

## Regras

Veja [`rules/`](./rules/index.md) — estrutura dos templates em [`rules/architecture.md`](./rules/architecture.md).

## Fluxo do botão no core

1. Usuário escolhe o template e o framework (config do template no core, mantida à mão).
2. Core cria as tabelas, o acesso, os providers e os buckets da config e gera uma API key.
3. Mostra a key e abre:

```
https://vercel.com/new/clone
  ?repository-url=https://github.com/rebuninc/templates/tree/main/apps/<template>/<framework>
  &env=REBUN_API_KEY
  &envDescription=API%20key%20do%20projeto%20Rebun
  &project-name=rebun-<template>
```

A Vercel não aceita valor pré-preenchido para env; o usuário cola a key mostrada no passo 3.

## Dev

Todos os apps leem o `.env` da raiz (`process.loadEnvFile` no `vite.config.ts`). No clone da Vercel o arquivo não existe e valem as envs do projeto.

```sh
bun install
cp .env.example .env
bun --filter blog-tanstack-start dev
```

Novo template: copie `apps/blog`, troque `name` em cada `package.json` e registre a config no core.
