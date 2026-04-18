'use client';
import * as NginxActions from './nginx.actions';
import { NotificationManager, ToastNotification, ToastNotificationStatus } from '@/components/notifier';

export namespace Nginx {
    export async function ReloadAsync(): Promise<void> {
        const command = 'nginx -s reload';
        try {
            await NginxActions.ReloadAsync();
        }
        catch (error) {
            NotificationManager.addToast(
                new ToastNotification(
                    `Failed to reload Nginx: ${error instanceof Error ? error.message : String(error)}`,
                    ToastNotificationStatus.Error
                )
            )
        }
    }
}