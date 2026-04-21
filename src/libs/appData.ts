import path from 'path';
import { FileSystem } from './fileSystem'
import { EdgeProxyBlock } from '@/types/types';

export namespace AppData {
    export const ROOT = 'data';
    export const CONFIG_FILE = path.join(ROOT, 'app-config.json');
    export const HTTP_PROXY_PATH = path.join(ROOT, 'httpProxies');
    export const SSL_PATH = path.join(ROOT, 'ssl');

    export async function GetHttpProxyListAsync(): Promise<string[]> {
        try {
            const files = await FileSystem.ReadDirAsync(HTTP_PROXY_PATH);
            return files
                .filter((f: string) => f.endsWith('.json'))
                .map((f: string) => f.slice(0, -5));
        } catch {
            return [];
        }
    }

    export async function SaveHttpProxyAsync(proxy: string, data: EdgeProxyBlock[]): Promise<void> {
        const full_path = path.join(HTTP_PROXY_PATH, proxy);
        await FileSystem.WriteFileAsync(full_path, JSON.stringify(data, null, 2));
    }

    export async function LoadHttpProxyAsync(proxy: string): Promise<EdgeProxyBlock[]> {
        const full_path = path.join(HTTP_PROXY_PATH, proxy);
        const raw = await FileSystem.ReadFileAsync(full_path);
        return JSON.parse(raw) as EdgeProxyBlock[];
    }

    export async function DeleteHttpProxyAsync(proxy: string): Promise<void> {
        const full_path = path.join(HTTP_PROXY_PATH, proxy);
        await FileSystem.RemoveFileAsync(full_path, { force: true });
    }

    export async function ExistsHttpProxyAsync(proxy: string): Promise<boolean> {
        const full_path = path.join(HTTP_PROXY_PATH, proxy);
        return FileSystem.ExistsAsync(full_path);
    }
}