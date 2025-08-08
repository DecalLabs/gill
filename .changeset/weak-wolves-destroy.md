---
"gill": minor
---

Simplifies transaction creation and sending by making existing abstractions more developer-friendly:

- `createTransaction` now defaults `version` to `"legacy"` when not specified
- `sendAndConfirmTransaction` now automatically fetches blockhash when missing
- `sendAndConfirmTransaction` now automatically estimates compute units when not set

This allows for simpler transaction sending:
```ts
await sendAndConfirmTransaction(createTransaction({
  feePayer: signer,
  instructions: [],
}));
```
