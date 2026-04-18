'use server';
import path from 'path';
import fs from 'fs/promises';
import { DATA_DIR } from '@/libs/constants';
import { EdgeProxySettings } from '@/types/types';

const configPath = path.join(DATA_DIR, 'app-config.json');

/** Default application configuration values */
let appConfigData: EdgeProxySettings = {
    nginxBasePath: '/etc/nginx',
};

export async function LoadAsync(): Promise<EdgeProxySettings> {
    const data = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(data) as EdgeProxySettings;
    return { ...appConfigData, ...config };
}

export async function SaveAsync(config: EdgeProxySettings): Promise<void> {
    await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
}