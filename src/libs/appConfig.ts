'use client';
import * as AppConfigActions from './appConfig.actions';
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
        return await AppConfigActions.LoadAsync();
    }

    export async function SaveAsync(config: EdgeProxySettings): Promise<void> {
        await AppConfigActions.SaveAsync(config);
    }
}