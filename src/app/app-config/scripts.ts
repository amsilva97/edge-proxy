'use server'

import { AppConfig } from '@/libs/AppConfig';
import { AppConfigHelper } from '@/libs/server/AppConfigHelper';

export async function loadAppConfig(): Promise<AppConfig> {
    return AppConfigHelper.load();
}

export async function saveAppConfig(config: AppConfig): Promise<void> {
    return AppConfigHelper.save(config);
}
