'use server';

import type { EdgeBlockData } from '@/libs/edgeDirective';

export async function loadConfig(proxy: string): Promise<EdgeBlockData[]> {
    const { GetHttpHostAsync, SaveHttpHostAsync } = await import('@/libs/edgeProxy.actions');
    try {
        return await GetHttpHostAsync(proxy);
    } catch {
        const config: EdgeBlockData[] = [];
        await SaveHttpHostAsync(proxy, config);
        return config;
    }
}

export async function saveConfig(proxy: string, data: EdgeBlockData[]): Promise<void> {
    const { SaveHttpHostAsync } = await import('@/libs/edgeProxy.actions');
    await SaveHttpHostAsync(proxy, data);
}

export async function deleteProxy(proxy: string): Promise<void> {
    const { DeleteHttpHostAsync } = await import('@/libs/edgeProxy.actions');
    await DeleteHttpHostAsync(proxy);
}

export async function enableProxy(proxy: string): Promise<void> {
    const { EnableHttpHostAsync } = await import('@/libs/edgeProxy.actions');
    await EnableHttpHostAsync(proxy);
}

export async function disableProxy(proxy: string): Promise<void> {
    const { DisabledHttpHostAsync } = await import('@/libs/edgeProxy.actions');
    await DisabledHttpHostAsync(proxy);
}

export async function isProxyEnabled(proxy: string): Promise<boolean> {
    const { GetHttpHostMetaAsync } = await import('@/libs/edgeProxy.actions');
    const meta = await GetHttpHostMetaAsync(proxy);
    return meta.isEnabled ?? false;
}

export async function listSslLabels(): Promise<string[]> {
    const { GetSslCertKeyListAsync } = await import('@/libs/edgeProxy.actions');
    const certs = await GetSslCertKeyListAsync();
    return certs.filter(c => c.isEnabled).map(c => c.label);
}
