# Spec: link-in-bio

## Relacionadas
- Alterada por: [014 — input-placeholders](./014-input-placeholders.md) — título do link, nome e bio do perfil ganham placeholder
- Alterada por: [016 — login-mode-pill-motion](./016-login-mode-pill-motion.md) — o fundo da pill do `/login` desliza na troca
- Alterada por: [018 — file-upload](./018-file-upload.md) — o campo "Avatar" vira o `FileUpload`, e na edição o avatar atual pode ser removido

## Objetivo
Novo template `apps/link-in-bio` (TanStack Start): qualquer pessoa cria conta, monta uma página pública `/u/$username` com avatar, nome, bio, cor e uma lista ordenável de links, e vê no `/admin` quantos cliques cada link recebeu.

## Fora do escopo
- Outros frameworks além de TanStack Start.
- Registrar o template no core; esta spec descreve o que a config do core precisa criar.
- Excluir o perfil ou a conta.
- Cor livre (só a paleta fixa), ativar/desativar link sem excluir, ícones por link.
- Analytics além do total por link (por dia, origem, IP, user-agent).
- Contagem de cliques na página pública.
- Redirecionar o username antigo depois de uma troca.
- Excluir os cliques quando o link é excluído (ficam órfãos).

## Comportamento
1. **Banco** (criado pela config do core):
   - `profiles`: `username` (text, obrigatório, único), `name` (text, obrigatório), `bio` (text), `avatar` (text, caminho no storage), `color` (text, default `violet`). Um perfil por usuário fica a cargo do app (o core não cria `owner_id` único). Access: `read: public`, `create: authenticated`, `update: owner`, `delete: owner`.
   - `links`: `title` (text, obrigatório), `url` (text, obrigatório), `position` (integer, obrigatório). Access: `read: public`, `create: authenticated`, `update: owner`, `delete: owner`.
   - `clicks`: `link_id` (text, obrigatório), sem dados do visitante. Access: `read: public`, `create: public`.
   - Providers e login iguais ao blog, com `auth:signup` na key. Bucket privado `avatars` (imagens até 2 MB).
2. **Base do blog:** sessão por cookie httpOnly (`lib/rebun.ts`), `/login` com pill "Entrar | Criar conta" e providers de `project.me()`, OTP com Code Slots, `/callback`, tema claro/escuro com toggle, motion, barra de progresso e favicon são copiados do blog. Só mudam os textos com o nome do app e o destino depois do login (`/admin`).
3. **`/`** — landing: título, uma frase sobre o app e o botão "Criar minha página" (→ `/login`) ou "Minha página" (→ `/admin`, logado).
4. **`/u/$username`** — avatar, nome (`heading`, também no `<title>`), bio e os links do dono (`owner_id == profile.owner_id`, `take(50)`, ordenados por `position` crescente) como botões de largura total na cor do perfil. Cada botão aponta para `/go/$linkId`. Username inexistente → heading "Perfil não encontrado".
5. **`/go/$linkId`** — rota de servidor: busca o link, cria `clicks { link_id }` e responde 302 para `url`. Falha ao gravar o clique não impede o redirect.
6. **`/admin`** — exige login (senão `/login`). Sem perfil → redireciona para `/admin/setup`. Com perfil: avatar, nome, `@username`, link "Ver minha página" (`/u/$username`), "Editar perfil" ("Sair" fica no menu "Conta" do header, como no blog), form "Novo link" (título + URL + "Adicionar") e a lista de links em ordem, cada um com título, URL, "{n} cliques" ("1 clique" no singular), botões ↑/↓ (`aria-label` "Mover para cima"/"Mover para baixo"; ↑ desabilitado no primeiro, ↓ no último), "Editar" e "Excluir" (com `confirm`).
7. **`/admin/setup`** e **`/admin/profile`** — mesmo form de perfil: username, nome, bio (`maxLength` 160), avatar (`accept="image/*"`, opcional; na edição mantém o atual se vazio) e cor (radiogroup com a paleta). Salvar volta para `/admin`. Logado com perfil em `/admin/setup` → `/admin`; sem perfil em `/admin/profile` → `/admin/setup`.
8. **`/admin/links/$linkId/edit`** — form com título e URL. Salvar volta para `/admin`.
9. **Username:** `trim` + minúsculas, precisa casar com `^[a-z0-9_.]{3,30}$`, senão "Username inválido". Erro 409 da API → "Username já em uso". Pode ser trocado na edição; o link antigo passa a dar "Perfil não encontrado".
10. **URL do link:** `trim`; sem esquema, ganha `https://` na frente. Precisa ser `http:` ou `https:` válido (`new URL`), senão "URL inválida".
11. **Ordem:** link novo recebe `position` = maior `position` da lista + 1 (ou 0). ↑/↓ troca a `position` com o vizinho (dois `update`) e a lista atualiza.
12. **Cliques:** para cada link do `/admin`, o total vem de `clicks.where("link_id", "==", id).take(1)` (campo `total`).
13. **Paleta:** `violet`, `blue`, `green`, `orange`, `pink`, `gray` (rótulos "Violeta", "Azul", "Verde", "Laranja", "Rosa", "Cinza"), um tom escuro por cor com texto branco em contraste AA, que serve nos dois temas. A coluna guarda o nome; valor desconhecido cai em `violet`.
14. **Avatar:** upload no servidor para `avatars/<uuid>-<nome>`; a coluna guarda o caminho e a exibição usa URL assinada (`bucket.url`). Trocar o avatar exclui o antigo. Sem avatar → círculo com a inicial do nome.
15. **Pós-ação:** depois de adicionar um link, a lista atualiza e o form fica vazio. Depois de excluir, o link some.

