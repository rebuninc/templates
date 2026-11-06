# Spec: blog-otp-input

## Relacionadas
- Altera: [004 — blog-login-split](./004-blog-login-split.md) — o campo "Código" vira 6 caixas e envia sozinho

## Objetivo
Trocar o campo "Código" do `/login` (OTP e cadastro com senha) pelo [Code Slots do React Bits](https://reactbits.dev/micro/code-slots) (TS + Tailwind, MIT + Commons Clause), que envia o form sozinho ao completar.

## Fora do escopo
- Reenviar código, contador de tempo.
- Mudar o passo de e-mail ou de senha.
- Instalar via CLI (`shadcn`/`jsrepo`): o arquivo é copiado à mão; `motion` e `@hugeicons` já estão no app.

## Comportamento
1. O Code Slots é copiado para `src/components/ui/code-slots.tsx` sem mudar a lógica, só com as cores do tema (`fg`, `surface`, `bg`) e o `ariaLabel="Código"`.
2. No passo do código aparecem 6 caixas com foco automático; só dígitos entram (digitar, colar ou autofill `one-time-code`).
3. Ao completar o 6º dígito, o código é enviado sozinho. O botão "Entrar"/"Criar conta" continua e envia o que foi digitado; com menos de 6 dígitos ele não faz nada.
4. Código errado → toast "Erro ao entrar: {code}" (como hoje), as caixas ficam vermelhas, esvaziam e voltam ao início.
5. Código certo → `/admin` (como hoje).

## Arquivos
- `apps/blog/tanstack-start/`:
  - `src/components/ui/code-slots.tsx` (novo, copiado do React Bits)
  - `src/routes/login.tsx` (usa o `CodeSlots` no form do código; `status` vira `error` na falha)
- `e2e/blog.spec.ts` (campo achado por `getByLabel("Código")`; sem clique no botão depois de completar; testes de auto-envio e campo limpo após erro)

## Casos de borda
- Colar "123 456" ou "12-34-56" → vira "123456" e envia.
- Colar mais de 6 dígitos → fica com os 6 primeiros.
- Envio em andamento (`busy`) → não dispara outro envio.

## Critérios de aceite
- [x] Dado o passo do código, então vejo 6 caixas e o foco já está no campo.
- [x] Dado o passo do código, quando digito "123456", então o form envia sozinho e caio em `/admin`.
- [x] Dado o passo do código, quando digito "1a2-3", então ficam 3 dígitos e nada é enviado.
- [x] Dado um código errado, então vejo o toast "Erro ao entrar: INVALID_CODE" e as caixas ficam vazias.
- [x] Dado o cadastro com senha, quando completo o código, então a conta é criada e caio em `/admin`.
- [x] Dado os testes e2e de login existentes, então continuam passando.
