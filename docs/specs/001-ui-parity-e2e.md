# Spec: ui-parity-e2e

## Objetivo
Garantir com testes E2E (Playwright) que cada template tem a mesma UI e o mesmo comportamento em todos os frameworks: os mesmos cenários rodam contra cada framework e comparam com o mesmo snapshot.

## Fora do escopo
- Rodar no pre-commit ou em CI (só manual, `bun run test:e2e`).
- Testar contra build de produção (roda contra o dev server).
- Erro da API ao enviar o recado: hoje o Next cai na página de erro e o TanStack Start ignora em silêncio; alinhar isso é outra spec.
- Estilo visual (screenshots).

## Comportamento
1. `bun run test:e2e` na raiz sobe, para cada framework listado em `apps/<template>/rebun.json`, um mock da API Rebun e o dev server do app apontando para ele (`REBUN_URL`), e roda `e2e/<template>.spec.ts` contra cada um (um project do Playwright por framework).
2. O mock (`e2e/mock-rebun.ts`) responde `GET`/`POST /v1/tables/:name/records` em memória e expõe `/__state` para o teste definir os registros, forçar erro na leitura e ler o que foi enviado.
3. A estrutura acessível do `<main>` é comparada com um ARIA snapshot **compartilhado entre os frameworks** (o caminho do snapshot não inclui o nome do project), então qualquer diferença de texto, papel ou ordem quebra o teste.
4. Atributos que não aparecem no ARIA snapshot (`required`, `maxLength`, `placeholder`) são verificados explicitamente.
5. Um template novo precisa de `e2e/<template>.spec.ts`; o config descobre templates e frameworks pelos `rebun.json`.
6. Antes da primeira execução: `bunx playwright install chromium`.

## Casos de borda
- Recado só com espaços → nada é enviado à API e o formulário fica vazio.
- `.env` da raiz com `REBUN_URL`/`REBUN_API_KEY` reais → os valores do teste prevalecem (`process.loadEnvFile` não sobrescreve env existente).

## Critérios de aceite
- [x] Dado o mock com 2 recados, quando abro `/` em cada framework, então o `<main>` bate com o mesmo ARIA snapshot (título, campos, botão e os 2 recados em ordem).
- [x] Dado o mock, quando abro `/`, então os campos têm `required`, `maxLength` 80/500 e os placeholders `Nome`/`Recado` em cada framework.
- [x] Dado o mock falhando a leitura com `BOOM`, quando abro `/`, então aparece o alerta `Erro ao carregar: BOOM` em cada framework.
- [x] Dado `/` aberto, quando envio `  Caio  ` / `  Bom dia  `, então a API recebe `{ author: "Caio", body: "Bom dia" }`, o recado aparece na lista e o formulário fica vazio em cada framework.
- [x] Dado `/` aberto, quando envio só espaços, então a API não recebe nada e o formulário fica vazio em cada framework.
- [x] Se eu mudar um texto da UI em só um framework, então `bun run test:e2e` falha.
