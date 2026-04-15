import path from 'path';
import fs from 'fs/promises';
import { DATA_DIR } from '@/libs/constants';
import { AppConfig, DEFAULT_APP_CONFIG } from '../AppConfig';

export class AppConfigHelper {
    private static config_path = path.join(DATA_DIR, 'app-config.json');
    private static cache: AppConfig;

    /** Loads the application configuration from disk, or returns default values if the file doesn't exist. */
    public static async load(): Promise<AppConfig> {
        try {
            const raw = await fs.readFile(this.config_path, 'utf-8');
            this.cache = JSON.parse(raw) as AppConfig;
        } catch {
            this.cache = { ...DEFAULT_APP_CONFIG };
        }
        return this.cache;
    }

    /** Saves the application configuration to disk. */
    public static async save(config: AppConfig): Promise<void> {
        await fs.mkdir(DATA_DIR, { recursive: true });
        await fs.writeFile(this.config_path, JSON.stringify(config, null, 2), 'utf-8');
        this.cache = config;
    }

    public static get settings(): AppConfig {
        if (!this.cache) this.load();
        return this.cache;
    }
}
