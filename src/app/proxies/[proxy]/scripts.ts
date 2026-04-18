'use server'

import path from 'path';
import fs from 'fs/promises';
import { EdgeBlock } from '@/libs/edgeBlock';
import { AppConfig } from '@/libs/appConfig';
import { EdgeProxyBlock, EdgeProxyBlockKey } from '@/types/types';

function defaultConfig(): EdgeProxyBlock {
    return [
        EdgeProxyBlockKey.Root,
        [
            [
                EdgeProxyBlockKey.Server,
                [
                    [EdgeProxyBlockKey.Listen,     ['', '80', '']],
                    [EdgeProxyBlockKey.ServerName, ['']],
                ],
            ],
        ],
    ];
}

export async function loadConfig(proxy: string): Promise<EdgeProxyBlock> {
    if (!await EdgeBlock.existsAsync(proxy)) {
        await EdgeBlock.saveAsync(proxy, defaultConfig());
    }
    return EdgeBlock.loadAsync(proxy);
}

export async function saveConfig(proxy: string, data: EdgeProxyBlock): Promise<void> {
    await EdgeBlock.saveAsync(proxy, data);
}

export async function deleteProxy(proxy: string): Promise<void> {
    await EdgeBlock.deleteAsync(proxy);
}

export async function enableProxy(proxy: string): Promise<void> {
    await EdgeBlock.enableAsync(proxy);
}

export async function disableProxy(proxy: string): Promise<void> {
    await EdgeBlock.disableAsync(proxy);
}

export async function isProxyEnabled(proxy: string): Promise<boolean> {
    const appSettings = await AppConfig.LoadAsync();
    const link = path.join(appSettings.nginxBasePath, 'sites-enabled', proxy);
    try {
        await fs.access(link);
        return true;
    } catch {
        return false;
    }
}
