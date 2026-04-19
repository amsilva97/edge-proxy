'use client';
import * as NginxActions from './nginx.actions';
import { NotificationManager, ToastNotificationStatus } from '@/components/notifier';

export namespace Nginx {
    export async function ReloadAsync(): Promise<void> {
        const command = 'nginx -s reload';
        try {
            await NginxActions.ReloadAction();
        }
        catch (error: any) {
            NotificationManager.addToast(error.message, ToastNotificationStatus.Error);
        }
    }
}