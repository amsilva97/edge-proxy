'use client';
import { EdgeProxy } from "@/libs/edgeProxy";
import { HttpHost, HttpHostMeta } from "@/types/types";
import { EdgeBlockData } from "@/libs/edgeDirective";

export async function getProxy(name: string): Promise<HttpHost> {
    return EdgeProxy.GetHttpHostAsync(name);
}

export async function saveProxy(name: string, httpHost: HttpHost): Promise<HttpHostMeta> {
    return EdgeProxy.SaveHttpHostAsync(name, httpHost);
}

export async function getProxyMeta(name: string): Promise<HttpHostMeta> {
    return EdgeProxy.GetHttpHostMetaAsync(name);
}

export async function isProxyEnabled(name: string): Promise<boolean> {
    const meta = await EdgeProxy.GetHttpHostMetaAsync(name);
    return !!meta.isEnabled;
}

export async function deleteProxy(name: string): Promise<void> {
    return EdgeProxy.DeleteHttpHostAsync(name);
}

export async function enableProxy(name: string): Promise<HttpHostMeta | null> {
    return EdgeProxy.EnableHttpHostAsync(name);
}

export async function disableProxy(name: string): Promise<HttpHostMeta> {
    return EdgeProxy.DisabledHttpHostAsync(name);
}

export async function listSslCerts(): Promise<string[]> {
    const certs = await EdgeProxy.GetSslCertKeyListAsync();
    return certs.filter(c => c.isEnabled).map(c => c.label);
}

export async function listSnippets(): Promise<string[]> {
    const snippets = await EdgeProxy.GetSnippetMetaListAsync();
    return snippets.map(s => s.label);
}

export async function listRoles(): Promise<string[]> {
    const roles = await EdgeProxy.GetRoleListAsync();
    return roles.map(r => r.name);
}

export async function previewNginxConfig(blocks: EdgeBlockData[]): Promise<string> {
    return EdgeProxy.NginxConfigPreview(blocks);
}
