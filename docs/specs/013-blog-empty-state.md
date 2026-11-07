# Spec: blog-empty-state

## Relacionadas
- Altera: [002 — blog](./002-blog.md) — `/` e `/admin` sem posts mostram um empty state em vez de lista vazia

## Objetivo
Criar um componente `EmptyState` no estilo do core (ícone empilhado, título, subtítulo e ação opcional) e usá-lo no blog quando não houver posts: na home, com ação "Novo post" só para quem está logado, e em `/admin`, sempre com a ação.

## Fora do escopo
- Empty state no link-in-bio ou em outras telas do blog.
- Textos diferentes por tela.
- Ilustrações ou ícones por contexto (um ícone só).

## Comportamento
1. `EmptyState({ icon?, title, subtitle, action? })` em `src/components/empty-state.tsx`, igual ao do core (`apps/web/src/components/layout/empty-state.tsx`), com os tokens do blog no lugar dos do core (`bg-surface`, `text-fg`, `text-muted`, `fg/5`). O ícone é `aria-hidden`; o título é `h2`.
2. Ícone: `News01Icon` (hugeicons free).
3. Textos (iguais nas duas telas): título "Nenhum post ainda", subtítulo "Os posts publicados aparecem aqui.".
4. Ação: link "Novo post" para `/admin/new`, no estilo do botão primário do header (`rounded-full bg-fg text-bg`).
5. `/` sem posts publicados (e sem erro): empty state no lugar da lista e da paginação. Logado → com a ação; deslogado → sem ação.
6. `/admin` sem posts do usuário (e sem erro): empty state com a ação, no lugar da lista e da paginação.
7. Com erro de carregamento, continua só "Erro ao carregar: {code}", sem empty state.
8. A animação de hover do ícone respeita `prefers-reduced-motion` (sem transform).

## Arquivos
- `apps/blog/tanstack-start/`:
  - `src/components/empty-state.tsx` (novo)
  - `src/components/post-list.tsx` (`NoPosts({ canWrite })` com ícone, textos e ação, usado nas duas telas)
  - `src/routes/index.tsx` (empty state; viewer do loader do root)
  - `src/routes/admin.index.tsx` (empty state)
- `e2e/blog.spec.ts` (testes do empty state)

## Casos de borda
- Só há rascunhos → `/` mostra o empty state; `/admin` mostra os rascunhos.
- `?page=2` sem posts naquela página → mesma regra: lista vazia vira empty state.
- Erro da API → só a mensagem de erro.

## Critérios de aceite
- [x] Dado nenhum post publicado e deslogado, quando abro `/`, então vejo "Nenhum post ainda" e "Os posts publicados aparecem aqui." sem link "Novo post" no `<main>`.
- [x] Dado nenhum post publicado e logado, quando abro `/` e clico "Novo post" no empty state, então vou para `/admin/new`.
- [x] Dado logado sem posts, quando abro `/admin`, então vejo o empty state com "Novo post".
- [x] Dado posts publicados, quando abro `/`, então não vejo o empty state.
- [x] Dado o mock falhando a leitura, quando abro `/`, então vejo só "Erro ao carregar: BOOM", sem empty state.
