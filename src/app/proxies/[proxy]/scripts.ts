'use server'

import fs from 'fs/promises';
import path from 'path';
import { BlockData, BlockKey } from '@/libs/block';

const CONFIGS_DIR = path.join(process.cwd(), 'data', 'configs');

function proxyFile(proxy: string) {
    const safe = proxy.replace(/[^a-zA-Z0-9_-]/g, '_');
    return path.join(CONFIGS_DIR, `${safe}.json`);
}

function defaultConfig(): BlockData {
    return [
        BlockKey.Root,
        [
            [
                BlockKey.Server,
                [
                    [BlockKey.Listen,     ['', '443', 'ssl']],
                    [BlockKey.ServerName, ['example.com']],
                ],
            ],
        ],
    ];
}

export async function loadConfig(proxy: string): Promise<BlockData> {
    try {
        const raw = await fs.readFile(proxyFile(proxy), 'utf-8');
        return JSON.parse(raw) as BlockData;
    } catch {
        return defaultConfig();
    }
}

export async function saveConfig(proxy: string, data: BlockData): Promise<void> {
    await fs.mkdir(CONFIGS_DIR, { recursive: true });
    await fs.writeFile(proxyFile(proxy), JSON.stringify(data, null, 2), 'utf-8');
}
