'use client';
import { EdgeProxy } from "@/libs/edgeProxy";
import { HttpHostMeta, HttpProxyType } from "@/types/types";

export async function listHttpRedirects(): Promise<HttpHostMeta[]> {
    const all = await EdgeProxy.GetHttpHostMetaListAsync();
    return all.filter(m => m.type === HttpProxyType.Redirect);
}

export async function redirectExists(name: string): Promise<boolean> {
    try {
        const meta = await EdgeProxy.GetHttpHostMetaAsync(name);
        return !!meta.label;
    } catch {
        return false;
    }
}

export async function saveHttpRedirect(
    name: string, source: string, destination: string, isPermanent: boolean
): Promise<HttpHostMeta> {
    return EdgeProxy.SaveHttpRedirectHostAsync(name, source, destination, isPermanent);
}

export async function deleteHttpRedirect(name: string): Promise<void> {
    return EdgeProxy.DeleteHttpHostAsync(name);
}

export async function enableHttpRedirect(name: string): Promise<HttpHostMeta | null> {
    return EdgeProxy.EnableHttpHostAsync(name);
}

export async function disableHttpRedirect(name: string): Promise<HttpHostMeta> {
    return EdgeProxy.DisabledHttpHostAsync(name);
}
