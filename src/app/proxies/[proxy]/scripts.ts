'use server'

import { EdgeProxyBlock, EdgeProxyBlockKey } from '@/libs/EdgeProxyBlock';
import { EdgeProxyBlockHelper } from '@/libs/server/EdgeProxyBlockHelper';

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
