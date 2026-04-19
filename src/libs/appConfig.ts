'use client';
import { FileSystem } from './fileSystem';
import path from 'path';
import { DATA_DIR } from '@/libs/constants';
import { EdgeProxySettings } from '@/types/types';

const configPath = path.join(DATA_DIR, 'app-config.json');

/** Default application configuration values */
let appConfigData: EdgeProxySettings = {
    nginxBasePath: '/etc/nginx',
};

export namespace AppConfig {
    export async function LoadAsync(): Promise<EdgeProxySettings> {
        const data = await FileSystem.ReadFileAsync(configPath);
        const config = JSON.parse(data) as EdgeProxySettings;
        return { ...appConfigData, ...config };
    }

    export async function SaveAsync(config: EdgeProxySettings): Promise<void> {
        await FileSystem.WriteFileAsync(configPath, JSON.stringify(config, null, 2));
    }
}