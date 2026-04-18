'use server'

import { EdgeBlock } from '@/libs/EdgeBlock';
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
