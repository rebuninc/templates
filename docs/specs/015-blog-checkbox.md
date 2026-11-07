# Spec: blog-checkbox

## Relacionadas
- Altera: [002 — blog](./002-blog.md) — o checkbox "Publicado" usa o `Checkbox` do core

## Objetivo
Trazer o `Checkbox` do core (`apps/web/src/components/ui/checkbox.tsx`, Base UI + ícone com animação de mola) para o blog e usá-lo no "Publicado" do form de post, no lugar do `<input type="checkbox">` nativo.

## Fora do escopo
- Link-in-bio, porque não tem checkbox.
- Estado `indeterminate`, porque nenhum campo usa.

## Comportamento
1. Novo `components/ui/checkbox.tsx` no blog, mesma estrutura e animação do core (`@base-ui/react` + `Tick02Icon`), com as cores trocadas pelos tokens do template (`fg`, `bg`, `line`).
2. O form de post usa `<Checkbox name="published" defaultChecked={...} />` dentro da label "Publicado".
3. Envio igual ao de hoje: marcado → `published: true`; desmarcado → `published: false`.

## Casos de borda
- Editar um post publicado → o checkbox abre marcado.

## Critérios de aceite
- [x] Dado o form de novo post, quando marco "Publicado" e salvo, então o post é criado com `published: "true"`.
- [x] Dado um post publicado, quando abro a edição, então "Publicado" aparece marcado.
