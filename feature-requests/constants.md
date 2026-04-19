---
Date: 2026-04-18
Type: error-resolution
File: src/libs/constants.ts
Reason: DATA_DIR uses process.cwd() which returns '/' in some environments (Docker, Edge), producing /data instead of the intended project-relative path.
---

`process.cwd()` is unreliable as a project root anchor — it returns `/` in containerised or Edge environments, making `DATA_DIR` resolve to `/data` (a non-existent directory) instead of the project data folder.

**Root cause:** `process.cwd()` evaluates at module initialisation time (when Next.js/Turbopack sets up the worker, cwd = `/`), but `fs` calls with relative paths resolve cwd at *execution* time (when it is `/repo/edge-proxy`). So baking `process.cwd()` into a module-level constant captures the wrong value.

**Fix (confirmed working):** Drop `process.cwd()` and use a bare relative path:

```diff
 import path from 'path';

-export const DATA_DIR = path.join(process.cwd(), 'data');
+export const DATA_DIR = path.join('data');
 export const PROXIES_DIR = path.join(DATA_DIR, 'proxies');
```

`fs.readFile('data/app-config.json')` then resolves against the correct cwd at call time.
