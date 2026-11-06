# Spec: blog-login-split

## Relacionadas
- Continua: [003 — blog-linear-ui](./003-blog-linear-ui.md) — redesenha `/login` em duas colunas e esconde a navbar nessa rota
- Altera: [002 — blog](./002-blog.md) — o campo de e-mail passa a ficar atrás do botão "Continuar com e-mail"
- Alterada por: [005 — blog-login-providers](./005-blog-login-providers.md) — botões conforme providers ativos, GitHub, senha e erros em toast
- Alterada por: [010 — blog-otp-input](./010-blog-otp-input.md) — o campo "Código" vira 6 caixas e envia sozinho

## Objetivo
Deixar `/login` parecido com o login do Linear (botões grandes em pill, Google em destaque), dividido em duas colunas: à esquerda um texto sobre manchas de shader flutuando, à direita o form.

## Fora do escopo
- Novos métodos de login (SSO, passkey) ou "último método usado".
- Mudar `/callback`, server fns ou o passo do código.
- Logo ou marca do Linear.

## Comportamento
1. `/login` ocupa a tela toda e não mostra a navbar (`<header>` some só nessa rota).
2. Coluna esquerda (só a partir de `lg`; no celular/tablet some): um banner com cantos arredondados (24px), borda fina e margem de 12px em volta, com fundo do shader `FloatingShader` e, no canto inferior, o título "Escreva. Publique. Compartilhe." e a linha em cinza "Seus posts, suas ideias, num blog simples e rápido.".
3. `FloatingShader` (`src/components/floating-shader.tsx`, `aria-hidden`): WebGL próprio, 3–4 manchas roxas/azuis desfocadas flutuando devagar sobre o fundo `#08090A`. Com `prefers-reduced-motion` desenha um quadro parado. Sem WebGL mostra um gradiente CSS com as mesmas cores. O cleanup não chama `loseContext` (o StrictMode remonta o componente).
4. Coluna direita, centralizada, até 360px: título "Entrar no Blog" e os botões no mesmo estilo dos botões do blog (pill de 40px, `text-sm`, peso 510):
   - "Entrar com Google": principal (claro, texto escuro), ícone G à esquerda.
   - "Continuar com e-mail": secundário (borda `line`, hover com fundo de superfície).
5. Clicar "Continuar com e-mail" troca os botões pelo campo "E-mail" (pill, `required`, `type="email"`), "Enviar código" (pill claro) e o link-botão "Voltar", que volta para os dois botões.
6. Depois de enviar, o passo do código continua como na spec 002: texto "Enviamos um código para {email}.", campo "Código" e "Entrar", agora com o mesmo estilo em pill.
7. Erro continua "Erro ao entrar: {code}" (`role="alert"`) abaixo do form.

## Arquivos
- `apps/blog/tanstack-start/`:
  - `src/components/floating-shader.tsx` (novo)
  - `src/routes/login.tsx` (layout, passos `options` → `email` → `code`)
  - `src/routes/__root.tsx` (esconde a navbar em `/login`)
- `e2e/blog.spec.ts` (login clica "Continuar com e-mail"; teste das opções e do "Voltar" sem navbar; teste do shader com WebGL por software)

## Casos de borda
- Tela menor que `lg` → só a coluna do form, centralizada.
- Navegador sem WebGL → gradiente CSS no lugar do shader, página igual.
- `prefers-reduced-motion` → shader parado.
- Remontagem (StrictMode, HMR) → o shader volta a desenhar.

## Critérios de aceite
- [x] Dado `/login`, então não há navbar e vejo "Entrar no Blog", "Entrar com Google" e "Continuar com e-mail", sem campo de e-mail.
- [x] Dado `/login`, quando clico "Continuar com e-mail", então aparecem "E-mail", "Enviar código" e "Voltar"; quando clico "Voltar", voltam os dois botões.
- [x] Dado `/login`, quando sigo e-mail → código correto, então caio em `/admin` logado (fluxo da spec 002).
- [x] Dado tela larga, então a coluna esquerda mostra o texto e o shader desenhando (contexto WebGL não perdido); dado tela de celular, a coluna some.
- [x] Dado os testes e2e de código errado e e-mail sem conta, então continuam passando.
