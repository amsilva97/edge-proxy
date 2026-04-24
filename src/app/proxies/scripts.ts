'use client';
import { EdgeProxy } from "@/libs/edgeProxy";
import { HttpHost, HttpHostMeta } from "@/types/types";

export async function createProxy(name: string): Promise<void> {
    return EdgeProxy.SaveHttpHostAsync(name, [] as HttpHost);
}

export async function listProxies(): Promise<HttpHostMeta[]> {
    return EdgeProxy.GetHttpHostMetaListAsync();
}

export async function proxyExists(name: string): Promise<boolean> {
    try {
        const meta = await EdgeProxy.GetHttpHostMetaAsync(name);
        return !!meta.label;
    } catch {
        return false;
    }
}

export async function deleteProxy(name: string): Promise<void> {
    return EdgeProxy.DeleteHttpHostAsync(name);
}

export async function enableProxy(name: string): Promise<void> {
    return EdgeProxy.EnableHttpHostAsync(name);
}

export async function disableProxy(name: string): Promise<void> {
    return EdgeProxy.DisabledHttpHostAsync(name);
}
