'use client';
import { EdgeProxy } from "@/libs/edgeProxy";
import { HttpHostMeta, HttpProxyType } from "@/types/types";

export async function listLoadbalancers(): Promise<HttpHostMeta[]> {
    const all = await EdgeProxy.GetHttpHostMetaListAsync();
    return all.filter(m => m.type === HttpProxyType.Loadbalancer);
}

export async function loadbalancerExists(name: string): Promise<boolean> {
    try {
        const meta = await EdgeProxy.GetHttpHostMetaAsync(name);
        return !!meta.label;
    } catch {
        return false;
    }
}

export async function saveLoadbalancer(
    name: string, source: string, serverList: string[],
    ssl: string | null, accessRole: string | null
): Promise<HttpHostMeta> {
    return EdgeProxy.SaveHttpLoadbalancerHostAsync(name, source, serverList, ssl, accessRole);
}

export async function deleteLoadbalancer(name: string): Promise<void> {
    return EdgeProxy.DeleteHttpHostAsync(name);
}

export async function enableLoadbalancer(name: string): Promise<HttpHostMeta | null> {
    return EdgeProxy.EnableHttpHostAsync(name);
}

export async function disableLoadbalancer(name: string): Promise<HttpHostMeta> {
    return EdgeProxy.DisabledHttpHostAsync(name);
}

export async function listSslCerts(): Promise<string[]> {
    const certs = await EdgeProxy.GetSslCertKeyListAsync();
    return certs.filter(c => c.isEnabled).map(c => c.label);
}

export async function listRoles(): Promise<string[]> {
    const roles = await EdgeProxy.GetRoleListAsync();
    return roles.map(r => r.name);
}
