import path from 'path';
import { FileSystem } from './fileSystem'
import { EdgeProxyBlock } from '@/types/types';

export interface SslCertMeta {
    label: string;
    path: string;
}

export namespace AppData {
    export const ROOT = 'data';
    export const CONFIG_FILE = path.join(ROOT, 'app-config.json');
    export const HTTP_PROXY_PATH = path.join(ROOT, 'httpProxies');
    export const SSL_PATH = path.join(ROOT, 'ssl');

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
    export async function GetSslListAsync(): Promise<SslCertMeta[]> {
        try {
            const labels = await FileSystem.ReadDirAsync(SSL_PATH);
            return labels.map(label => ({
                label,
                path: path.join(SSL_PATH, label),
            }));
        } catch {
            return [];
        }
    }

    export async function SaveSslAsync(label: string, cert: string, key: string): Promise<void> {
        const full_path = path.join(SSL_PATH, label)
        await FileSystem.MakeDirAsync(full_path, { recursive: true });
        await FileSystem.WriteFileAsync(path.join(full_path, 'cert'), cert);
        await FileSystem.WriteFileAsync(path.join(full_path, 'key'), key);
    }

    export async function DeleteSslAsync(label: string): Promise<void> {
        const full_path = path.join(SSL_PATH, label)
        await FileSystem.RemoveFileAsync(full_path, { force: true, recursive: true });
    }

    export async function ExistsSslAsync(label: string): Promise<boolean> {
        const full_path = path.join(SSL_PATH, label)
        return FileSystem.ExistsAsync(full_path);
    }

    export async function ReadSslAsync(label: string): Promise<{ cert: string; key: string }> {
        const full_path = path.join(SSL_PATH, label)
        const cert = await FileSystem.ReadFileAsync(path.join(full_path, 'cert'));
        const key = await FileSystem.ReadFileAsync(path.join(full_path, 'key'));
        return { cert, key };
    }
    //#endregion
}