import 'server-only';
import path from 'path';
import fs from 'fs/promises';
import { DATA_DIR } from '@/libs/constants';
import { EdgeProxySettings } from '@/types/types';

const configPath = path.join(DATA_DIR, 'app-config.json');

/** Default application configuration values */
let appConfigData: EdgeProxySettings = {
    nginxBasePath: '/etc/nginx',
};

export class AppConfig {
    private constructor() { }

    /** Loads the application configuration from the file system */
    static async LoadAsync(): Promise<EdgeProxySettings> {
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
    static async SaveAsync(config: EdgeProxySettings): Promise<void> {
        try {
            await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
        } catch (error) {
            console.error('Failed to save app config:', error);
        }
    }
}