# Code Style Rules

1. **When you need the result of an `await`, store it in a `const` first.** Never use an awaited value inline in a ternary, condition, object literal, argument, or property access (e.g. `(await f()) ? a : b`, `{ value: await sign() }`, `expect(await g())`, `(await h()).status`).

```ts
const sent = await accountService.requestMagicLink(body.email)
return sent ? status(204) : status(502)
```
