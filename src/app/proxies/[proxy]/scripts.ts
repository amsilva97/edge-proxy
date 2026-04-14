'use server'

import fs from 'fs/promises';
import path from 'path';
import { EdgeProxyBlock, EdgeProxyBlockKey, EdgeProxyBlockHelper } from '@/libs/EdgeProxyBlock';
import { PROXIES_DIR } from '@/libs/constants';

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
    if (!await EdgeProxyBlockHelper.existsAsync(proxy)) {
        await EdgeProxyBlockHelper.saveAsync(proxy, defaultConfig());
    }
    return EdgeProxyBlockHelper.loadAsync(proxy);
}

export async function saveConfig(proxy: string, data: EdgeProxyBlock): Promise<void> {
    await EdgeProxyBlockHelper.saveAsync(proxy, data);
}
