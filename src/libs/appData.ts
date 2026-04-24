import path from 'path';
import { FileSystem } from './fileSystem'
import { HttpHost, EdgeProxyHost, HttpHostMeta, HttpProxyType } from '@/types/types';
import { EdgeBlockData } from '@/libs/edgeDirective';
import { NotificationManager, ToastNotificationStatus } from '@/components/notifier';

/** @deprecated I want to mnove all of this to edgeData */
export namespace AppData {
    const ROOT = 'data';
    const HTTP_PROXY_PATH = path.join(ROOT, 'httpProxies');
    const SSL_PATH = path.join(ROOT, 'ssl');

    //#region Https
    const defaultHttpProxyMeta: Omit<HttpHostMeta, 'label'> = {
        isEnabled: false,
        type: HttpProxyType.Advanced
    }

    export async function GetHttpProxyListAsync(): Promise<HttpHostMeta[]> {
        try {
            const files = await FileSystem.ReadDirAsync(HTTP_PROXY_PATH);
            const labels = files
                .filter((f: string) => f.endsWith('.json'))
                .map((f: string) => f.slice(0, -5));
            return Promise.all(labels.map(async label => {
                return await GetHttpProxyMetaAsync(label);
            }));
        } catch {
            return [];
        }
    }

    export async function CreateHttpProxyAsync(proxy: string, block: HttpHost): Promise<void> {
        const exists = await ExistsHttpProxyAsync(proxy);
        if (exists) {
            NotificationManager.addToast(
                `${proxy} already exists.`,
                ToastNotificationStatus.Error
            );
            return;
        }
        await FileSystem.MakeDirAsync(HTTP_PROXY_PATH, { recursive: true });
        const full_path = path.join(HTTP_PROXY_PATH, `${proxy}.json`);
        const file: EdgeProxyHost = {
            meta: {
                label: proxy, ...defaultHttpProxyMeta
            },
            block
        };
        await FileSystem.WriteFileAsync(full_path, JSON.stringify(file, null, 2));
    }

    export async function SaveHttpProxyAsync(proxy: string, block: HttpHost): Promise<void> {
        const full_path = path.join(HTTP_PROXY_PATH, `${proxy}.json`);
        const raw = await FileSystem.TryReadFileAsync(full_path);
        const existing: EdgeProxyHost = raw ? JSON.parse(raw) : {
            meta: {
                label: proxy,
                ...defaultHttpProxyMeta
            },
            block
        };
        await FileSystem.WriteFileAsync(full_path, JSON.stringify({ ...existing, block }, null, 2));
    }

    export async function LoadHttpProxyAsync(proxy: string): Promise<HttpHost> {
        const full_path = path.join(HTTP_PROXY_PATH, `${proxy}.json`);
        const raw = await FileSystem.ReadFileAsync(full_path);
        return (JSON.parse(raw) as EdgeProxyHost).block;
    }

    export async function DeleteHttpProxyAsync(proxy: string): Promise<void> {
        await FileSystem.RemoveFileAsync(path.join(HTTP_PROXY_PATH, `${proxy}.json`), { force: true });
    }

    export async function ExistsHttpProxyAsync(proxy: string): Promise<boolean> {
        return FileSystem.ExistsAsync(path.join(HTTP_PROXY_PATH, `${proxy}.json`));
    }

    export async function GetHttpProxyMetaAsync(label: string): Promise<HttpHostMeta> {
        const full_path = path.join(HTTP_PROXY_PATH, `${label}.json`);
        const raw = await FileSystem.TryReadFileAsync(full_path);
        const file: Partial<EdgeProxyHost> = raw ? JSON.parse(raw) : {};
        return {
            label,
            ...defaultHttpProxyMeta,
            ...file.meta
        };
    }

    export async function SaveHttpProxyMetaAsync(label: string, meta: Partial<HttpHostMeta>): Promise<void> {
        const full_path = path.join(HTTP_PROXY_PATH, `${label}.json`);
        const raw = await FileSystem.TryReadFileAsync(full_path);
        const existing: Partial<EdgeProxyHost> = raw ? JSON.parse(raw) : {
            meta: {
                label,
                ...defaultHttpProxyMeta
            }
        };
        const file: Partial<EdgeProxyHost> = {
            ...existing,
            meta: {
                label,
                ...defaultHttpProxyMeta,
                ...existing.meta,
                ...meta
            }
        };
        await FileSystem.WriteFileAsync(full_path, JSON.stringify(file, null, 2));
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

    export async function UpdateSslUsedByAsync(proxy: string, data: EdgeBlockData[]): Promise<void> {
        function collectSslLabels(blocks: EdgeBlockData[]): string[] {
            const labels: string[] = [];
            for (const block of blocks) {
                const [key, ...rest] = block as [string, ...unknown[]];
                if (key === 'ssl_certificate' || key === 'ssl_certificate_key') {
                    if (typeof rest[0] === 'string' && rest[0]) labels.push(rest[0]);
                }
                const last = rest[rest.length - 1];
                if (Array.isArray(last) && last.length > 0 && Array.isArray(last[0])) {
                    labels.push(...collectSslLabels(last as EdgeBlockData[]));
                }
            }
            return labels;
        }

        const activeLabels = new Set(collectSslLabels(data));
        const allCerts = await GetSslListAsync();
        for (const cert of allCerts) {
            const usedBy = new Set(cert.usedBy ? cert.usedBy.split(sslMetaUsedByDelimiter) : []);
            const wasUsed = usedBy.has(proxy);
            const isUsed = activeLabels.has(cert.label);
            if (wasUsed === isUsed) continue;
            if (isUsed) usedBy.add(proxy);
            else usedBy.delete(proxy);
            await SaveSslMetaAsync(cert.label, { ...cert, usedBy: [...usedBy].join(sslMetaUsedByDelimiter) });
        }
    }

    export async function RemoveSslUsedByAsync(proxy: string): Promise<void> {
        await UpdateSslUsedByAsync(proxy, []);
    }
    //#endregion
}