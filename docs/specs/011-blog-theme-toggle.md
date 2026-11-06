# Spec: blog-theme-toggle

## Relacionadas
- Altera: [003 — blog-linear-ui](./003-blog-linear-ui.md) — o tema escuro deixa de ser o único; entra um tema claro
- Altera: [004 — blog-login-split](./004-blog-login-split.md) — o shader do login ganha uma versão clara

## Objetivo
Adicionar um tema claro ao blog, seguindo o sistema por padrão, e um botão sol/lua que alterna entre claro e escuro revelando o novo tema num círculo que cresce a partir do botão.

## Fora do escopo
- Opção "sistema" explícita no botão (o padrão segue o sistema até o primeiro clique).
- Salvar a escolha no servidor ou na conta.
- Lib de tema (`next-themes` etc.) ou lib de animação para a transição.

## Comportamento
1. Os tokens de cor (`bg`, `surface`, `line`, `fg`, `muted`, `body` e os novos `field`/`field-line` dos campos) passam a ter duas versões, escolhidas por `data-theme="light|dark"` no `<html>`. Escuro = cores atuais. Claro: `bg #fafafa`, `surface #f5f5f6`, `line #e4e5e7`, `fg #08090a`, `muted #6b6f76`, `body #3c4149`, `field #f3f3f4`, `field-line #e4e5e7`. Nenhuma cor fixa fora dos tokens (ex.: cores do Code Slots e do `Input`).
2. Sem escolha salva, o tema segue `prefers-color-scheme` e acompanha se o sistema mudar com a página aberta.
3. Um script inline no `<head>` aplica o tema antes da primeira pintura (sem piscar o tema errado no SSR).
4. **Botão:** ícone redondo no header, antes de "Entrar"/"Meus posts", com `aria-label` "Ativar tema claro" ou "Ativar tema escuro" conforme o tema atual. Mostra lua no claro e sol no escuro. No `/login` (sem header) fica fixo no canto superior direito, fora do `<main>`.
5. Clicar alterna para o tema oposto e salva em `localStorage` (`theme`); a partir daí o sistema não manda mais.
6. **Animação:** via View Transitions API, o tema novo aparece num círculo (`clip-path: circle()`) que cresce do centro do botão até cobrir a tela inteira, 1000ms, ease-out. O tema antigo fica parado por baixo.
7. **Login:** o shader de seda tem uma versão clara (dobras claras e véu na cor do `bg` claro) e troca junto com o tema.
8. Os toasts (`sonner`) seguem o tema atual.

## Casos de borda
- Navegador sem View Transitions → troca na hora, sem animação.
- `prefers-reduced-motion: reduce` → troca na hora, sem círculo.
- Clicar de novo durante a animação → a transição atual é pulada e a nova começa do botão.
- `localStorage` indisponível → alterna na sessão, sem salvar, sem erro.

## Critérios de aceite
- [x] Dado o sistema em modo claro e nenhuma escolha salva, quando abro a home, então o `<html>` vem com `data-theme="light"` antes da hidratação.
- [x] Dado o sistema em modo escuro e nenhuma escolha salva, então o `<html>` tem `data-theme="dark"`.
- [x] Dado o tema escuro, quando clico em "Ativar tema claro", então o `<html>` passa a `data-theme="light"` e o botão vira "Ativar tema escuro".
- [x] Dado que escolhi o tema claro, quando recarrego com o sistema em escuro, então continua claro.
- [x] Dado o `/login`, então o botão de tema aparece e alterna o tema.
- [x] Dado reduce motion, quando clico no botão, então o tema troca sem view transition.
- [x] Os fluxos e snapshots ARIA existentes continuam passando sem mudança (os snapshots cobrem só o `<main>`).

## Arquivos
- `apps/blog/tanstack-start/`:
  - `src/styles.css` (tokens por `data-theme`, pseudo-elementos da view transition)
  - `src/lib/theme.ts` (novo: script inline, ler/salvar/alternar com view transition)
  - `src/components/theme-toggle.tsx` (novo: botão sol/lua)
  - `src/routes/__root.tsx` (script no `<head>`, botão no header, `Toaster` com o tema)
  - `src/routes/login.tsx` (botão fixo, cores do Code Slots pelos tokens)
  - `src/components/ui/input.tsx` (campo pill pelos tokens `field`)
  - `src/components/night-silk.tsx` (versão clara do shader e do véu)
- `e2e/blog.spec.ts` (testes do tema: sistema, alternar e salvar, login, view transition com e sem reduce motion)
