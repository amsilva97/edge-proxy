---
Date: 2026-04-23
Type: feature-request
File: src/libs/edgeProxy.actions.ts
Reason: saveConfig and deleteProxy in src/app/proxies/[proxy]/scripts.ts need to track which proxies reference which SSL certs (the usedBy field on SslCertKeyMeta), but there are no exported functions to update this relationship.
---

Export two async functions for managing the SSL `usedBy` relationship:

**1. `UpdateHttpHostSslUsedByAsync(httpHostName: string, blocks: EdgeBlockData[]): Promise<void>`**

Scans `blocks` for any directive that references an SSL cert label (i.e. directives whose param has `primitive: 'ssl'`), collects the unique cert labels found, then for each `SslCertKeyMeta` in `data/ssl/`:
- If the cert label is in the found set, ensures `httpHostName` is in its `usedBy` array.
- If the cert label is not in the found set, removes `httpHostName` from its `usedBy` array (if present).

Call this after `SaveHttpHostAsync` in `saveConfig` and after `EnableHttpHostAsync` in `enableProxy`.

Example input:
- `httpHostName`: `'my-proxy'`
- `blocks`: an `EdgeBlockData[]` that references `ssl_certificate 'my-cert'`

Expected result: `data/ssl/my-cert.meta` has `usedBy` containing `'my-proxy'`; all other cert metas have `'my-proxy'` removed from their `usedBy`.

---

**2. `RemoveHttpHostSslUsedByAsync(httpHostName: string): Promise<void>`**

Removes `httpHostName` from the `usedBy` array of every `SslCertKeyMeta` in `data/ssl/`.

Call this before or inside `DeleteHttpHostAsync` (it should also be called by `disableProxy` if SSL access should be revoked on disable).

Example input:
- `httpHostName`: `'my-proxy'`

Expected result: no cert meta in `data/ssl/` has `'my-proxy'` in its `usedBy` array.
