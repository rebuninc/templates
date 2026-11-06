# Spec: blog-favicon

## Objetivo
Usar no blog o mesmo favicon do `core/apps/web` (logo Rebun).

## Fora do escopo
- Ícones de PWA/manifest e `apple-touch-icon`.

## Comportamento
1. `public/icon.svg` e `public/favicon.ico` são cópias dos arquivos de `core/apps/web/public/`.
2. O `<head>` de todas as páginas tem `<link rel="icon" href="/favicon.ico" sizes="32x32">` e `<link rel="icon" href="/icon.svg" type="image/svg+xml">`; navegadores com suporte a SVG usam o SVG, que troca a cor do traço no modo escuro.

## Casos de borda
- Navegador sem suporte a favicon SVG → usa o `favicon.ico`.

## Critérios de aceite
- [x] Dado qualquer página, então o `<head>` tem os dois `<link rel="icon">` e `/icon.svg` e `/favicon.ico` respondem 200.

## Arquivos
- `apps/blog/tanstack-start/`:
  - `public/icon.svg`, `public/favicon.ico` (novos)
  - `src/routes/__root.tsx` (links no `head`)
- `e2e/blog.spec.ts` (teste do favicon)
