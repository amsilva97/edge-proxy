'use client';
import { EdgeProxy } from "@/libs/edgeProxy";
import { HttpHost, HttpHostMeta } from "@/types/types";

export async function listHttpProxies(): Promise<HttpHostMeta[]> {
    const all = await EdgeProxy.GetHttpHostMetaListAsync();
    return all;
}

export async function proxyExists(name: string): Promise<boolean> {
    try {
        const meta = await EdgeProxy.GetHttpHostMetaAsync(name);
        return !!meta.label;
    } catch {
        return false;
    }
}

export async function getHttpProxy(name: string): Promise<HttpHost> {
    const result = await EdgeProxy.GetHttpHostAsync(name);
    return Array.isArray(result) ? result : [];
}

export async function saveHttpProxy(name: string, source: string, destination: string, ssl: string | null): Promise<void> {
    return EdgeProxy.SaveHttpProxyHostAsync(name, source, destination, ssl);
}

export async function deleteHttpProxy(name: string): Promise<void> {
    return EdgeProxy.DeleteHttpHostAsync(name);
}

export async function enableHttpProxy(name: string): Promise<void> {
    return EdgeProxy.EnableHttpHostAsync(name);
}

export async function disableHttpProxy(name: string): Promise<void> {
    return EdgeProxy.DisabledHttpHostAsync(name);
}

export async function listSslCerts(): Promise<string[]> {
    const certs = await EdgeProxy.GetSslCertKeyListAsync();
    return certs.filter(c => c.isEnabled).map(c => c.label);
}
