'use server'

import fs from 'fs/promises';
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
