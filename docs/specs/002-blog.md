# Spec: blog

## Relacionadas
- Altera: [001 — ui-parity-e2e](./001-ui-parity-e2e.md) — remove o template guestbook (os testes cobrem só o blog) e o `rebun.json` (frameworks pelas pastas)
- Alterada por: [003 — blog-linear-ui](./003-blog-linear-ui.md) — UI no estilo Linear Now, sem React Bits
- Alterada por: [004 — blog-login-split](./004-blog-login-split.md) — e-mail atrás do botão "Continuar com e-mail"
- Alterada por: [013 — blog-empty-state](./013-blog-empty-state.md) — `/` e `/admin` sem posts mostram um empty state

## Objetivo
Novo template `apps/blog` (só TanStack Start por enquanto): blog público com lista e detalhe de posts publicados, login por OTP ou Google (sem cadastro) e CRUD dos próprios posts para quem está logado.

## Fora do escopo
- Tela de cadastro, senha, GitHub. A key de deploy tem `auth:login` sem `auth:signup`, então só entra quem já é usuário do projeto (criado no dashboard).
- Next.js ou outro framework.
- Registrar o template no core (`PROJECT_TEMPLATES`, providers, bucket); esta spec descreve o que a config do core precisa criar.
- Paginação (lista limitada a `take(50)`), busca, filtro por tag, markdown no conteúdo.
- Trocar o slug ao editar (o link fica estável).

