import fs from 'fs/promises';
import path from 'path';
import { DATA_DIR } from '@/libs/constants';
import { AppConfig, DEFAULT_APP_CONFIG } from '@/libs/AppConfig';

const CONFIG_FILE = path.join(DATA_DIR, 'app-config.json');

export class AppConfigHelper {
    public static async load(): Promise<AppConfig> {
        try {
            const raw = await fs.readFile(CONFIG_FILE, 'utf-8');
            return { ...DEFAULT_APP_CONFIG, ...JSON.parse(raw) } as AppConfig;
        } catch {
            return { ...DEFAULT_APP_CONFIG };
        }
    }

    public static async save(config: AppConfig): Promise<void> {
        await fs.mkdir(path.dirname(CONFIG_FILE), { recursive: true });
        await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
    }
}
