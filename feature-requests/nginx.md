---
Date: 2026-04-18
Type: code-change
File: src/libs/nginx.ts
Reason: nginx.ts imports from @/components/notifier (a Client Component using useEffect/useState). This causes a build error because server-side code cannot import Client Components. The fix is to remove all notifier imports and have reloadAsync return a result object instead, so the calling client code can show toasts.
---

--- a/src/libs/nginx.ts
+++ b/src/libs/nginx.ts
@@ -1,7 +1,5 @@
 import { AppConfig } from './appConfig';
 import { promisify } from 'util';
 import { exec } from 'child_process';
-import { NotificationManager, ToastNotification, ToastNotificationStatus } from '@/components/notifier';
 
 const execAsync = promisify(exec);
 
@@ -9,18 +7,12 @@ const execAsync = promisify(exec);
 export class Nginx {
     private constructor() { }
 
-    public static async reloadAsync(): Promise<void> {
+    public static async reloadAsync(): Promise<{ ok: boolean; message: string }> {
         const command = 'nginx -s reload';
         try {
             await execAsync(command);
-            NotificationManager.addToast(
-                new ToastNotification(
-                    'Nginx reloaded successfully',
-                    ToastNotificationStatus.Success
-                )
-            );
+            return { ok: true, message: 'Nginx reloaded successfully' };
         }
         catch (error) {
-            NotificationManager.addToast(
-                new ToastNotification(
-                    `Failed to reload Nginx: ${error instanceof Error ? error.message : String(error)}`,
-                    ToastNotificationStatus.Error
-                )
-            )
+            return { ok: false, message: `Failed to reload Nginx: ${error instanceof Error ? error.message : String(error)}` };
         }
     }
 }
