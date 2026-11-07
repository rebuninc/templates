# Spec: input-checkbox-base

## Relacionadas
- Continua: [015 — blog-checkbox](./015-blog-checkbox.md) — `Input`/`Textarea` adotam a base visual do `Checkbox`
- Altera: [004 — blog-login-split](./004-blog-login-split.md) — inputs e botões do login continuam pílula, agora com 48px

## Objetivo
Padronizar `Input` e `Textarea` (blog e link-in-bio, variantes `field` e `pill`) com a mesma base visual do `Checkbox`: borda, raio, foco, transição e estado desabilitado. O `Button` acompanha a altura dos inputs.

## Fora do escopo
- `CodeSlots` e o input de arquivo do `FileUpload`, porque têm visual próprio.
- Cores de fundo: `field` segue `bg-surface` e `pill` segue `bg-field`.

## Comportamento
1. Base comum: `border-2 border-fg/20`, transição de borda/ring com a mesma mola do checkbox (500ms, `cubic-bezier(0.34,1.8,0.64,1)`), sem transição com `prefers-reduced-motion`.
2. Foco: borda `fg` + `ring-4 ring-muted/50`.
3. Desabilitado: `opacity-40` e `cursor-not-allowed`.
4. Raio: nova token `--radius-field` (0.375rem, utilitário `rounded-field`) no `@theme` do `styles.css` de cada template; `Checkbox`, `field` e `Textarea` usam `rounded-field`. `pill` e `Button` continuam `rounded-full`.
5. Altura: o `Button` passa de `h-10` (40px) para `h-12` (48px), a mesma altura dos inputs.

## Casos de borda
- Input do login (`pill`) focado → mesmo ring do checkbox, formato pílula mantido.

## Critérios de aceite
- [x] Dado o checkbox "Publicado" e os campos `field`, então todos usam o mesmo raio (`--radius-field`, 6px).
- [x] Dado o form de post (blog) e o de link (link-in-bio), quando foco o primeiro campo, então ele tem borda de 2px e ring (box-shadow) visível.
- [x] Dado o login, quando foco o campo de e-mail, então ele tem borda de 2px e ring visível, e continua pílula.
- [x] Dado o login, quando abro o passo de e-mail, então o botão "Enviar código" tem a mesma altura do campo de e-mail (48px).
