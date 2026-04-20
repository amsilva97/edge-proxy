import path from 'path';
import { FileSystem } from './fileSystem';
import { PROXIES_DIR } from './constants';
import { EdgeProxyBlock } from '@/types/types';
import { Nginx } from './nginx';
import { AppConfig } from './appConfig';
import { NotificationManager, ToastNotificationStatus } from '@/components/notifier';

export namespace EdgeBlock {
    export async function GetProxyListAsync(): Promise<string[]> {
        try {
            const files = await FileSystem.ReadDirAsync(PROXIES_DIR);
            return files
                .filter((f: string) => f.endsWith('.json'))
                .map((f: string) => f.slice(0, -5));
        } catch {
            return [];
        }
    }

    export async function LoadAsync(proxy: string): Promise<EdgeProxyBlock[]> {
        const raw = await FileSystem.ReadFileAsync(ProxyFile(proxy));
        return JSON.parse(raw) as EdgeProxyBlock[];
    }

    export async function SaveAsync(proxy: string, data: EdgeProxyBlock[]): Promise<void> {
        await FileSystem.MakeDirAsync(PROXIES_DIR, { recursive: true });
        await FileSystem.WriteFileAsync(ProxyFile(proxy), JSON.stringify(data, null, 2));
        await GenerateNginxConfigAsync(proxy, data);
    }

    export async function DeleteAsync(proxy: string): Promise<void> {
        await FileSystem.RemoveFileAsync(ProxyFile(proxy), { force: true });
        const appSettings = await AppConfig.LoadAsync();
        await FileSystem.RemoveFileAsync(path.join(appSettings.nginxBasePath, 'sites-enabled', proxy), { force: true });
        await FileSystem.RemoveFileAsync(path.join(appSettings.nginxBasePath, 'sites-available', proxy), { force: true });
    }

    export async function EnableAsync(proxy: string): Promise<void> {
        const appSettings = await AppConfig.LoadAsync();
        const target = path.join(appSettings.nginxBasePath, 'sites-available', proxy);
        const link = path.join(appSettings.nginxBasePath, 'sites-enabled', proxy);
        await FileSystem.MakeDirAsync(path.dirname(link), { recursive: true });
        await FileSystem.RemoveFileAsync(link, { force: true });
        await FileSystem.MakeSymlinkAsync(target, link);
        await Nginx.ReloadAsync();
        NotificationManager.addToast(`Proxy '${proxy}' enabled successfully.`, ToastNotificationStatus.Success);
    }

    export async function DisableAsync(proxy: string): Promise<void> {
        const appSettings = await AppConfig.LoadAsync();
        const link = path.join(appSettings.nginxBasePath, 'sites-enabled', proxy);
        await FileSystem.RemoveFileAsync(link, { force: true });
        await Nginx.ReloadAsync();
        NotificationManager.addToast(`Proxy '${proxy}' disabled successfully.`, ToastNotificationStatus.Success);
    }

    export async function DoExistsAsync(proxy: string): Promise<boolean> {
        return FileSystem.ExistsAsync(ProxyFile(proxy));
    }

    export async function IsEnabledAsync(proxy: string): Promise<boolean> {
        const appSettings = await AppConfig.LoadAsync();
        const link = path.join(appSettings.nginxBasePath, 'sites-enabled', proxy);
        try {
            await FileSystem.ExistsAsync(link);
            return true;
        } catch {
            return false;
        }
    }

    async function GenerateNginxConfigAsync(proxy: string, data: EdgeProxyBlock[]): Promise<string> {
        const config = BuildNginxConfig(data);
        const appSettings = await AppConfig.LoadAsync();
        const sitesAvailable = path.join(appSettings.nginxBasePath, 'sites-available');
        await FileSystem.MakeDirAsync(sitesAvailable, { recursive: true });
        await FileSystem.WriteFileAsync(path.join(sitesAvailable, proxy), config);
        return config;
    }

    function ProxyFile(proxy: string) {
        const safe = proxy.replace(/[^a-zA-Z0-9_-]/g, '_');
        return path.join(PROXIES_DIR, `${safe}.json`);
    }

    export function BuildNginxConfig(blocks: EdgeProxyBlock[], indent = 0): string {
        function _build(block: EdgeProxyBlock, indent: number): string {
            const [name, ...rest] = block;
            const pad = '    '.repeat(indent);
            const isContext = rest.length > 0 && Array.isArray(rest[0]) && (rest[0].length === 0 || Array.isArray(rest[0][0]));

            if (isContext) {
                const children = rest[0] as EdgeProxyBlock[];
                const inner = children
                    .map(c => _build(c, indent + 1))
                    .filter(Boolean)
                    .join('\n');
                return `${pad}${name} {\n${inner}\n${pad}}`;
            }

            const values = rest.filter(v => v !== '' && v !== undefined && v !== null);
            if (values.length === 0) return '';
            return `${pad}${name} ${values.join(' ')};`;
        }

        return blocks.map(b => _build(b, indent)).filter(Boolean).join('\n') + '\n';
    }
}