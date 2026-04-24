// import { NotificationManager, ToastNotification, ToastNotificationStatus } from '@/components/notifier';
import { FileSystem } from './fileSystem';

const ENV_LOCAL = '.env.local';
const ENV_DEFAULT = '.env';

export class AppEnv {
    static get nginxBasePath(): string {
        return process.env.NEXT_PUBLIC_NGINX_PATH ?? '/etc/nginx';
    }

    static async LoadEnvAsync(): Promise<Record<string, string>> {
        // let toast: ToastNotification | null = null;
        let result: Record<string, string> = {};
        try {
            const contentLocal = await FileSystem.TryReadFileAsync(ENV_LOCAL);
            if (contentLocal) return AppEnv.parseEnvFile(contentLocal);
            const contentDefault = await FileSystem.TryReadFileAsync(ENV_DEFAULT);
            if (contentDefault) {
                // toast = new ToastNotification('No .env.local found — loaded default configuration.', ToastNotificationStatus.Warning);
                result = AppEnv.parseEnvFile(contentDefault);
            } else {
                // toast = new ToastNotification('No environment config found.', ToastNotificationStatus.Error);
            }
        } catch (error: any) {
            // toast = new ToastNotification(error?.message ?? 'Failed to load environment config.', ToastNotificationStatus.Error);
        }
        // if (toast) NotificationManager.addToast(toast);
        return result;
    }

    static async SaveEnvAsync(dict: Record<string, string>): Promise<void> {
        const lines = Object.entries(dict).map(([k, v]) => `${k}=${v}`).join('\n') + '\n';
        await FileSystem.WriteFileAsync(ENV_LOCAL, lines);
    }

    private static parseEnvFile(content: string): Record<string, string> {
        const out: Record<string, string> = {};
        for (const raw of content.split('\n')) {
            const line = raw.replace(/#.*$/, '').trim();
            if (!line) continue;
            const i = line.indexOf('=');
            if (i === -1) continue;
            out[line.slice(0, i).trim()] = line.slice(i + 1).trim();
        }
        return out;
    }
}
