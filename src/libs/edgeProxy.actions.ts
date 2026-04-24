'use server';
import path from "path";
import fs from 'fs/promises';
import { EdgeProxyHost, HttpHost, HttpHostMeta, SslCertKey } from "@/types/types";
import { AppEnv } from "./appEnv";
import { EdgeBlockData, EdgeDirectives } from "./edgeDirective";

namespace DataPaths {
    const Root = 'data';
    export const HttpHost = path.join(Root, 'http-hosts');
    export const SslCertKey = path.join(Root, 'ssl');
}

namespace NginxPaths {
    const Root = AppEnv.nginxBasePath
    export const EnabledHttpHost = path.join(Root, 'sites-enabled')
    export const SslCertKey = path.join(Root, 'ssl');
}

//#region HttpHost
export async function GetHttpHostAsync(httpHostName: string): Promise<HttpHost> {
    const httpHostPath: string = path.join(DataPaths.HttpHost, `${httpHostName}.json`);
    const httpHostContent: string = await fs.readFile(httpHostPath, 'utf8');
    const httpHost: HttpHost = JSON.parse(httpHostContent);
    return httpHost;
}

export async function SaveHttpHostAsync(httpHostName: string, httpHost: HttpHost): Promise<void> {
    const httpHostPath: string = path.join(DataPaths.HttpHost, `${httpHostName}.json`);
    await fs.writeFile(httpHostPath, JSON.stringify(httpHost, null, 2))
    await SaveHttpHostMetaAsync(httpHostName, { label: httpHostName })
}

export async function DeleteHttpHostAsync(httpHostName: string): Promise<void> {
    const httpHostPath: string = path.join(DataPaths.HttpHost, `${httpHostName}.json`);
    await DisabledHttpHostAsync(httpHostName)
    await fs.rm(httpHostPath)
}

export async function EnableHttpHostAsync(httpHostName: string): Promise<void> {
    const httpHost: HttpHost = await GetHttpHostAsync(httpHostName)
    const nHttpHostPath: string = path.join(NginxPaths.EnabledHttpHost, httpHostName)
    const nginxConfig = BuildNginxConfig(httpHost);
    await fs.writeFile(nHttpHostPath, JSON.stringify(nginxConfig, null, 2));
}

export async function DisabledHttpHostAsync(httpHostName: string): Promise<void> {
    const nHttpHostPath: string = path.join(NginxPaths.EnabledHttpHost, httpHostName)
    await fs.rm(nHttpHostPath)
}

export async function GetHttpHostMetaListAsync(): Promise<HttpHostMeta[]> {
    return await Promise.all(
        (await fs.readdir(DataPaths.HttpHost))
            .filter((f: string) => f.endsWith('.json'))
            .map((f: string) => GetHttpHostMetaAsync(f.slice(0, -5)))
    )
}

export async function GetHttpHostMetaAsync(httpHostName: string): Promise<HttpHostMeta> {
    try {
        const httpHostMetaPath: string = path.join(DataPaths.HttpHost, `${httpHostName}.meta`);
        const httpHostMetaContent: string = await fs.readFile(httpHostMetaPath, 'utf8');
        const httpHostMeta: HttpHostMeta = JSON.parse(httpHostMetaContent);
        return httpHostMeta;
    }
    catch {
        return {} as HttpHostMeta
    }
}

async function SaveHttpHostMetaAsync(httpHostName: string, httpHostMeta: Partial<HttpHostMeta>): Promise<void> {
    const httpHostMetaPath: string = path.join(DataPaths.HttpHost, `${httpHostName}.meta`);
    const oldData = await GetHttpHostMetaAsync(httpHostName);
    await fs.writeFile(httpHostMetaPath, JSON.stringify({
        ...oldData,
        ...httpHostMeta
    }, null, 2))
}
//#endregion

//#region SslCertKey
export async function GetSslCertKeyListAsync(): Promise<SslCertKey[]> {
    return await Promise.all(
        (await fs.readdir(DataPaths.SslCertKey))
            .filter((f: string) => f.endsWith('.json'))
            .map((f: string) => GetSslCertKeyAsync(f.slice(0, -5)))
    )
}

