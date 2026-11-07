# Spec: button-loading

## Objetivo
O `Button` (blog e link-in-bio) ganha a prop `loading?: boolean`: quando `true`, o conteúdo dá lugar a um spinner sem mudar o tamanho do botão. Os submits de formulário passam a usá-la enquanto a ação roda.

## Fora do escopo
- Botões de OAuth (Google/GitHub), porque compartilham o mesmo `busy` e girariam juntos.
- Botões que não são `Button` (paginação, mover link).

## Comportamento
1. `loading` deixa o conteúdo transparente (`opacity-0`: continua no layout e no nome acessível, então largura e altura não mudam) e mostra um spinner centralizado por cima.
2. `loading` também desabilita o botão e marca `aria-busy="true"`.
3. O spinner é CSS puro (borda + `animate-spin`) na cor do texto do variant; com `prefers-reduced-motion` ele não gira.
4. Os submits passam `loading={busy}`: login (código, e-mail, senha), post-form (blog), link-form e profile-form (link-in-bio).

## Casos de borda
- `loading={false}` → botão igual ao de hoje.
- `disabled` sem `loading` → só desabilitado, sem spinner.

## Critérios de aceite
- [x] Dado um submit com o servidor lento, quando envio, então o botão fica com `aria-busy="true"`, desabilitado, com o spinner, e mantém o mesmo tamanho.
- [x] Dado que a ação termina, quando o servidor responde, então o botão volta ao texto original.
