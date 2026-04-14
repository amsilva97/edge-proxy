'use server'

import fs from 'fs/promises';
import path from 'path';
import { PROXIES_DIR } from '@/libs/constants';

export async function listProxies(): Promise<string[]> {
    try {
        const files = await fs.readdir(PROXIES_DIR);
        return files
            .filter(f => f.endsWith('.json'))
            .map(f => f.slice(0, -5));
    } catch {
        return [];
    }
}

export async function deleteProxy(name: string): Promise<void> {
    const safe = name.replace(/[^a-zA-Z0-9_-]/g, '_');
    await fs.unlink(path.join(PROXIES_DIR, `${safe}.json`));
}
