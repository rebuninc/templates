# Spec: blog-linear-ui

## Relacionadas
- Altera: [002 — blog](./002-blog.md) — troca a UI com React Bits por um visual sóbrio inspirado no [Linear Now](https://linear.app/now) e remove os efeitos
- Continuada por: [004 — blog-login-split](./004-blog-login-split.md) — `/login` em duas colunas com shader, sem navbar

## Objetivo
Redesenhar a UI do template blog no estilo do Linear Now (escuro, Inter, grid de cards com capa 16:9, artigo centralizado), sem efeitos animados. Dados, rotas e fluxos não mudam.

## Fora do escopo
- Abas de categoria, busca, RSS, rodapé com CTA (o blog não tem categorias nem busca).
- Logo, nome ou qualquer marca do Linear: só o estilo visual.
- Mudar tabela, server fns, form de post ou rotas.

## Comportamento
1. Remove `Aurora`, `BlurText`, `SpotlightCard` e `AnimatedContent` (arquivos `aurora.tsx`, `aurora-top.tsx`, `blur-text.tsx`, `spotlight-card.tsx`, `animated-content.tsx`), as deps `gsap` e `motion` e o `components.json`. Nada anima.
2. Tema: fundo `#08090A`, texto `#F7F8F8`, texto secundário `#8A8F98`, corpo do artigo `#D0D6E0`, bordas `#23252A`, superfície `#0F1011`. Fonte Inter (Google Fonts, pesos 400/510/590) com fallback de sistema.
3. Navbar em todas as páginas (fora do `<main>`, `<header>` com borda inferior): "Blog" à esquerda (link para `/`) e, à direita, "Entrar" (deslogado) ou, logado, "Meus posts", "Novo post" e o user menu: botão "Conta" em formato pill com a inicial do e-mail num círculo e um chevron ao lado, que abre um popover nativo (fecha com Esc ou clique fora) com o e-mail e o item "Sair" (sai e vai para `/login`), com o viewer vindo do loader da raiz. O link "Entrar"/"Meus posts" sai do cabeçalho da home.
4. `/` — título "Posts" (48px, peso 510, tracking negativo) e grid de cards: 3 colunas no desktop, 2 no tablet, 1 no celular, com separador vertical fino entre colunas. Cada card: capa 16:9 com borda e cantos 8px, título (link, 20px peso 510), resumo e linha "data" em texto secundário, e tags.
5. Resumo do card: primeiro parágrafo não vazio do conteúdo, cortado visualmente em 3 linhas (`line-clamp-3`).
6. Post sem imagem → a capa vira uma caixa 16:9 vazia com borda e fundo de superfície (`aria-hidden`), para o grid ficar alinhado.
7. `/admin` usa o mesmo grid (rascunhos com " · Rascunho" na linha da data) com "Editar"/"Excluir" como pills sempre visíveis flutuando no canto superior direito da capa (fundo escuro translúcido com desfoque); o cabeçalho da página tem só o título "Meus posts" (e-mail, "Novo post" e "Sair" ficam na navbar).
8. `/posts/$slug` — layout do artigo do Linear: link "Posts" com ícone de seta à esquerda, título centralizado (48px, peso 590), capa larga (até 976px, cantos 8px), linha com a data centralizada, tags centralizadas e corpo em coluna de 624px (17px, altura de linha 1.6).
9. `/login`, `/callback` e forms de post: inputs com cantos 8px, borda `#23252A` e fundo de superfície; botão principal claro (`#F7F8F8` com texto escuro), botões secundários com borda.
10. Textos, labels, placeholders, atributos e ordem dos campos continuam os mesmos da spec 002.

## Arquivos
- `apps/blog/tanstack-start/`:
  - `package.json` (sem `gsap` e `motion`), sem `components.json`
  - `src/styles.css` (tema), `src/routes/__root.tsx` (fonte, navbar, loader do viewer)
  - `src/lib/posts.ts` (`listMine` sem `email`)
  - `src/components/post-list.tsx` (grid, capa, resumo), `post-form.tsx` (estilo)
  - `src/routes/index.tsx`, `posts.$slug.tsx`, `login.tsx`, `callback.tsx`, `admin.index.tsx`, `admin.new.tsx`, `admin.$postId.edit.tsx`
  - removidos: `src/components/aurora.tsx`, `aurora-top.tsx`, `blur-text.tsx`, `spotlight-card.tsx`, `animated-content.tsx`
- `e2e/blog.spec.ts` (sai o teste da Aurora, entra o da navbar), `e2e/__snapshots__/blog.spec.ts/{list,detail}.aria.yml`

## Casos de borda
- Conteúdo cujo primeiro parágrafo é longo → o resumo para em 3 linhas com reticências.
- Conteúdo começando com linhas vazias → o resumo usa a primeira linha com texto.
- Tela de celular → grid em 1 coluna, sem separadores, navbar sem quebrar.

## Critérios de aceite
- [x] Dado `/` aberto, então o `<main>` bate com o ARIA snapshot: heading "Posts" e cards com título (link), resumo, data e tags, sem link "Entrar" dentro do `<main>`.
- [x] Dado deslogado, então a navbar tem os links "Blog" e "Entrar"; dado logado, tem os links "Blog", "Meus posts" e "Novo post" e o botão "Conta" com a inicial; ao abrir, o menu mostra o e-mail e "Sair".
- [x] Dado um post com imagem e outro sem, quando abro `/`, então os dois cards têm a capa 16:9 com a mesma altura.
- [x] Dado `/posts/<slug>` aberto, então o `<main>` bate com o ARIA snapshot (título, data, tags, parágrafos).
- [x] Dado o app, então não existe mais Aurora, BlurText, SpotlightCard, AnimatedContent nem as deps `gsap`/`motion`.
- [x] Dado os testes e2e existentes de login, criação, edição, exclusão e saída, então continuam passando.
