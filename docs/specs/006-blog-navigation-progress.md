# Spec: blog-navigation-progress

## Objetivo
Trazer do `core/apps/web` a barra de carregamento no topo da tela, que aparece enquanto o router está carregando uma rota (loaders em andamento), para o usuário saber que a navegação começou.

## Fora do escopo
- Barra para ações que não navegam (enviar form, `signOut`) além do `router.invalidate()`/`navigate` que já disparam o router.
- Porcentagem real de progresso (a barra é indeterminada).

## Comportamento
1. Um `<NavigationProgress />` fica no `__root.tsx`, antes do `<header>`, em todas as telas (inclusive `/login`).
2. Enquanto `useRouterState` tem `status === "pending"`, aparece uma barra fixa no topo (`h-[3px]`, `z` acima do header), com trilho `bg-fg/20` e duas faixas `bg-fg` animadas em loop (mesmas keyframes e curvas do core).
3. Quando o carregamento termina, a barra some com fade de 200 ms e sai do DOM.
4. A barra tem `aria-hidden="true"`, `pointer-events-none` e `data-navigation-progress`; não entra nos snapshots ARIA.

## Casos de borda
- Navegação instantânea (sem loader lento) → a barra pode piscar e sumir; nada quebra.
- Nova navegação durante o fade → a barra volta a ficar opaca.

## Critérios de aceite
- [x] Dado um loader lento, quando o usuário navega por um link, então `[data-navigation-progress]` aparece no topo.
- [x] Dado que o loader terminou, então `[data-navigation-progress]` sai do DOM.
- [x] Os snapshots ARIA existentes continuam passando sem mudança.

## Arquivos
- `apps/blog/tanstack-start/`:
  - `src/components/navigation-progress.tsx` (novo)
  - `src/routes/__root.tsx` (renderiza a barra)
  - `src/styles.css` (keyframes `progress-primary`/`progress-secondary`)
- `e2e/mock-rebun.ts` (estado `delay` em ms antes de responder)
- `e2e/blog.spec.ts` (teste da barra)