## Comportamento
1. Banco (criado pela config do core): tabela `posts` com `title` (text, obrigatório), `slug` (text, obrigatório, único), `content` (text, obrigatório), `published` (boolean, default `false`), `image` (text, caminho no storage), `tags` (text array). Access: `read: public`, `create: authenticated`, `update: owner`, `delete: owner`. Providers `otp` e `google` e o bucket privado `post-images` (imagens até 5 MB).
2. Sessão: o client Rebun é criado por request com o cookie httpOnly `rebun-token` (opção `cookies` do SDK). O browser nunca vê o token.
3. `/` — título "Posts", link "Entrar" (deslogado) ou "Meus posts" (logado) e a lista dos posts com `published == true`, mais novos primeiro, com imagem, título (link para `/posts/$slug`), data e tags.
4. `/posts/$slug` — imagem, título, data, tags e conteúdo (parágrafos por quebra de linha). Post não publicado aparece só para o autor; para os demais, "Post não encontrado".
5. `/login` — campo e-mail + "Enviar código" (OTP com `redirectUri` = `<origem>/callback`) e botão "Entrar com Google". Depois de enviar, o form vira campo "Código" (6 dígitos) + "Entrar". Logado é redirecionado para `/admin`.
6. `/callback` — troca o `?code` (magic link ou Google) pela sessão e redireciona para `/admin`; erro mostra "Erro ao entrar: {code}" e link para `/login`.
7. `/admin` — exige login (senão vai para `/login`). Lista os posts do usuário (`owner_id == user.id`, incluindo rascunhos, marcados "Rascunho"), link "Novo post", "Editar" e "Excluir" (com `confirm`) em cada um, e botão "Sair".
8. `/admin/new` e `/admin/$postId/edit` — mesmo form: título, conteúdo, tags (separadas por vírgula), imagem (`accept="image/*"`, opcional; na edição mantém a atual se vazia) e checkbox "Publicado". Salvar volta para `/admin`.
9. Slug gerado na criação a partir do título: minúsculas, sem acento, não alfanumérico vira `-`, mais `-` e 6 caracteres aleatórios (garante unicidade sem consulta).
10. Imagem: upload no servidor para `post-images/<uuid>-<nome>`; a coluna guarda o caminho. Ao exibir, o servidor resolve uma URL assinada (`bucket.url`).
11. Excluir o post exclui também a imagem do storage; trocar a imagem exclui a antiga.
12. UI: Tailwind v4 (`@tailwindcss/vite`) e componentes do [React Bits](https://reactbits.dev) na variante TS + Tailwind, copiados para `src/components/` com `npx shadcn@latest add @react-bits/<Nome>-TS-TW` (dependências fixadas em versão exata):
    - `BlurText`: título "Posts" da home e título do post no detalhe.
    - `SpotlightCard`: cada post da lista em `/` e em `/admin`.
    - `AnimatedContent`: entrada em sequência dos cards da lista em `/` e em `/admin`.
    - `Aurora`: fundo do topo em `/` e em `/login`.
    - Forms, inputs e botões em Tailwind puro (React Bits não tem controles de form comuns).
13. A animação não muda a árvore acessível: título continua `heading` com o texto inteiro (BlurText recebe `aria-label`/texto acessível) e a Aurora é `aria-hidden`.

## Arquivos
- `apps/blog/tanstack-start/`:
  - `package.json` (`blog-tanstack-start`; deps do `shadcn add` fixadas em versão exata), `tsconfig.json`, `vite.config.ts` (+ `@tailwindcss/vite`), `components.json`
  - `src/router.tsx`, `src/styles.css`
  - `src/lib/rebun.ts` (client por request com cookies), `src/lib/posts.ts` (server fns)
  - `src/components/blur-text.tsx` (ganha `as="h1"`), `spotlight-card.tsx`, `animated-content.tsx`, `aurora.tsx` (React Bits, renomeados para kebab-case), `aurora-top.tsx`, `post-list.tsx`, `post-form.tsx`
  - `src/routes/__root.tsx`, `index.tsx`, `posts.$slug.tsx`, `login.tsx`, `callback.tsx`, `admin.index.tsx`, `admin.new.tsx`, `admin.$postId.edit.tsx`
- `e2e/mock-rebun.ts` (get/patch/delete, `where`, ordem por `created_at desc`, auth OTP/Google, storage), `e2e/blog.spec.ts`, `e2e/__snapshots__/blog.spec.ts/{list,detail}.aria.yml`
- `README.md` (template na lista), `rules/architecture.md` e `rules/parity.md` (sem `rebun.json`: config no core, frameworks pelas pastas), `playwright.config.ts` (descobre frameworks pelas pastas)

## Casos de borda
- Título/conteúdo só com espaços → nada é salvo e aparece "Preencha título e conteúdo".
- Tags com espaços e vazias (`" a, ,b "`) → `["a", "b"]`.
- Título só com símbolos (`"!!!"`) → slug é só o sufixo aleatório.
- Código OTP errado → "Erro ao entrar: {code}" e o campo continua lá.
- E-mail sem conta no projeto → "Erro ao entrar: SIGNUP_NOT_ALLOWED".
- Erro da API ao carregar a lista → "Erro ao carregar: {code}" (`role="alert"`).
- Erro ao salvar ou excluir → mensagem `{status} {code}` no form/lista, nada muda.
- Cookie expirado em `/admin` → vai para `/login`.
- Navegador sem WebGL → a Aurora não renderiza e a página funciona igual.
- Remontagem do componente (StrictMode, HMR) → a Aurora volta a renderizar; o cleanup não perde o contexto WebGL do canvas.
- `prefers-reduced-motion` → o conteúdo aparece sem esperar a animação (cards e títulos visíveis de cara).

## Critérios de aceite
- [x] Dado posts publicados e um rascunho, quando abro `/`, então vejo só os publicados, mais novos primeiro, com link para o detalhe.
- [x] Dado um post publicado, quando abro `/posts/<slug>`, então vejo título, tags, imagem e conteúdo.
- [x] Dado um rascunho, quando abro seu slug deslogado, então vejo "Post não encontrado".
- [x] Dado `/login`, quando envio e-mail e o código correto, então caio em `/admin` logado.
- [x] Dado `/callback?code=<válido>`, então caio em `/admin` logado.
- [x] Dado deslogado, quando abro `/admin`, então vou para `/login`.
- [x] Dado logado, quando crio um post com título `"  Olá Mundo  "`, tags `" a, ,b "` e imagem, então a API recebe `title: "Olá Mundo"`, `slug` começando com `ola-mundo-`, `tags: ["a","b"]`, `image` com o caminho enviado ao storage, e volto para `/admin` com o post na lista.
- [x] Dado logado, quando edito um post, então a API recebe o PATCH sem mudar o slug.
- [x] Dado logado, quando excluo um post confirmando, então ele some da lista e a imagem é excluída do storage.
- [x] Dado logado, quando clico "Sair", então o cookie é limpo e `/admin` volta a redirecionar para `/login`.
- [x] Dado o mock falhando a leitura, quando abro `/`, então aparece "Erro ao carregar: BOOM".
- [x] Dado `/` aberto, então o `<main>` bate com o ARIA snapshot (título "Posts" inteiro como heading, cards dos posts publicados), sem o fundo Aurora na árvore acessível.
- [x] Dado `/` ou `/login` com WebGL, então a Aurora ocupa a largura toda da janela e o contexto WebGL não está perdido.
