import path from 'path';
import { FileSystem } from './fileSystem';
import { DataPaths } from './constants';
import { EdgeProxyBlock } from '@/types/types';
import { EdgeDirectives } from './edgeDirective';
import { Nginx } from './nginx';
import { AppConfig } from './appConfig';
import { NotificationManager, ToastNotificationStatus } from '@/components/notifier';

export namespace EdgeBlock {
    /** @deprecated Use 'AppData.GetHttpProxyListAsync' */
    export async function GetProxyListAsync(): Promise<string[]> {
        try {
            const files = await FileSystem.ReadDirAsync(DataPaths.proxies);
            return files
                .filter((f: string) => f.endsWith('.json'))
                .map((f: string) => f.slice(0, -5));
        } catch {
            return [];
        }
    }

    /** @deprecated Use 'AppData.LoadHttpProxyAsync' */
    export async function LoadAsync(proxy: string): Promise<EdgeProxyBlock[]> {
        const raw = await FileSystem.ReadFileAsync(ProxyFile(proxy));
        return JSON.parse(raw) as EdgeProxyBlock[];
    }

    /** @deprecated Use 'AppData.SaveHttpProxyAsync' */
    export async function SaveAsync(proxy: string, data: EdgeProxyBlock[]): Promise<void> {
        await FileSystem.MakeDirAsync(DataPaths.proxies, { recursive: true });
        await FileSystem.WriteFileAsync(ProxyFile(proxy), JSON.stringify(data, null, 2));
        await GenerateNginxConfigAsync(proxy, data);
    }

    /** @deprecated Use 'AppData.DeleteHttpProxyAsync' */
    export async function DeleteAsync(proxy: string): Promise<void> {
        await FileSystem.RemoveFileAsync(ProxyFile(proxy), { force: true });
        const appSettings = await AppConfig.LoadAsync();
        await FileSystem.RemoveFileAsync(path.join(appSettings.nginxBasePath, 'sites-enabled', proxy), { force: true });
        await FileSystem.RemoveFileAsync(path.join(appSettings.nginxBasePath, 'sites-available', proxy), { force: true });
    }

    /** @deprecated Use 'AppData.EnableHttpProxyAsync' */
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

    /** @deprecated Use 'AppData.DisableHttpProxyAsync' */
    export async function DisableAsync(proxy: string): Promise<void> {
        const appSettings = await AppConfig.LoadAsync();
        const link = path.join(appSettings.nginxBasePath, 'sites-enabled', proxy);
        await FileSystem.RemoveFileAsync(link, { force: true });
        await Nginx.ReloadAsync();
        NotificationManager.addToast(`Proxy '${proxy}' disabled successfully.`, ToastNotificationStatus.Success);
    }

    /** @deprecated Use 'AppData.ExistsHttpProxyAsync' */
    export async function DoExistsAsync(proxy: string): Promise<boolean> {
        return FileSystem.ExistsAsync(ProxyFile(proxy));
    }

    /** @deprecated Use 'AppData.IsEnabledHttpProxyAsync' */
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

    /** @deprecated Use 'Nginx.SaveHttpProxy' */
    async function GenerateNginxConfigAsync(proxy: string, data: EdgeProxyBlock[]): Promise<string> {
        const config = BuildNginxConfig(data);
        const appSettings = await AppConfig.LoadAsync();
        const sitesAvailable = path.join(appSettings.nginxBasePath, 'sites-available');
        await FileSystem.MakeDirAsync(sitesAvailable, { recursive: true });
        await FileSystem.WriteFileAsync(path.join(sitesAvailable, proxy), config);
        return config;
    }

    /** @deprecated we will not sanitize file names if issues arise later we will have the respected method handle it */
    function ProxyFile(proxy: string) {
        return proxy
        const safe = proxy.replace(/[^a-zA-Z0-9_-]/g, '_');
        return path.join(DataPaths.proxies, `${safe}.json`);
    }

    /** @deprecated Use 'Nginx.BuildNginxConfig' */
    export function BuildNginxConfig(blocks: EdgeProxyBlock[], indent = 0): string {
        function _build(block: EdgeProxyBlock, indent: number): string {
            const [name, ...rest] = block;
            const pad = '    '.repeat(indent);
            const directive = EdgeDirectives.find(d => d.key === name);
            const nonCtxParams = directive?.params.filter(p => p.primitive !== 'context') ?? [];
            const hasContext = directive?.params.some(p => p.primitive === 'context') ?? false;

            const applySlots = (vals: unknown[]) =>
                vals.map((v, i) => {
                    if (!v && v !== 0) return '';
                    const slot = nonCtxParams[i];
                    if (slot?.primitive === 'ssl') {
                        const sub = name === 'ssl_certificate_key' ? 'key' : 'cert';
                        return path.join(DataPaths.ssl, String(v), sub);
                    }
                    const suffix = slot?.suffix ?? slot?.subSlot?.suffix;
                    return suffix ? `${v}${suffix}` : String(v);
                }).filter(Boolean);

            if (hasContext) {
                const slotVals = rest.slice(0, nonCtxParams.length);
                const children = (rest[nonCtxParams.length] ?? []) as EdgeProxyBlock[];
                const inner = children.map(c => _build(c, indent + 1)).filter(Boolean).join('\n');
                const params = applySlots(slotVals);
                const header = params.length ? `${name} ${params.join(' ')}` : name;
                return `${pad}${header} {\n${inner}\n${pad}}`;
            }

            const values = applySlots(rest);
            if (values.length === 0) return '';
            return `${pad}${name} ${values.join(' ')};`;
        }

        return blocks.map(b => _build(b, indent)).filter(Boolean).join('\n') + '\n';
    }
}