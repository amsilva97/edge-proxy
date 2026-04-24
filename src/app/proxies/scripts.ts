import {
    GetHttpHostMetaListAsync,
    DeleteHttpHostAsync,
    EnableHttpHostAsync,
    DisabledHttpHostAsync,
} from '@/libs/edgeProxy.actions';
import { HttpHostMeta } from '@/types/types';

export async function listProxies(): Promise<HttpHostMeta[]> {
    return GetHttpHostMetaListAsync();
}

export async function proxyExists(name: string): Promise<boolean> {
    const list = await GetHttpHostMetaListAsync();
    return list.some(p => p.label === name);
}

export async function deleteProxy(name: string): Promise<void> {
    await DeleteHttpHostAsync(name);
}

export async function enableProxy(name: string): Promise<void> {
    await EnableHttpHostAsync(name);
}

export async function disableProxy(name: string): Promise<void> {
    await DisabledHttpHostAsync(name);
}
