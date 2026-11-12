# Framework Parity Rules

Every framework folder of a template is the same app written in another framework. Only the framework glue may differ; the logic is the same.

## Must be identical

1. **`lib/rebun.ts` is byte-identical** across frameworks (`tanstack-start/src/lib/rebun.ts`, ...). Copy it, never edit just one.
2. **Data access:** same tables, same SDK calls, same filters, order and limits (e.g. `take(50)` everywhere).
3. **Input handling:** same fields, same normalization (`trim`, `String(...)`), same validation and same early returns.
4. **Error handling:** same cases, same thrown/displayed message (e.g. `` `${error.status} ${error.code}` ``, `Erro ao carregar: {code}`).
5. **UI:** same screens, routes, texts, labels, placeholders, HTML attributes (`required`, `maxLength`) and element order.
6. **Post-action behavior:** same result for the user (e.g. after sending, the list refreshes and the form is empty).

## May differ (framework glue only)

1. How the server runs (e.g. `createServerFn` + loaders in TanStack Start).
2. How data is refreshed (e.g. `router.invalidate()`).
3. File layout, routing files, config files (e.g. `vite.config.ts`) and framework-specific options.

If a difference is forced by the framework and is visible to the user, record it in the commit body and keep it as small as possible.

## Workflow

1. **A change to a template is applied to every framework folder in `apps/<template>/`, in the same change.** Never leave a framework for later.
2. **Acceptance criteria describe behavior once, for all frameworks** (see `rules/commits.md`).
3. **Before finishing, compare the frameworks side by side** (e.g. `diff <a>/lib/rebun.ts tanstack-start/src/lib/rebun.ts` and reading the equivalent route/page files) and check every item in "Must be identical".
4. **Adding a new framework** means porting the whole current behavior of the template — no partial ports.

## E2E parity tests

1. **Every template has `e2e/<template>.spec.ts`**; it runs against each framework folder in `apps/<template>/` (see `playwright.config.ts`).
2. **The ARIA snapshots in `e2e/__snapshots__/` are shared by all frameworks.** Never create a per-framework snapshot; if the UI changes, update the snapshot once and every framework must match it.
3. A UI or behavior change in a template updates its spec file in the same change, and `bun run test:e2e` must pass for every framework.
