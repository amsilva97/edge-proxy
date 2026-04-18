'use server'

import { EdgeBlock } from "@/libs/edgeBlock";


export async function listProxies(): Promise<string[]> {
    return EdgeBlock.getProxyListAsync();
}

export async function deleteProxy(name: string): Promise<void> {
    return EdgeBlock.deleteAsync(name);
}

export async function proxyExists(name: string): Promise<boolean> {
    return EdgeBlock.existsAsync(name);
}
