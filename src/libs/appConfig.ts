import { FileSystem } from './fileSystem';
import { DataPaths } from '@/libs/constants';
import { EdgeProxySettings } from '@/types/types';

/** Default application configuration values */
let appConfigData: EdgeProxySettings = {
    nginxBasePath: '/etc/nginx',
};

export namespace AppConfig {
    export async function LoadAsync(): Promise<EdgeProxySettings> {
        return appConfigData
        const data = await FileSystem.ReadFileAsync(DataPaths.appConfig);
        const config = JSON.parse(data) as EdgeProxySettings;
        return { ...appConfigData, ...config };
    }

    export async function SaveAsync(config: EdgeProxySettings): Promise<void> {
        throw new Error('Not yet implemented');
        await FileSystem.WriteFileAsync(DataPaths.appConfig, JSON.stringify(config, null, 2));
    }
}