export async function GetSslCertKeyAsync(sslCertKeyName: string): Promise<SslCertKey> {
    const sslCertKeyPath: string = path.join(DataPaths.SslCertKey, `${sslCertKeyName}.json`);
    const sslCertKeyContent: string = await fs.readFile(sslCertKeyPath, 'utf8');
    const sslCertKey: SslCertKey = JSON.parse(sslCertKeyContent);
    return sslCertKey;
}

export async function SaveSslCertKeyAsync(sslCertKey: SslCertKey): Promise<void> {
    const sslCertKeyPath: string = path.join(DataPaths.SslCertKey, `${sslCertKey.meta.label}.json`);
    sslCertKey.meta.usedBy = [...(new Set(sslCertKey.meta.usedBy))] // Removes duplicates
    await fs.writeFile(sslCertKeyPath, JSON.stringify(sslCertKey, null, 2))
}

export async function DeleteSslCertKeyAsync(sslCertKeyName: string): Promise<void> {
    const sslCertKeyPath: string = path.join(DataPaths.SslCertKey, `${sslCertKeyName}.json`);
    await DisabledSslCertKeyAsync(sslCertKeyName)
    await fs.rm(sslCertKeyPath)
}

export async function EnableSslCertKeyAsync(sslCertKeyName: string): Promise<void> {
    const sslCertKey: SslCertKey = await GetSslCertKeyAsync(sslCertKeyName)
    const nSslCerPath: string = path.join(NginxPaths.SslCertKey, `${sslCertKeyName}.cert`)
    const nSslKeyPath: string = path.join(NginxPaths.SslCertKey, `${sslCertKeyName}.key`)
    await fs.writeFile(nSslCerPath, sslCertKey.cert);
    await fs.writeFile(nSslKeyPath, sslCertKey.key);
}

export async function DisabledSslCertKeyAsync(sslCertKeyName: string): Promise<void> {
    const nSslCerPath: string = path.join(NginxPaths.SslCertKey, `${sslCertKeyName}.cert`)
    const nSslKeyPath: string = path.join(NginxPaths.SslCertKey, `${sslCertKeyName}.key`)
    await fs.rm(nSslCerPath);
    await fs.rm(nSslKeyPath);
}
//#endregion

export function BuildNginxConfig(blocks: EdgeBlockData[]): string {
    function _build(block: EdgeBlockData, indent: number): string {
        const [name, ...rest] = block;
        const pad = '    '.repeat(indent);
        const directive = EdgeDirectives.find(d => d.key === name);
        const nonCtxParams = directive?.params.filter(p => p.primitive !== 'context') ?? [];
        const hasContext = directive?.params.some(p => p.primitive === 'context') ?? false;

        const applySlots = (vals: unknown[]) =>
            vals.map((v, i) => {
                if (!v && v !== 0) return '';
                const slot = nonCtxParams[i];
                if (slot?.primitive === 'ssl') {
                    const sub = String(v) + (name === 'ssl_certificate_key' ? '.key' : '.cert');
                    return path.join('/etc/nginx', DataPaths.SslCertKey, sub);
                }
                const suffix = slot?.suffix ?? slot?.subSlot?.suffix;
                return suffix ? `${v}${suffix}` : String(v);
            }).filter(Boolean);

        if (hasContext) {
            const slotVals = rest.slice(0, nonCtxParams.length);
            const children = (rest[nonCtxParams.length] ?? []) as EdgeBlockData[];
            const inner = children.map(c => _build(c, indent + 1)).filter(Boolean).join('\n');
            const params = applySlots(slotVals);
            const header = params.length ? `${name} ${params.join(' ')}` : name;
            return `${pad}${header} {\n${inner}\n${pad}}`;
        }

        const values = applySlots(rest);
        if (values.length === 0) return '';
        return `${pad}${name} ${values.join(' ')};`;
    }

    return blocks.map(b => _build(b, 0)).filter(Boolean).join('\n') + '\n';
}