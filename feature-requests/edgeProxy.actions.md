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

---
Date: 2026-04-24
Type: code-change
File: src/libs/edgeProxy.actions.ts
Reason: FindSslCertKeys has a broken skeleton — for...in over an array iterates indices, not values, and never populates sslSet. Needs to walk the block tree the same way BuildNginxConfig does.
---

```diff
 function FindSslCertKeys(httpHost: HttpHost): string[] {
     const sslSet: Set<string> = new Set()
-    function _(edgeBlockDataList: EdgeBlockData[]) {
-        for (const edgeBlockData in edgeBlockDataList) {
-            const key = edgeBlockData
+    function walk(blocks: EdgeBlockData[]) {
+        for (const block of blocks) {
+            const [name, ...rest] = block;
+            const directive = EdgeDirectives.find(d => d.key === name);
+            if (!directive) continue;
+            const nonCtxParams = directive.params.filter(p => p.primitive !== 'context');
+            const hasContext = directive.params.some(p => p.primitive === 'context');
+            nonCtxParams.forEach((param, i) => {
+                if (param.primitive === 'ssl' && rest[i]) sslSet.add(String(rest[i]));
+            });
+            if (hasContext) {
+                const children = (rest[nonCtxParams.length] ?? []) as EdgeBlockData[];
+                walk(children);
+            }
         }
     }
-    _(httpHost)
+    walk(httpHost)
     return [...sslSet]
 }

---
Date: 2026-04-24
Type: code-change
File: src/libs/edgeProxy.actions.ts
Reason: Creating a new host throws ENOENT because SaveHttpHostMetaAsync calls GetHttpHostMetaAsync to read existing meta before the file exists. GetHttpHostMetaListAsync and GetSslCertKeyListAsync also throw if their data directories don't exist yet.
---

```diff
+export async function GetHttpHostMetaAsync(httpHostName: string): Promise<HttpHostMeta> {
+    try {
         const httpHostMetaPath: string = path.join(DataPaths.HttpHost, `${httpHostName}.meta`);
         const httpHostMetaContent: string = await fs.readFile(httpHostMetaPath, 'utf8');
         const httpHostMeta: HttpHostMeta = JSON.parse(httpHostMetaContent);
         return httpHostMeta;
+    } catch {
+        return {} as HttpHostMeta;
+    }
 }

 export async function GetHttpHostMetaListAsync(): Promise<HttpHostMeta[]> {
+    try {
         return await Promise.all(
             (await fs.readdir(DataPaths.HttpHost))
                 .filter((f: string) => f.endsWith('.json'))
                 .map((f: string) => GetHttpHostMetaAsync(f.slice(0, -5)))
         );
+    } catch {
+        return [];
+    }
 }

 export async function GetSslCertKeyListAsync(): Promise<SslCertKeyMeta[]> {
+    try {
         return await Promise.all(
             (await fs.readdir(DataPaths.SslCertKey))
                 .filter((f: string) => f.endsWith('.json'))
                 .map((f: string) => GetSslCertKeyMetaAsync(f.slice(0, -5)))
         );
+    } catch {
+        return [];
+    }
 }
```
