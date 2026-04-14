'use server'

import { EdgeProxyBlockHelper } from '@/libs/EdgeProxyBlock';

export async function listProxies(): Promise<string[]> {
    return EdgeProxyBlockHelper.getListAsync();
}

export async function deleteProxy(name: string): Promise<void> {
    return EdgeProxyBlockHelper.deleteAsync(name);
}

export async function proxyExists(name: string): Promise<boolean> {
    return EdgeProxyBlockHelper.existsAsync(name);
}
