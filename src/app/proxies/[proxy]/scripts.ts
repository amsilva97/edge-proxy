'use server'

import fs from 'fs/promises';
import path from 'path';
import { EdgeProxyBlock, EdgeProxyBlockKey } from '@/libs/EdgeProxyBlock';
import { PROXIES_DIR } from '@/libs/constants';

const CONFIGS_DIR = PROXIES_DIR;

function proxyFile(proxy: string) {
    const safe = proxy.replace(/[^a-zA-Z0-9_-]/g, '_');
    return path.join(CONFIGS_DIR, `${safe}.json`);
}

function defaultConfig(): EdgeProxyBlock {
    return [
        EdgeProxyBlockKey.Root,
        [
            [
                EdgeProxyBlockKey.Server,
                [
                    [EdgeProxyBlockKey.Listen,     ['', '80', '']],
                    [EdgeProxyBlockKey.ServerName, ['']],
                ],
            ],
        ],
    ];
}

export async function loadConfig(proxy: string): Promise<EdgeProxyBlock> {
    try {
        const raw = await fs.readFile(proxyFile(proxy), 'utf-8');
        return JSON.parse(raw) as EdgeProxyBlock;
    } catch {
        return defaultConfig();
    }
}

export async function proxyExists(proxy: string): Promise<boolean> {
    try {
        await fs.access(proxyFile(proxy));
        return true;
    } catch {
        return false;
    }
}

export async function saveConfig(proxy: string, data: EdgeProxyBlock): Promise<void> {
    await fs.mkdir(CONFIGS_DIR, { recursive: true });
    await fs.writeFile(proxyFile(proxy), JSON.stringify(data, null, 2), 'utf-8');
}
