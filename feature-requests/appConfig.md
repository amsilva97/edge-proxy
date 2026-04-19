---
Date: 2026-04-18
Type: error-resolution
File: src/libs/appConfig.ts
Reason: LoadAsync throws when app-config.json does not exist (e.g. on first run), instead of falling back to the default config already defined in appConfigData.
---

`AppConfig.LoadAsync` calls `FileSystem.ReadFileAsync(configPath)` with no error handling. If `/data/app-config.json` is absent, `ReadFileAsync` throws `Error: Error reading file '/data/app-config.json'`, which propagates through every action that calls `AppConfig.LoadAsync` (e.g. `EnableAsync`, `DisableAsync`, `GenerateNginxConfigAsync`).

A default config is already defined (`appConfigData`), so the fix is simply to catch the read error and return the default when the file is missing:

```diff
 export async function LoadAsync(): Promise<EdgeProxySettings> {
-    const data = await FileSystem.ReadFileAsync(configPath);
-    const config = JSON.parse(data) as EdgeProxySettings;
-    return { ...appConfigData, ...config };
+    try {
+        const data = await FileSystem.ReadFileAsync(configPath);
+        const config = JSON.parse(data) as EdgeProxySettings;
+        return { ...appConfigData, ...config };
+    } catch {
+        return { ...appConfigData };
+    }
 }
```
