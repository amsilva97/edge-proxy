'use server'

import fs from 'fs/promises';
import path from 'path';
import { DATA_DIR } from '@/libs/constants';

const CONFIG_FILE = path.join(DATA_DIR, 'app-config.json');

export interface AppConfig {
    nginxBasePath: string;
}

const DEFAULT_CONFIG: AppConfig = {
    nginxBasePath: '/etc/nginx',
};

export async function loadAppConfig(): Promise<AppConfig> {
    try {
        const raw = await fs.readFile(CONFIG_FILE, 'utf-8');
        return { ...DEFAULT_CONFIG, ...JSON.parse(raw) } as AppConfig;
    } catch {
        return { ...DEFAULT_CONFIG };
    }
}

export async function saveAppConfig(config: AppConfig): Promise<void> {
    await fs.mkdir(path.dirname(CONFIG_FILE), { recursive: true });
    await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
}
