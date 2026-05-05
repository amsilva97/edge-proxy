'use client';
import { EdgeProxy } from "@/libs/edgeProxy";
import { HttpHostMeta, HttpProxyType } from "@/types/types";

export async function listHttpStatics(): Promise<HttpHostMeta[]> {
    const all = await EdgeProxy.GetHttpHostMetaListAsync();
    return all.filter(m => m.type === HttpProxyType.Static);
}

export async function staticExists(name: string): Promise<boolean> {
    try {
        const meta = await EdgeProxy.GetHttpHostMetaAsync(name);
        return !!meta.label;
    } catch {
        return false;
    }
}

export async function saveHttpStatic(
    name: string, source: string, pathToFile: string, isSpa: boolean,
    ssl: string | null, accessRole: string | null
): Promise<HttpHostMeta> {
    return EdgeProxy.SaveHttpStaticHostAsync(name, source, pathToFile, isSpa, ssl, accessRole);
}

export async function deleteHttpStatic(name: string): Promise<void> {
    return EdgeProxy.DeleteHttpHostAsync(name);
}

export async function enableHttpStatic(name: string): Promise<HttpHostMeta | null> {
    return EdgeProxy.EnableHttpHostAsync(name);
}

export async function disableHttpStatic(name: string): Promise<HttpHostMeta> {
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
