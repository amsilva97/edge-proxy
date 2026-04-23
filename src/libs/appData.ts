import path from 'path';
import { FileSystem } from './fileSystem'
import { EdgeProxyBlock } from '@/types/types';
import { NotificationManager, ToastNotificationStatus } from '@/components/notifier';

export namespace AppData {
    const ROOT = 'data';
    const HTTP_PROXY_PATH = path.join(ROOT, 'httpProxies');
    const SSL_PATH = path.join(ROOT, 'ssl');

    //#region Https
    export async function GetHttpProxyListAsync(): Promise<string[]> {
        try {
            const files = await FileSystem.ReadDirAsync(HTTP_PROXY_PATH);
            const names = files.map((f: string) => f.endsWith('.json') ? f.slice(0, -5) : f);
            return [...new Set(names)];
        } catch {
            return [];
        }
    }

    export async function SaveHttpProxyAsync(proxy: string, data: EdgeProxyBlock[]): Promise<void> {
        await FileSystem.MakeDirAsync(HTTP_PROXY_PATH, { recursive: true });
        const full_path = path.join(HTTP_PROXY_PATH, `${proxy}.json`);
        await FileSystem.WriteFileAsync(full_path, JSON.stringify(data, null, 2));
    }

    export async function LoadHttpProxyAsync(proxy: string): Promise<EdgeProxyBlock[]> {
        const full_path = path.join(HTTP_PROXY_PATH, `${proxy}.json`);
        const raw = await FileSystem.ReadFileAsync(full_path);
        return JSON.parse(raw) as EdgeProxyBlock[];
    }

    export async function DeleteHttpProxyAsync(proxy: string): Promise<void> {
        await FileSystem.RemoveFileAsync(path.join(HTTP_PROXY_PATH, `${proxy}.json`), { force: true });
        await FileSystem.RemoveFileAsync(path.join(HTTP_PROXY_PATH, proxy), { force: true });
    }

    export async function ExistsHttpProxyAsync(proxy: string): Promise<boolean> {
        const full_path = path.join(HTTP_PROXY_PATH, `${proxy}.json`);
        return FileSystem.ExistsAsync(full_path);
    }
    //#endregion

    //#region SSL
    export interface SslMeta {
        label: string;
        isEnabled: boolean;
        usedBy: string; // a delimited seperated list
    }

    const sslMetaUsedByDelimiter = ';'

    const defaultSslMets: Omit<SslMeta, 'label'> = {
        isEnabled: false,
        usedBy: ''
    }

    export async function GetSslListAsync(): Promise<SslMeta[]> {
        try {
            const labels = await FileSystem.ReadDirAsync(SSL_PATH);
            return Promise.all(labels.map(async label => {
                return await GetSslMetaAsync(label)
            }));
        } catch {
            return [];
        }
    }

    export async function CreateSslAsync(label: string, cert: string, key: string): Promise<void> {
        const full_path = path.join(SSL_PATH, label)
        const exists = await ExistsSslAsync(label)
        if (exists) {
            NotificationManager.addToast(
                `${label} already exists.`,
                ToastNotificationStatus.Error
            )
            return
        }
        await FileSystem.MakeDirAsync(full_path, { recursive: true });
        await FileSystem.WriteFileAsync(path.join(full_path, 'cert'), cert);
        await FileSystem.WriteFileAsync(path.join(full_path, 'key'), key);
        const sslMeta: SslMeta = {
            label: label,
            ...defaultSslMets
        }
        await SaveSslMetaAsync(label, sslMeta);
    }

    export async function DeleteSslAsync(label: string): Promise<void> {
        const full_path = path.join(SSL_PATH, label)
        await FileSystem.RemoveFileAsync(full_path, { force: true, recursive: true });
    }

    export async function ExistsSslAsync(label: string): Promise<boolean> {
        const full_path = path.join(SSL_PATH, label)
        return FileSystem.ExistsAsync(full_path);
    }

    export async function GetSslCertKeyAsync(label: string): Promise<{ cert: string; key: string }> {
        const full_path = path.join(SSL_PATH, label)
        const cert = await FileSystem.ReadFileAsync(path.join(full_path, 'cert'));
        const key = await FileSystem.ReadFileAsync(path.join(full_path, 'key'));
        return { cert, key };
    }

    export async function UpdateSslCertKeyAsync(label: string, cert: string, key: string): Promise<void> {
        const full_path = path.join(SSL_PATH, label)
        const exists = await ExistsSslAsync(label)
        if (!exists) {
            NotificationManager.addToast(
                `${label} does not exists.`,
                ToastNotificationStatus.Error
            )
            return
        }
        await FileSystem.WriteFileAsync(path.join(full_path, 'cert'), cert);
        await FileSystem.WriteFileAsync(path.join(full_path, 'key'), key);
    }

    export async function GetSslMetaAsync(label: string): Promise<SslMeta> {
        const metaPath = path.join(SSL_PATH, label, 'meta.json');
        const raw = await FileSystem.TryReadFileAsync(metaPath);
        const meta = raw ? JSON.parse(raw) : {};
        return {
            label: label,
            ...defaultSslMets,
            ...meta
        }
    }

    export async function SaveSslMetaAsync(label: string, sslMeta: Partial<SslMeta>): Promise<void> {
        const metaPath = path.join(SSL_PATH, label, 'meta.json');
        const raw = await FileSystem.TryReadFileAsync(metaPath);
        const meta = raw ? JSON.parse(raw) : {};
        await FileSystem.WriteFileAsync(metaPath, JSON.stringify({
            label: label,
            ...defaultSslMets,
            ...meta,
            ...sslMeta
        }, null, 2));
    }
    //#endregion
}