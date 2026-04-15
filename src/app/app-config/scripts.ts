'use server'

import { AppConfig } from '@/libs/AppConfig';
import { AppConfigHelper } from '@/libs/server/AppConfigHelper';

/** Loads the application configuration as a deep copy */
export async function loadAppConfig(): Promise<AppConfig> {
    return JSON.parse(JSON.stringify(await AppConfigHelper.load()));
}

/** Saves the application configuration */
export async function saveAppConfig(config: AppConfig): Promise<void> {
    return AppConfigHelper.save(config);
}
