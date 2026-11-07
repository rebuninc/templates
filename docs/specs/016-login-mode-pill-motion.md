# Spec: login-mode-pill-motion

## Relacionadas
- Altera: [009 — blog-signup-toggle](./009-blog-signup-toggle.md) — o fundo da pill "Entrar | Criar conta" desliza na troca
- Altera: [012 — link-in-bio](./012-link-in-bio.md) — mesma animação na pill do `/login`

## Objetivo
Na pill "Entrar | Criar conta" do `/login` (blog e link-in-bio), o fundo da opção marcada desliza até a outra opção em vez de trocar de cor na hora.

## Fora do escopo
- Animar os textos que mudam com o modo (título e botões).
- Mudar as outras animações do login (crossfade das etapas, shader).

## Comportamento
1. O fundo `bg-surface` da opção marcada vira um elemento próprio (`motion.span` com `layoutId`) atrás do texto, e desliza até a opção nova com o `spring` de `lib/motion.ts` (0.4s, sem bounce).
2. A cor do texto continua com a transição atual (`transition-colors`).
3. Com `prefers-reduced-motion: reduce`, o fundo troca na hora, sem `transform` (via `MotionConfig reducedMotion="user"`).
4. Nada anima no primeiro carregamento; markup, roles (`radiogroup`/`radio`) e textos ficam iguais.

## Casos de borda
- Cliques rápidos alternando → a animação se interrompe e segue para a opção atual, sem fundo duplicado.
- Voltar de "Continuar com senha" para a tela inicial → o fundo aparece já na opção marcada, sem deslizar.

## Critérios de aceite
- [x] Dado a pill com motion, quando marco "Criar conta", então o fundo desliza (há `transform` durante a troca).
- [x] Dado reduce motion, quando marco "Criar conta", então o fundo troca sem `transform`.
- [x] Os fluxos e snapshots ARIA existentes continuam passando sem mudança.

## Arquivos
- `apps/blog/tanstack-start/src/routes/login.tsx` (fundo deslizante da pill)
- `apps/link-in-bio/tanstack-start/src/routes/login.tsx` (fundo deslizante da pill)
- `e2e/blog.spec.ts`, `e2e/link-in-bio.spec.ts` (testes com e sem reduce motion)
