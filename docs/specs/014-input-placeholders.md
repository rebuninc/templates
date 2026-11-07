# Spec: input-placeholders

## Relacionadas
- Altera: [002 — blog](./002-blog.md) — título e conteúdo do post ganham placeholder
- Altera: [012 — link-in-bio](./012-link-in-bio.md) — título do link, nome e bio do perfil ganham placeholder

## Objetivo
Todo campo de texto dos templates precisa ter placeholder. O `Input`/`Textarea` de `ui/input.tsx` passa a exigir `placeholder` no tipo, e os campos que estão sem ele recebem um.

## Fora do escopo
- Campos `file`, `checkbox`, `radio` e `hidden`, porque neles o HTML ignora placeholder.
- O input interno do `CodeSlots`.
- Mudar os placeholders que já existem.

## Comportamento
1. `Input` (blog e link-in-bio, arquivo igual nos dois) exige `placeholder: string`, exceto quando `type="file"`; `Textarea` sempre exige.
2. Placeholders novos:
   - Blog, formulário de post: Título → "Digite o título", Conteúdo → "Digite o conteúdo".
   - Link-in-bio, formulário de link: Título → "Digite o título".
   - Link-in-bio, formulário de perfil: Nome → "Digite seu nome", Bio → "Digite sua bio".

## Casos de borda
- `Input` com `type="file"` → compila sem placeholder.
- `Input` ou `Textarea` de texto sem placeholder → o typecheck falha.

## Critérios de aceite
- [x] Dado o formulário de post do blog, então Título e Conteúdo mostram "Digite o título" e "Digite o conteúdo".
- [x] Dado o formulário de link do link-in-bio, então Título mostra "Digite o título".
- [x] Dado o formulário de perfil do link-in-bio, então Nome e Bio mostram "Digite seu nome" e "Digite sua bio".
- [x] Dado um `Input` de texto ou `Textarea` sem `placeholder`, então o código não compila.