## Arquivos
- `apps/link-in-bio/tanstack-start/`:
  - `package.json` (`link-in-bio-tanstack-start`, mesmas versões do blog), `tsconfig.json`, `vite.config.ts`, `public/favicon.ico`, `public/icon.svg`
  - `src/router.tsx`, `src/styles.css` (+ tokens da paleta)
  - `src/lib/rebun.ts` (schema `profiles`/`links`/`clicks`, `BUCKET = "avatars"`), `src/lib/auth.ts` (sessão e login, vindos do `posts.ts` do blog), `src/lib/profiles.ts`, `src/lib/links.ts` (server fns; `recordClick` é server fn chamada pela rota `/go`), `src/lib/theme.ts`, `src/lib/motion.ts`, `src/lib/utils.ts` (`APP_NAME = "Links"`)
  - `src/components/` copiados do blog (`ui/*`, `logo`, `theme-toggle`, `navigation-progress`, `night-silk`) + `profile-form.tsx`, `link-form.tsx`, `link-list.tsx`, `avatar.tsx`
  - `src/routes/__root.tsx`, `index.tsx`, `login.tsx`, `callback.tsx`, `u.$username.tsx`, `go.$linkId.tsx`, `admin.index.tsx`, `admin.setup.tsx`, `admin.profile.tsx`, `admin.links.$linkId.edit.tsx`
- `e2e/mock-rebun.ts` (`unique` no state: colunas únicas por tabela → 409 `UNIQUE_VIOLATION` no create/patch), `e2e/link-in-bio.spec.ts`, `e2e/__snapshots__/link-in-bio.spec.ts/profile.aria.yml`
- `README.md` (template na lista)

## Casos de borda
- Username `"  Gabriel.R  "` → salvo como `gabriel.r`.
- Username `"ab"`, `"a b"` ou `"ação"` → "Username inválido", nada é salvo.
- Username de outro perfil → "Username já em uso", o form continua preenchido.
- URL `"exemplo.com"` → salva `https://exemplo.com`.
- URL `"javascript:alert(1)"` ou `"ftp://x"` → "URL inválida".
- Título, URL ou nome só com espaços → "Preencha todos os campos", nada é salvo.
- `/go/<id inexistente>` → 404 "Link não encontrado".
- Falha ao gravar o clique → o visitante é redirecionado mesmo assim.
- ↑ no primeiro link / ↓ no último → botão desabilitado.
- Erro da API ao salvar, mover ou excluir → mensagem `{status} {code}`, nada muda.
- Erro ao carregar `/u/$username` ou `/admin` → "Erro ao carregar: {code}" (`role="alert"`).
- Cookie expirado em `/admin*` → `/login`.
- `color` fora da paleta → página usa `violet`.

## Critérios de aceite
- [x] Dado deslogado, quando abro `/`, então vejo "Criar minha página" levando a `/login`.
- [x] Dado um usuário novo logado, quando abro `/admin`, então vou para `/admin/setup`.
- [x] Dado `/admin/setup`, quando salvo username `"  Gabriel.R  "`, nome, bio, avatar e cor `blue`, então a API recebe `username: "gabriel.r"`, `color: "blue"`, `avatar` com o caminho enviado ao storage, e caio em `/admin`.
- [x] Dado `/admin/setup`, quando uso um username inválido, então aparece "Username inválido" e nada é enviado.
- [x] Dado um username já usado, quando salvo, então aparece "Username já em uso".
- [x] Dado logado com perfil, quando adiciono o link "Site" / `exemplo.com`, então a API recebe `url: "https://exemplo.com"` com `position` seguinte, a lista mostra o link e o form fica vazio.
- [x] Dado uma URL `javascript:alert(1)`, quando adiciono, então aparece "URL inválida" e nada é enviado.
- [x] Dado dois links, quando clico "Mover para baixo" no primeiro, então as `position` são trocadas e a ordem em `/admin` e em `/u/$username` muda.
- [x] Dado um perfil com links, quando abro `/u/<username>` deslogado, então vejo avatar, nome, bio e os links em ordem, e o `<main>` bate com o ARIA snapshot.
- [x] Dado `/u/<inexistente>`, então vejo "Perfil não encontrado".
- [x] Dado um link, quando abro `/go/<id>` deslogado, então um `clicks` é criado e sou redirecionado para a URL do link.
- [x] Dado um link com 3 cliques, quando abro `/admin`, então vejo "3 cliques" nele.
- [x] Dado logado, quando troco o username, então `/u/<novo>` mostra o perfil e `/u/<antigo>` mostra "Perfil não encontrado".
- [x] Dado logado, quando troco o avatar, então o antigo é excluído do storage.
- [x] Dado logado, quando edito um link, então a API recebe o PATCH com título e URL novos.
- [x] Dado logado, quando excluo um link confirmando, então ele some da lista.
- [x] Dado logado, quando clico "Sair", então `/admin` volta a redirecionar para `/login`.
