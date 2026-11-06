# Rebun templates

Apps prontos para deploy na Vercel, integrados ao [`rebun-sdk`](https://www.npmjs.com/package/rebun-sdk).

```
apps/<slug>/
  rebun.json     # manifesto: nome, env e tabelas que o core cria antes do deploy
  package.json   # deps fixas, sem workspace:* (o app é clonado sozinho)
  next.config.ts # carrega o .env da raiz em dev
  ...
```

## Regras

1. **Cada app é autossuficiente.** A Vercel clona só `apps/<slug>` para um repo novo: nada de `extends` para a raiz, `workspace:*` ou imports fora da pasta.
2. **Versões exatas** em todo `package.json` (sem lockfile no clone, o install usa os pins).
3. **A chave fica no servidor** (`REBUN_API_KEY`, sem `NEXT_PUBLIC_`); o SDK roda em Server Components e Server Actions.
4. **`rebun.json` é a fonte das tabelas.** `columns` segue o body de `POST /projects/:id/tables/:name/columns`, `access` o de `PUT .../access`. `id`, `created_at`, `updated_at` e `owner_id` são automáticos.

## Fluxo do botão no core

1. Usuário escolhe o template no painel do projeto.
2. Core lê `apps/<slug>/rebun.json` (raw do GitHub), cria as tabelas e o acesso, e gera uma API key.
3. Mostra a key e abre:

```
https://vercel.com/new/clone
  ?repository-url=https://github.com/<owner>/templates/tree/main/apps/<slug>
  &env=REBUN_API_KEY                       # rebun.json → env.join(",")
  &envDescription=API%20key%20do%20projeto%20Rebun
  &project-name=rebun-<slug>
```

A Vercel não aceita valor pré-preenchido para env; o usuário cola a key mostrada no passo 3.

## Dev

Todos os apps leem o `.env` da raiz (`process.loadEnvFile` no `next.config.ts`). No clone da Vercel o arquivo não existe e valem as envs do projeto.

```sh
bun install
cp .env.example .env
bun --filter guestbook dev
```

Novo template: copie `apps/guestbook`, troque `name` no `package.json` e o `rebun.json`.
