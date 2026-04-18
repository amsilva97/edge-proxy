'use server';
import path from 'path';
import fs from 'fs/promises';
import { PROXIES_DIR } from './constants';
import { EdgeProxyBlock, EdgeProxyBlockKey } from '@/types/types';
import * as AppConfig from './appConfig.actions';
import * as Nginx from './nginx.actions';

export async function GetProxyListAction(): Promise<string[]> {
    try {
        const files = await fs.readdir(PROXIES_DIR);
        return files
            .filter((f: string) => f.endsWith('.json'))
            .map((f: string) => f.slice(0, -5));
    } catch {
        return [];
    }
}

export async function LoadAsync(proxy: string): Promise<EdgeProxyBlock> {
    const raw = await fs.readFile(ProxyFile(proxy), 'utf-8');
    return JSON.parse(raw) as EdgeProxyBlock;
}

export async function SaveAsync(proxy: string, data: EdgeProxyBlock): Promise<void> {
    await fs.mkdir(PROXIES_DIR, { recursive: true });
    await fs.writeFile(ProxyFile(proxy), JSON.stringify(data, null, 2), 'utf-8');
    await GenerateNginxConfigAsync(proxy, data);
}

export async function DeleteAsync(proxy: string): Promise<void> {
    await fs.rm(ProxyFile(proxy), { force: true });
    const appSettings = await AppConfig.LoadAsync();
    await fs.rm(path.join(appSettings.nginxBasePath, 'sites-enabled', proxy), { force: true });
    await fs.rm(path.join(appSettings.nginxBasePath, 'sites-available', proxy), { force: true });
}

export async function EnableAsync(proxy: string): Promise<void> {
    const appSettings = await AppConfig.LoadAsync();
    const target = path.join(appSettings.nginxBasePath, 'sites-available', proxy);
    const link = path.join(appSettings.nginxBasePath, 'sites-enabled', proxy);
    await fs.mkdir(path.dirname(link), { recursive: true });
    await fs.rm(link, { force: true });
    await fs.symlink(target, link);
    await Nginx.ReloadAsync();
}

export async function DisableAsync(proxy: string): Promise<void> {
    const appSettings = await AppConfig.LoadAsync();
    const link = path.join(appSettings.nginxBasePath, 'sites-enabled', proxy);
    await fs.rm(link, { force: true });
    await Nginx.ReloadAsync();
}

export async function DoExistsAsync(proxy: string): Promise<boolean> {
    try {
        await fs.access(ProxyFile(proxy));
        return true;
    } catch {
        return false;
    }
}

export async function IsEnabledAsync(proxy: string): Promise<boolean> {
    const appSettings = await AppConfig.LoadAsync();
    const link = path.join(appSettings.nginxBasePath, 'sites-enabled', proxy);
    try {
        await fs.access(link);
        return true;
    } catch {
        return false;
    }
}

async function GenerateNginxConfigAsync(proxy: string, data: EdgeProxyBlock): Promise<string> {
    const config = BuildNginxConfig(data);
    const appSettings = await AppConfig.LoadAsync();
    const sitesAvailable = path.join(appSettings.nginxBasePath, 'sites-available');
    await fs.mkdir(sitesAvailable, { recursive: true });
    await fs.writeFile(path.join(sitesAvailable, proxy), config, 'utf-8');
    return config;
}

function ProxyFile(proxy: string) {
    const safe = proxy.replace(/[^a-zA-Z0-9_-]/g, '_');
    return path.join(PROXIES_DIR, `${safe}.json`);
}

function BuildNginxConfig(block: EdgeProxyBlock, indent = 0): string {
    function _BuildNginxConfig(block: EdgeProxyBlock, indent = 0): string {
        const [key, children] = block as [EdgeProxyBlockKey, any[]];
        const pad = '    '.repeat(indent);

        switch (key) {
            case EdgeProxyBlockKey.Root:
                return (children ?? []).map((c: EdgeProxyBlock) => _BuildNginxConfig(c, indent)).join('\n\n');

            case EdgeProxyBlockKey.Server: {
                const inner = (children ?? [])
                    .map((c: EdgeProxyBlock) => _BuildNginxConfig(c, indent + 1))
                    .filter(Boolean)
                    .join('\n');
                return `${pad}server {\n${inner}\n${pad}}`;
            }

            case EdgeProxyBlockKey.Listen: {
                const [ip, port, ...flags] = children as string[];
                const addr = ip ? `${ip}:${port}` : port;
                const flagStr = flags.filter(Boolean).join(' ');
                return `${pad}listen ${addr}${flagStr ? ` ${flagStr}` : ''};`;
            }

            case EdgeProxyBlockKey.ServerName: {
                const names = (children as string[]).filter(Boolean).join(' ');
                return `${pad}server_name ${names || '_'};`;
            }

            default:
                return '';

        }
    }
    // Add a newline at the end of the config for better formatting per file
    return _BuildNginxConfig(block, indent) + '\n';
}