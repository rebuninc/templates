# Spec: blog-signup-toggle

## Relacionadas
- Altera: [005 — blog-login-providers](./005-blog-login-providers.md) — `/login` ganha o modo "Criar conta" quando a chave tem `auth:signup`
- Alterada por: [016 — login-mode-pill-motion](./016-login-mode-pill-motion.md) — o fundo da pill desliza na troca

## Objetivo
Atualizar o `rebun-sdk` para 0.5.3 e usar as `permissions` de `project.me()` para mostrar, acima das opções de `/login`, uma pill "Entrar | Criar conta" quando a chave tem `auth:signup`. No modo "Criar conta" os fluxos são os mesmos; só mudam os textos, e a senha usa `signUp`/`verifySignUp`.

## Fora do escopo
- "Esqueci a senha" (`resetPassword`/`confirmReset`).
- Telas ou campos novos no cadastro (nome, avatar, termos).
- Mudar `/callback`.

## Comportamento
1. `rebun-sdk` fica em `0.5.3` (exato). O loader de `/login` devolve `{ providers, signUp, error }`, com `signUp = permissions.includes("auth:signup")`.
2. Com `signUp`, a tela inicial mostra acima dos botões uma pill com duas opções, "Entrar" e "Criar conta" (`role="radiogroup"`, cada uma `role="radio"`). "Entrar" vem marcada. Sem `signUp`, a pill não aparece e a tela fica como na spec 005.
3. A pill só aparece na tela inicial. O modo escolhido vale para os passos seguintes (e-mail, código, senha), e "Voltar" retorna à tela inicial mantendo o modo.
4. No modo "Criar conta", os textos mudam:
   - Título: "Criar conta no {APP_NAME}".
   - "Entrar com Google" → "Cadastrar com Google"; "Entrar com GitHub" → "Cadastrar com GitHub".
   - "Continuar com e-mail" e "Continuar com senha" ficam iguais.
   - O botão de enviar dos passos de código e de senha: "Entrar" → "Criar conta".
   - Senha: `autoComplete="new-password"`.
5. Google, GitHub e e-mail (OTP) chamam as mesmas funções nos dois modos, porque o primeiro login já cria a conta quando a chave tem `auth:signup`.
6. Senha no modo "Criar conta": "Criar conta" chama `auth.signUp({ email, password, redirectUri })`, e a tela vira o passo de código ("Enviamos um código para {email}."). "Criar conta" nesse passo chama `auth.verifySignUp({ email, code })`; se der certo, vai para `/admin`.
7. Erros nos dois modos: toast "Erro ao entrar: {code}", como na spec 005.

## Arquivos
- `apps/blog/tanstack-start/`:
  - `package.json` (`rebun-sdk` 0.5.3)
  - `src/lib/posts.ts` (`getProviders` devolve `signUp`; `signUpPassword` e `verifySignUp` novos)
  - `src/routes/login.tsx` (pill, modo, textos, cadastro por senha → código)
- `e2e/mock-rebun.ts` (`permissions` no state e em `/v1/project/me`; `/v1/auth/password/sign-up` e `/v1/auth/password/sign-up/verify`)
- `e2e/blog.spec.ts` (testes da pill, dos textos e do cadastro por senha)

## Casos de borda
- Chave sem `auth:signup` → sem pill, só login.
- `project.me()` falha → sem pill e sem botões, toast "Erro ao carregar: {code}".
- Nenhum provider ativo com `auth:signup` → sem pill, "Nenhum método de login ativo.".
- E-mail já cadastrado no cadastro por senha → toast "Erro ao entrar: {code}" e o form de senha continua.

## Critérios de aceite
- [x] Dado a chave sem `auth:signup`, então `/login` não mostra a pill "Entrar | Criar conta".
- [x] Dado a chave com `auth:signup`, quando marco "Criar conta", então vejo "Criar conta no Blog", "Cadastrar com Google" e "Cadastrar com GitHub".
- [x] Dado o modo "Criar conta", quando clico "Continuar com senha" e depois "Voltar", então o modo "Criar conta" continua marcado.
- [x] Dado o modo "Criar conta" com `password` ativo, quando informo e-mail e senha e depois o código correto, então caio em `/admin` logado.
- [x] Dado o modo "Criar conta", quando cadastro um e-mail que já existe, então vejo o toast "Erro ao entrar: {code}".
- [x] Dado os testes e2e de login existentes, então continuam passando.
