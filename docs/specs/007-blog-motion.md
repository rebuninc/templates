# Spec: blog-motion

## Objetivo
Deixar navegação, cliques e mudanças do blog mais agradáveis com animações sutis (biblioteca `motion`), respeitando `prefers-reduced-motion`.

## Fora do escopo
- Transição de saída de página e capa compartilhada entre card e post.
- Animações em loop chamando atenção, parallax e scroll-driven.
- Mudar as animações que já existem (barra de navegação, shader do login, altura do header, toasts do `sonner`).

## Comportamento
1. `motion` `14.9.1` (exato) entra em `dependencies`. Um `<MotionConfig reducedMotion="user">` envolve o conteúdo do `<body>`.
2. Tom geral: sutil e polido. Entrada = opacidade 0→1 + subida de 8px, spring `duration 0.4`, `bounce 0`; saídas mais curtas e discretas que as entradas.
3. Nada anima no primeiro carregamento (SSR): só a partir de navegações no cliente, depois da hidratação. Assim o HTML do servidor já vem visível.
4. **Páginas:** ao mudar de rota (pathname), a página nova entra com a animação de entrada; a antiga troca na hora (sem esperar saída). Mudar só o `?page` não anima a página inteira.
5. **Cards:** os cards da lista (home e Meus posts) entram em sequência, 40ms entre eles. No hover do card, a capa dá zoom de 1.03 (500ms, ease-out) dentro da borda.
6. **Post:** título, imagem, data, tags e texto entram em sequência, 60ms entre eles.
7. **Cliques:** botões (`Button`), pills da paginação e do header, e os chips Editar/Excluir encolhem para 0.97 enquanto pressionados (160ms). Desabilitados não encolhem.
8. **Menu do usuário:** abre com fade + escala de 0.96→1 a partir do canto do botão (150ms) e fecha com fade, via `@starting-style` (CSS).
9. **Login:** a troca entre opções / e-mail / senha / código faz crossfade (sai em 120ms, a nova entra com a animação de entrada). O `autoFocus` dos campos continua.
10. **Lista:** ao excluir um post, o card sai com fade + escala 0.96 e os outros deslizam para o novo lugar. Mudar de página na lista também troca os cards com essa saída/entrada.
11. **Erros inline** (`role="alert"` na home, Meus posts, formulário do post e callback) aparecem com fade + subida de 4px (CSS).
12. **Reduce motion:** com `prefers-reduced-motion: reduce`, nada se desloca nem escala (sem `transform` e sem animação de layout); restam só os fades. As entradas começam do estado `fade` (só opacidade), porque o `MotionConfig` sozinho ainda desenha o primeiro quadro deslocado, e a saída do card não escala. As animações em CSS (cliques, menu, capa, erros) também param de mexer.

## Casos de borda
- Cliques rápidos seguidos no login → as transições se interrompem sem duplicar telas (`mode="wait"`).
- Excluir o último post da página → o card sai e a lista fica vazia, sem salto.
- Navegar durante uma entrada → a página nova recomeça a própria entrada.

## Critérios de aceite
- [x] Dado o primeiro carregamento de qualquer página, então o HTML do servidor não vem com `opacity: 0`.
- [x] Dado reduce motion, quando o usuário navega da home para um post, então a página nova não tem `transform` durante a entrada.
- [x] Dado reduce motion, quando o usuário abre o menu do usuário, então ele aparece sem escala.
- [x] Dado um post excluído, então o card some da lista e os outros continuam lá.
- [x] Os fluxos e snapshots ARIA existentes continuam passando sem mudança.

## Arquivos
- `apps/blog/tanstack-start/`:
  - `package.json` (`motion` 14.9.1)
  - `src/lib/motion.ts` (novo: transições e o guard de hidratação)
  - `src/routes/__root.tsx` (`MotionConfig`, entrada de página, press nos pills do header, classe do menu)
  - `src/styles.css` (`press`, menu, erros inline)
  - `src/components/ui/button.tsx` (press)
  - `src/components/post-list.tsx` (cards, capa, exclusão)
  - `src/components/pagination.tsx` (press)
  - `src/components/post-form.tsx`, `src/routes/index.tsx`, `src/routes/admin.index.tsx`, `src/routes/callback.tsx` (erros inline, chips)
  - `src/routes/posts.$slug.tsx` (sequência do post)
  - `src/routes/login.tsx` (crossfade das etapas)
- `e2e/blog.spec.ts` (testes de reduce motion e do SSR visível)
