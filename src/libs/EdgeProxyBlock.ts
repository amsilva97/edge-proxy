import { PROXIES_DIR } from '@/libs/constants';
import fs from 'fs/promises';
import path from 'path';

export type EdgeProxyBlock = [EdgeProxyBlockKey, ...any[]];

export enum EdgeProxyBlockKey {
    Root,
    Server,
    Listen,
    ServerName,
}

export class EdgeProxyBlockHelper {
    constructor(private data: EdgeProxyBlock) { }

    public static async getListAsync(): Promise<string[]> {
        try {
            const files = await fs.readdir(PROXIES_DIR);
            return files
                .filter(f => f.endsWith('.json'))
                .map(f => f.slice(0, -5));
        } catch {
            return [];
        }
    }

    /** Saves the provided block data into Edge Proxy json */
    public static async saveAsync(proxy: string, data: EdgeProxyBlock): Promise<void> {
        await fs.mkdir(PROXIES_DIR, { recursive: true });
        await fs.writeFile(this.proxyFileAsync(proxy), JSON.stringify(data, null, 2), 'utf-8');
    }

    /** Loads the block data from Edge Proxy json */
    public static async loadAsync(proxy: string): Promise<EdgeProxyBlock> {
        const raw = await fs.readFile(this.proxyFileAsync(proxy), 'utf-8');
        return JSON.parse(raw) as EdgeProxyBlock;
    }

    /** Deletes the block data from Edge Proxy json */
    public static async deleteAsync(proxy: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public static async existsAsync(proxy: string): Promise<boolean> {
        try {
            await fs.access(this.proxyFileAsync(proxy));
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Generates the Nginx configuration string based on the block data.
     * Additionally, adds the file to site-available.
     */
    public static async generateAsync(): Promise<string> {
        throw new Error("Method not implemented.");
    }

    /** Enables the proxy by creating a symbolic link in site-enabled and reloading Nginx */
    public static async enableAsync(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    /** Disables the proxy by removing the symbolic link from site-enabled and reloading Nginx */
    public static async disableAsync(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    private static proxyFileAsync(proxy: string) {
        const safe = proxy.replace(/[^a-zA-Z0-9_-]/g, '_');
        return path.join(PROXIES_DIR, `${safe}.json`);
    }
}
