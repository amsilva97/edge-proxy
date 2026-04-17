import 'server-only';
import path from 'path';
import fs from 'fs/promises';
import { DATA_DIR } from '@/libs/constants';

const configPath = path.join(DATA_DIR, 'app-config.json');

/** Interface for the application settings */
export interface EdgeProxySettings {
    nginxBasePath: string;
}

/** Default application configuration values */
let appConfigData: EdgeProxySettings = {
    nginxBasePath: '/etc/nginx',
};

/** Loads the application configuration from the file system */
export async function loadAppSettingAsync(): Promise<EdgeProxySettings> {
    try {
        const data = await fs.readFile(configPath, 'utf-8');
        const config = JSON.parse(data) as EdgeProxySettings;
        return { ...appConfigData, ...config };
    } catch (error) {
        console.warn('Could not load app config, using defaults:', error);
        return appConfigData;
    }
}

/** Saves the application configuration to the file system */
export async function saveAppSettingAsync(config: EdgeProxySettings): Promise<void> {
    try {
        await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
    } catch (error) {
        console.error('Failed to save app config:', error);
    }
}