# Spec: blog-login-providers

## Relacionadas
- Altera: [004 — blog-login-split](./004-blog-login-split.md) — os botões de `/login` passam a depender dos providers ativos e entram GitHub e senha
- Alterada por: [009 — blog-signup-toggle](./009-blog-signup-toggle.md) — `/login` ganha a pill "Entrar | Criar conta" com `auth:signup`

## Objetivo
Atualizar o `rebun-sdk` para 0.5.2 e usar `rebun.project.me()` para mostrar em `/login` só os métodos de login ativos no projeto, adicionando GitHub e e-mail + senha. Os erros do `/login` passam a aparecer num toast (`sonner`) no topo, centralizado.

## Fora do escopo
- Cadastro com senha (`signUp`/`verifySignUp`) e "esqueci a senha" (`resetPassword`/`confirmReset`).
- Mudar `/callback` (GitHub usa o mesmo `exchangeCode` do Google).
- Cache dos providers entre requisições.
- Toast em outras telas (listas, post, admin continuam com erro inline).

## Comportamento
1. `rebun-sdk` fica em `0.5.2` e entra `sonner` `2.0.8` (exatos). Um `<Toaster position="top-center" />` fica no `__root.tsx`.
2. O loader de `/login` chama `project.me()` no servidor e devolve `{ providers, error }`.
3. Na tela inicial aparecem, nesta ordem, só os botões dos providers ativos:
   - `google` → "Entrar com Google" (principal, ícone G).
   - `github` → "Entrar com GitHub" (secundário, ícone GitHub); leva ao GitHub e volta por `/callback` como o Google.
   - `otp` → "Continuar com e-mail" (secundário; fluxo da spec 004).
   - `password` → "Continuar com senha" (secundário).
4. "Continuar com senha" troca os botões pelos campos "E-mail" (`type="email"`, `required`) e "Senha" (`type="password"`, `required`), o botão "Entrar" e o link-botão "Voltar". Sucesso → `/admin`; erro → toast "Erro ao entrar: {code}".
5. Se `project.me()` falhar: sem botões e toast "Erro ao carregar: {code}".
6. Se vier sem providers: sem botões e o texto "Nenhum método de login ativo.".
7. Todo erro do `/login` (código, e-mail, senha, Google, GitHub) sai como toast de erro com o texto "Erro ao entrar: {code}"; o `<p role="alert">` abaixo do form sai.

## Arquivos
- `apps/blog/tanstack-start/`:
  - `package.json` (`rebun-sdk` 0.5.2, `sonner` 2.0.8)
  - `src/routes/__root.tsx` (`<Toaster>`)
  - `src/lib/posts.ts` (`getProviders`, `startOAuth` para Google e GitHub no lugar de `startGoogle`, `signInPassword`)
  - `src/routes/login.tsx` (loader, botões filtrados, passo de senha, erro/vazio; `router.invalidate()` após entrar para a navbar mostrar o usuário)
  - `src/lib/rebun.ts` (o `get` dos cookies enxerga o que foi setado na mesma requisição; o login com senha lê o PKCE que acabou de gravar)
- `e2e/mock-rebun.ts` (`/v1/project/me` com `providers`/`projectFail` no state, `github/start`, `password/sign-in` com a senha `senha123`, `__google` vira `__oauth`)
- `e2e/blog.spec.ts` (`launchOptions` do shader no topo do arquivo; testes de providers, GitHub, senha, erro e vazio; erros lidos no toast)

## Casos de borda
- Provider desconhecido na lista → ignorado.
- Senha errada → toast "Erro ao entrar: {code}" e o form de senha continua.
- `project.me()` falha → só a mensagem de erro, sem botões.

## Critérios de aceite
- [x] Dado só `otp` e `google` ativos, então vejo "Entrar com Google" e "Continuar com e-mail", e não vejo GitHub nem senha.
- [x] Dado `github` ativo, quando clico "Entrar com GitHub", então caio em `/admin` logado.
- [x] Dado `password` ativo, quando entro com e-mail e senha corretos, então caio em `/admin` logado; com senha errada vejo o toast "Erro ao entrar: {code}".
- [x] Dado `project.me()` com erro, então vejo o toast "Erro ao carregar: {code}" e nenhum botão.
- [x] Dado um código OTP errado, então o erro "Erro ao entrar: INVALID_CODE" aparece num toast no topo, centralizado.
- [x] Dado nenhum provider ativo, então vejo "Nenhum método de login ativo." e nenhum botão.
- [x] Dado os testes e2e de login existentes, então continuam passando.
