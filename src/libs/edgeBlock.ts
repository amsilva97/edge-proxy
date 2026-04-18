import 'server-only';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import { PROXIES_DIR } from './constants';
import { EdgeProxyBlock, EdgeProxyBlockKey } from '@/types/types';
import { AppConfig } from './appConfig';

const execAsync = promisify(exec);

export class EdgeBlock {
    private constructor() { }

    /** Retrieves the list of available proxies */
    public static async getProxyListAsync(): Promise<string[]> {
        try {
            const files = await fs.readdir(PROXIES_DIR);
            return files
                .filter((f: string) => f.endsWith('.json'))
                .map((f: string) => f.slice(0, -5));
        } catch {
            return [];
        }
    }

    /** Loads the block data from Edge Proxy json */
    public static async loadAsync(proxy: string): Promise<EdgeProxyBlock> {
        const raw = await fs.readFile(EdgeBlock.proxyFile(proxy), 'utf-8');
        return JSON.parse(raw) as EdgeProxyBlock;
    }

    /** Saves the provided block data into Edge Proxy json and regenerates the nginx config */
    public static async saveAsync(proxy: string, data: EdgeProxyBlock): Promise<void> {
        await fs.mkdir(PROXIES_DIR, { recursive: true });
        await fs.writeFile(EdgeBlock.proxyFile(proxy), JSON.stringify(data, null, 2), 'utf-8');
        await EdgeBlock.generateAsync(proxy, data);
    }

    /** Deletes the proxy JSON and its nginx site files if present */
    public static async deleteAsync(proxy: string): Promise<void> {
        await fs.rm(EdgeBlock.proxyFile(proxy), { force: true });
        const appSettings = await AppConfig.LoadAsync();
        await fs.rm(path.join(appSettings.nginxBasePath, 'sites-enabled', proxy), { force: true });
        await fs.rm(path.join(appSettings.nginxBasePath, 'sites-available', proxy), { force: true });
    }

    /** Enables the proxy by creating a symlink in sites-enabled and reloading nginx */
    public static async enableAsync(proxy: string): Promise<void> {
        const appSettings = await AppConfig.LoadAsync();
        const target = path.join(appSettings.nginxBasePath, 'sites-available', proxy);
        const link = path.join(appSettings.nginxBasePath, 'sites-enabled', proxy);
        await fs.mkdir(path.dirname(link), { recursive: true });
        await fs.rm(link, { force: true });
        await fs.symlink(target, link);
        await execAsync('nginx -s reload');
    }

    /** Disables the proxy by removing its symlink from sites-enabled and reloading nginx */
    public static async disableAsync(proxy: string): Promise<void> {
        const appSettings = await AppConfig.LoadAsync();
        const link = path.join(appSettings.nginxBasePath, 'sites-enabled', proxy);
        await fs.rm(link, { force: true });
        await execAsync('nginx -s reload');
    }

    /** Checks if the proxy JSON file exists */
    public static async existsAsync(proxy: string): Promise<boolean> {
        try {
            await fs.access(EdgeBlock.proxyFile(proxy));
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Generates the nginx config from block data and writes it to sites-available.
     * Returns the generated config string.
     */
    private static async generateAsync(proxy: string, data: EdgeProxyBlock): Promise<string> {
        const config = EdgeBlock.buildNginxConfig(data);
        const appSettings = await AppConfig.LoadAsync();
        const sitesAvailable = path.join(appSettings.nginxBasePath, 'sites-available');
        await fs.mkdir(sitesAvailable, { recursive: true });
        await fs.writeFile(path.join(sitesAvailable, proxy), config, 'utf-8');
        return config;
    }

    /** Returns the file path for the given proxy's JSON data */
    private static proxyFile(proxy: string) {
        const safe = proxy.replace(/[^a-zA-Z0-9_-]/g, '_');
        return path.join(PROXIES_DIR, `${safe}.json`);
    }

    private static buildNginxConfig(block: EdgeProxyBlock, indent = 0): string {
        const [key, children] = block as [EdgeProxyBlockKey, any[]];
        const pad = '    '.repeat(indent);

        switch (key) {
            case EdgeProxyBlockKey.Root:
                return (children ?? []).map((c: EdgeProxyBlock) => EdgeBlock.buildNginxConfig(c, indent)).join('\n\n');

            case EdgeProxyBlockKey.Server: {
                const inner = (children ?? [])
                    .map((c: EdgeProxyBlock) => EdgeBlock.buildNginxConfig(c, indent + 1))
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
}