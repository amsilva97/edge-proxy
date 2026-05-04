'use server';
import * as NginxActions from './nginx.actions';
import path from "path";
import fs from 'fs/promises';
import bcrypt from 'bcryptjs';
import { HttpHost, HttpHostMeta, HttpProxyType, Role, Snippet, SnippetMeta, SslCertKey, SslCertKeyMeta } from "@/types/types";
import { AppEnv } from "./appEnv";
import { EdgeBlockData, EdgeDirectiveContext, EdgeDirectives, EdgePrimitive } from "./edgeDirective";

namespace DataPaths {
    const Root = 'data';
    export const HttpHosts = path.join(Root, 'http-hosts');
    export const Snippets = path.join(Root, 'snippets');
    export const SslCertKeys = path.join(Root, 'ssl');
    export const Roles = path.join(Root, 'roles')
}

namespace NginxPaths {
    const Root = AppEnv.nginxBasePath;
    export const HttpHosts = path.join(Root, 'sites-enabled');
    export const Snippets = path.join(Root, 'snippets');
    export const SslCertKeys = path.join(Root, 'ssl');
    export const Roles = path.join(Root, 'roles')
}

//#region HttpHost
export async function GetHttpHostAsync(httpHostName: string): Promise<HttpHost> {
    const httpHostPath: string = path.join(DataPaths.HttpHosts, `${httpHostName}.json`);
    const httpHostContent: string = await fs.readFile(httpHostPath, 'utf8');
    const httpHost: HttpHost = JSON.parse(httpHostContent);
    return httpHost;
}

export async function SaveHttpHostAsync(httpHostName: string, httpHost: HttpHost): Promise<HttpHostMeta> {
    const httpHostPath: string = path.join(DataPaths.HttpHosts, `${httpHostName}.json`);
    const oldHttpHostMeta = await TryGetHttpHostMetaAsync(httpHostName);
    const oldUsedSsls = oldHttpHostMeta?.usedSsls ?? []
    const newUsedSsls = FindUsedDirectiveValues(httpHost, 'ssl')
    const oldUsedSnippets = oldHttpHostMeta?.usedSnippets ?? []
    const newUsedSnippets = FindUsedDirectiveValues(httpHost, 'snippet')
    const oldRoles = oldHttpHostMeta?.usedRoles ?? []
    const newRoles = FindUsedDirectiveValues(httpHost, 'role')

    // Save HttpHost
    await fs.mkdir(path.dirname(httpHostPath), { recursive: true });
    await fs.writeFile(httpHostPath, JSON.stringify(httpHost, null, 2));
    await SaveHttpHostMetaAsync(httpHostName, {
        label: httpHostName,
        usedSsls: newUsedSsls,
        usedSnippets: newUsedSnippets,
        usedRoles: newRoles
        // type: // We dont set this because it will override previous type
    });

    // Update Enabled Config
    if (oldHttpHostMeta.isEnabled) {
        await EnableHttpHostAsync(httpHostName)
    }

    // Update Attachments
    for (const oldUsedSsl of oldUsedSsls) await DetachSslCertKeyToHost(oldUsedSsl, httpHostName)
    for (const newUsedSsl of newUsedSsls) await AttachSslCertKeyToHost(newUsedSsl, httpHostName)
    for (const oldUsedSnippet of oldUsedSnippets) await DetachSnippetFromHost(oldUsedSnippet, httpHostName)
    for (const newUsedSnippet of newUsedSnippets) await AttachSnippetToHost(newUsedSnippet, httpHostName)
    for (const oldRole of oldRoles) await DetachRoleFromHost(oldRole, httpHostName)
    for (const newRole of newRoles) await AttachRoleToHost(newRole, httpHostName)
    return await GetHttpHostMetaAsync(httpHostName)
}

export async function DeleteHttpHostAsync(httpHostName: string): Promise<void> {
    const httpHostPath: string = path.join(DataPaths.HttpHosts, `${httpHostName}.json`);
    await DisabledHttpHostAsync(httpHostName);
    await fs.rm(httpHostPath, { force: true });
}

export async function EnableHttpHostAsync(httpHostName: string): Promise<HttpHostMeta> {
    try {
        const httpHost: HttpHost = await GetHttpHostAsync(httpHostName);
        const nHttpHostPath: string = path.join(NginxPaths.HttpHosts, httpHostName);
        const nginxConfig = BuildNginxConfig(httpHost);
        await fs.writeFile(nHttpHostPath, nginxConfig);
        await SaveHttpHostMetaAsync(httpHostName, { isEnabled: true });
        await NginxActions.ReloadNginxAsync();
        return await GetHttpHostMetaAsync(httpHostName)
    }
    catch (err: any) {
        await DisabledHttpHostAsync(httpHostName)
        throw err
    }
}

export async function DisabledHttpHostAsync(httpHostName: string): Promise<HttpHostMeta> {
    const nHttpHostPath: string = path.join(NginxPaths.HttpHosts, httpHostName);
    await fs.rm(nHttpHostPath, { force: true });
    await SaveHttpHostMetaAsync(httpHostName, { isEnabled: false });
    await NginxActions.ReloadNginxAsync();
    return await GetHttpHostMetaAsync(httpHostName)
}

export async function GetHttpHostMetaListAsync(): Promise<HttpHostMeta[]> {
    try {
        return await Promise.all(
            (await fs.readdir(DataPaths.HttpHosts))
                .filter((f: string) => f.endsWith('.json'))
                .map((f: string) => GetHttpHostMetaAsync(f.slice(0, -5)))
        );
    } catch (err: any) {
        if (err?.code == 'ENOENT' && err?.path == DataPaths.HttpHosts) return []
        throw err
    }
}

export async function GetHttpHostMetaAsync(httpHostName: string): Promise<HttpHostMeta> {
    const httpHostMetaPath: string = path.join(DataPaths.HttpHosts, `${httpHostName}.meta`);
    const httpHostMetaContent: string = await fs.readFile(httpHostMetaPath, 'utf8');
    const httpHostMeta: HttpHostMeta = JSON.parse(httpHostMetaContent);
    return httpHostMeta;
}

export async function TryGetHttpHostMetaAsync(httpHostName: string): Promise<HttpHostMeta> {
    try {
        return await GetHttpHostMetaAsync(httpHostName)
    } catch (err: any) {
        if (err?.code == 'ENOENT') return {} as HttpHostMeta
        throw err
    }
}

async function SaveHttpHostMetaAsync(httpHostName: string, httpHostMeta: Partial<HttpHostMeta>): Promise<HttpHostMeta> {
    const httpHostMetaPath: string = path.join(DataPaths.HttpHosts, `${httpHostName}.meta`);
    const oldData = await TryGetHttpHostMetaAsync(httpHostName);
    const newData = {
        ...oldData,
        ...httpHostMeta
    }
    await fs.writeFile(httpHostMetaPath, JSON.stringify(newData, null, 2));
    return newData
}

function FindUsedDirectiveValues(httpHost: HttpHost, primitiveKey: EdgePrimitive): string[] {
    const values: Set<string> = new Set()
    function walk(blocks: EdgeBlockData[]) {
        for (const block of blocks) {
            const [name, ...rest] = block;
            const directive = EdgeDirectives.find(d => d.key === name);
            if (!directive) continue;
            const nonCtxParams = directive.params.filter(p => p.primitive !== 'context');
            const hasContext = directive.params.some(p => p.primitive === 'context');
            nonCtxParams.forEach((param, i) => {
                if (param.primitive === primitiveKey && rest[i]) values.add(String(rest[i]));
            });
            if (hasContext) {
                const children = (rest[nonCtxParams.length] ?? []) as EdgeBlockData[];
                walk(children);
            }
        }
    }
    walk(httpHost)
    return [...values]
}

//#endregion

//#region HttpHost Quick Host
export async function SaveHttpProxyHostAsync(httpHostName: string, source: string,
    destination: string, sslCertKeyName: string | null, accessRole: string | null): Promise<HttpHostMeta> {
    const httpHost = []
    const normalizedDestination = destination.replace(/^https?:\/\//, '');

    // Redirect Server Context
    if (sslCertKeyName) {
        const redirectServerDirectives = [["listen", 80], ["server_name", source], ["return", "301 https://$host$request_uri"]]
        httpHost.push(["server", redirectServerDirectives])
    }

    // Main Server Context
    const location = ["location", "/", [["proxy_pass", 'http://' + normalizedDestination]]]
    const basicAuth = accessRole
        ? [["auth_basic", '"Authorization Required"'], ["auth_basic_user_file", accessRole]]
        : []
    const sslCertKeyDirectives = sslCertKeyName
        ? [["ssl_certificate", sslCertKeyName], ["ssl_certificate_key", sslCertKeyName]]
        : []
    const mainServerDirectives = [["listen", sslCertKeyName ? 443 : 80, "", sslCertKeyName ? "ssl" : ""], ["server_name", source], ...basicAuth, ...sslCertKeyDirectives, location]
    httpHost.push(["server", mainServerDirectives])

    // Save Host
    await SaveHttpHostAsync(httpHostName, httpHost as HttpHost)
    return await SaveHttpHostMetaAsync(httpHostName, {
        type: HttpProxyType.Proxy,
        quickSetup: {
            source: source,
            destination: normalizedDestination,
            ssl: sslCertKeyName,
            accessRole: accessRole
        }
    })
}

export async function SaveHttpLoadbalancerHostAsync(httpHostName: string, source: string,
    serverList: string[], sslCertKeyName: string | null, accessRole: string | null): Promise<HttpHostMeta> {
    const httpHost = []

    // Upstream block
    const upstreamServers = serverList.map(s => ["server", s])
    httpHost.push(["upstream", "backends", upstreamServers])

    // SSL redirect server
    if (sslCertKeyName) {
        const redirectServerDirectives = [["listen", 80], ["server_name", source], ["return", "301 https://$host$request_uri"]]
        httpHost.push(["server", redirectServerDirectives])
    }

    // Main server
    const location = ["location", "/", [["proxy_pass", "http://backends"]]]
    const basicAuth = accessRole
        ? [["auth_basic", '"Authorization Required"'], ["auth_basic_user_file", accessRole]]
        : []
    const sslCertKeyDirectives = sslCertKeyName
        ? [["ssl_certificate", sslCertKeyName], ["ssl_certificate_key", sslCertKeyName]]
        : []
    const mainServerDirectives = [["listen", sslCertKeyName ? 443 : 80, "", sslCertKeyName ? "ssl" : ""], ["server_name", source], ...basicAuth, ...sslCertKeyDirectives, location]
    httpHost.push(["server", mainServerDirectives])

    await SaveHttpHostAsync(httpHostName, httpHost as HttpHost)
    return await SaveHttpHostMetaAsync(httpHostName, {
        type: HttpProxyType.Loadbalancer,
        quickSetup: {
            source: source,
            servers: serverList.join(','),
            ssl: sslCertKeyName,
            accessRole: accessRole
        }
    })
}

export async function SaveHttpRedirectAsync(httpHostName: string, source: string,
    destination: string, isPermanent: boolean): Promise<HttpHostMeta> {
    const statusCode = isPermanent ? 301 : 302
    const normalizedDestination = destination.replace(/^https?:\/\//, '')
    const httpHost = [
        ["server", [
            ["listen", 80],
            ["server_name", source],
            ["return", `${statusCode} https://${normalizedDestination}`]
        ]]
    ]

    await SaveHttpHostAsync(httpHostName, httpHost as HttpHost)
    return await SaveHttpHostMetaAsync(httpHostName, {
        type: HttpProxyType.Redirect,
        quickSetup: {
            source,
            destination: normalizedDestination,
            isPermanent: String(isPermanent)
        }
    })
}
//#endregion

//#region SslCertKey
export async function GetSslCertKeyMetaListAsync(): Promise<SslCertKeyMeta[]> {
    try {
        return await Promise.all(
            (await fs.readdir(DataPaths.SslCertKeys))
                .filter((f: string) => f.endsWith('.json'))
                .map((f: string) => GetSslCertKeyMetaAsync(f.slice(0, -5)))
        );
    } catch (err: any) {
        if (err?.code == 'ENOENT' && err?.path == DataPaths.SslCertKeys) return []
        throw err
    }
}

export async function GetSslCertKeyAsync(sslCertKeyName: string): Promise<SslCertKey> {
    const sslCertKeyPath: string = path.join(DataPaths.SslCertKeys, `${sslCertKeyName}.json`);
    const sslCertKeyContent: string = await fs.readFile(sslCertKeyPath, 'utf8');
    const sslCertKey: SslCertKey = JSON.parse(sslCertKeyContent);
    return sslCertKey;
}

export async function SaveSslCertKeyAsync(sslCertKeyName: string, sslCertKey: SslCertKey): Promise<void> {
    const sslCertKeyPath: string = path.join(DataPaths.SslCertKeys, `${sslCertKeyName}.json`);
    await fs.mkdir(path.dirname(sslCertKeyPath), { recursive: true });
    await fs.writeFile(sslCertKeyPath, JSON.stringify(sslCertKey, null, 2));
    await SaveSslCertKeyMetaAsync(sslCertKeyName, { label: sslCertKeyName });
}

export async function DeleteSslCertKeyAsync(sslCertKeyName: string): Promise<void> {
    const sslCertKeyPath: string = path.join(DataPaths.SslCertKeys, `${sslCertKeyName}.json`);
    await DisabledSslCertKeyAsync(sslCertKeyName);
    await fs.rm(sslCertKeyPath, { force: true });
}

export async function EnableSslCertKeyAsync(sslCertKeyName: string): Promise<void> {
    const sslCertKey: SslCertKey = await GetSslCertKeyAsync(sslCertKeyName);
    const nSslCerPath: string = path.join(NginxPaths.SslCertKeys, `${sslCertKeyName}.cert`);
    const nSslKeyPath: string = path.join(NginxPaths.SslCertKeys, `${sslCertKeyName}.key`);
    await fs.writeFile(nSslCerPath, sslCertKey.cert);
    await fs.writeFile(nSslKeyPath, sslCertKey.key);
    await SaveSslCertKeyMetaAsync(sslCertKeyName, { isEnabled: true });
    await NginxActions.ReloadNginxAsync();
}

export async function DisabledSslCertKeyAsync(sslCertKeyName: string): Promise<void> {
    const nSslCerPath: string = path.join(NginxPaths.SslCertKeys, `${sslCertKeyName}.cert`);
    const nSslKeyPath: string = path.join(NginxPaths.SslCertKeys, `${sslCertKeyName}.key`);
    await fs.rm(nSslCerPath, { force: true });
    await fs.rm(nSslKeyPath, { force: true });
    await SaveSslCertKeyMetaAsync(sslCertKeyName, { isEnabled: false });
    await NginxActions.ReloadNginxAsync();
}

export async function GetSslCertKeyMetaAsync(sslCertKeyName: string): Promise<SslCertKeyMeta> {
    const sslCertKeyMetaPath: string = path.join(DataPaths.SslCertKeys, `${sslCertKeyName}.meta`);
    const sslCertKeyMetaContent: string = await fs.readFile(sslCertKeyMetaPath, 'utf8');
    const sslCertKeyMeta: SslCertKeyMeta = JSON.parse(sslCertKeyMetaContent);
    return sslCertKeyMeta;
}

export async function TryGetSslCertKeyMetaAsync(sslCertKeyName: string): Promise<SslCertKeyMeta> {
    try {
        return await GetSslCertKeyMetaAsync(sslCertKeyName)
    } catch (err: any) {
        if (err?.code == 'ENOENT') return {} as SslCertKeyMeta
        throw err
    }
}

async function SaveSslCertKeyMetaAsync(sslCertKeyName: string, sslCertKeyMeta: Partial<SslCertKeyMeta>): Promise<void> {
    const sslCertKeyMetaPath: string = path.join(DataPaths.SslCertKeys, `${sslCertKeyName}.meta`);
    const oldData = await TryGetSslCertKeyMetaAsync(sslCertKeyName);
    await fs.writeFile(sslCertKeyMetaPath, JSON.stringify({
        ...oldData,
        ...sslCertKeyMeta
    }, null, 2));
}

async function AttachSslCertKeyToHost(sslCertKeyName: string, hostName: string) {
    const oldMeta = await GetSslCertKeyMetaAsync(sslCertKeyName)
    const oldAttachments = new Set(oldMeta.attachedTo)
    oldAttachments.add(hostName)
    await SaveSslCertKeyMetaAsync(sslCertKeyName, {
        attachedTo: [...oldAttachments]
    })
}

async function DetachSslCertKeyToHost(sslCertKeyName: string, hostName: string) {
    const oldMeta = await GetSslCertKeyMetaAsync(sslCertKeyName)
    const oldAttachments = new Set(oldMeta.attachedTo)
    oldAttachments.delete(hostName)
    await SaveSslCertKeyMetaAsync(sslCertKeyName, {
        attachedTo: [...oldAttachments]
    })
}
//#endregion

//#region Snippets
export async function GetSnippetMetaListAsync(): Promise<SnippetMeta[]> {
    try {
        return await Promise.all(
            (await fs.readdir(DataPaths.Snippets))
                .filter((f: string) => f.endsWith('.json'))
                .map((f: string) => GetSnippetMetaAsync(f.slice(0, -5)))
        );
    } catch (err: any) {
        if (err?.code == 'ENOENT' && err?.path == DataPaths.Snippets) return []
        throw err
    }
}

export async function GetSnippetAsync(snippetName: string): Promise<Snippet> {
    const snippetPath: string = path.join(DataPaths.Snippets, `${snippetName}.json`);
    const snippetContent: string = await fs.readFile(snippetPath, 'utf8');
    const snippet: Snippet = JSON.parse(snippetContent);
    return snippet;
}

export async function SaveSnippetAsync(snippetName: string, snippet: Snippet): Promise<void> {
    const snippetPath: string = path.join(DataPaths.Snippets, `${snippetName}.json`);
    const nSnippetPath: string = path.join(NginxPaths.Snippets, snippetName);
    const nginxConfig = BuildNginxConfig(snippet);
    await fs.mkdir(path.dirname(snippetPath), { recursive: true });
    await fs.mkdir(path.dirname(nSnippetPath), { recursive: true });
    await fs.writeFile(snippetPath, JSON.stringify(snippet, null, 2));
    await fs.writeFile(nSnippetPath, nginxConfig);
    await SaveSnippetMetaAsync(snippetName, { label: snippetName });
    await NginxActions.ReloadNginxAsync();
}

export async function DeleteSnippetAsync(snippetName: string): Promise<void> {
    const snippetPath: string = path.join(DataPaths.Snippets, `${snippetName}.json`);
    const nSnippetPath: string = path.join(NginxPaths.Snippets, `${snippetName}`);
    await fs.rm(snippetPath, { force: true });
    await fs.rm(nSnippetPath, { force: true });
}

export async function GetSnippetMetaAsync(snippetName: string): Promise<SnippetMeta> {
    const snippetMetaPath: string = path.join(DataPaths.Snippets, `${snippetName}.meta`);
    const snippetMetaContent: string = await fs.readFile(snippetMetaPath, 'utf8');
    const snippetMeta: SnippetMeta = JSON.parse(snippetMetaContent);
    return snippetMeta;
}

export async function TryGetSnippetMetaAsync(snippetName: string): Promise<SnippetMeta> {
    try {
        return await GetSnippetMetaAsync(snippetName)
    } catch (err: any) {
        if (err?.code == 'ENOENT') return {} as SnippetMeta
        throw err
    }
}

async function SaveSnippetMetaAsync(snippetName: string, snippetMeta: Partial<SnippetMeta>): Promise<void> {
    const snippetMetaPath: string = path.join(DataPaths.Snippets, `${snippetName}.meta`);
    const oldData = await TryGetSnippetMetaAsync(snippetName);
    await fs.writeFile(snippetMetaPath, JSON.stringify({
        ...oldData,
        ...snippetMeta
    }, null, 2));
}

async function AttachSnippetToHost(snippetName: string, hostName: string) {
    const oldMeta = await GetSnippetMetaAsync(snippetName)
    const oldAttachments = new Set(oldMeta.attachedTo)
    oldAttachments.add(hostName)
    await SaveSnippetMetaAsync(snippetName, {
        attachedTo: [...oldAttachments]
    })
}

async function DetachSnippetFromHost(snippetName: string, hostName: string) {
    const oldMeta = await GetSnippetMetaAsync(snippetName)
    const oldAttachments = new Set(oldMeta.attachedTo)
    oldAttachments.delete(hostName)
    await SaveSnippetMetaAsync(snippetName, {
        attachedTo: [...oldAttachments]
    })
}
//#endregion

//#region Roles
export async function GetRoleListAsync(): Promise<Role[]> {
    try {
        return await Promise.all(
            (await fs.readdir(DataPaths.Roles))
                .map((f: string) => GetRoleAsync(f))
        );
    } catch (err: any) {
        if (err?.code == 'ENOENT' && err?.path == DataPaths.Roles) return []
        throw err
    }
}

export async function GetRoleAsync(roleName: string): Promise<Role> {
    const rolePath: string = path.join(DataPaths.Roles, `${roleName}`);
    const roleContent: string = await fs.readFile(rolePath, 'utf8');
    const role: Role = JSON.parse(roleContent);
    return role;
}

export async function SaveRoleAsync(role: Role): Promise<void> {
    const rolePath: string = path.join(DataPaths.Roles, `${role.name}`);
    await fs.mkdir(path.dirname(rolePath), { recursive: true });
    await fs.writeFile(rolePath, JSON.stringify(role, null, 2));

    const allRoles = (await GetRoleListAsync()).map(r => r.name === role.name ? role : r);
    const roleMap = new Map(allRoles.map(r => [r.name, r]));

    const toUpdate = bfsRoles(role.name, name =>
        allRoles.filter(r => r.inheritedBy?.includes(name)).map(r => r.name)
    );

    await Promise.all([...toUpdate].map(name => WriteRoleHtpasswdAsync(roleMap.get(name)!, roleMap)));
}

function bfsRoles(seed: string, neighbors: (name: string) => string[]): Set<string> {
    const visited = new Set<string>([seed]);
    const queue = [seed];
    while (queue.length > 0) {
        for (const name of neighbors(queue.shift()!)) {
            if (!visited.has(name)) {
                visited.add(name);
                queue.push(name);
            }
        }
    }
    return visited;
}

async function WriteRoleHtpasswdAsync(role: Role, roleMap: Map<string, Role>): Promise<void> {
    const nRolePath: string = path.join(NginxPaths.Roles, `${role.name}`);
    await fs.mkdir(path.dirname(nRolePath), { recursive: true });

    const members = bfsRoles(role.name, name => roleMap.get(name)?.inheritedBy ?? []);

    const lines = [...members]
        .map(name => roleMap.get(name))
        .filter((r): r is Role => !!r?.pass)
        .map(r => `${r.name}:${r.pass}`);

    await fs.writeFile(nRolePath, lines.join('\n') + '\n');
    await NginxActions.ReloadNginxAsync();
}

export async function SetRolePasswordAsync(role: Role, password: string): Promise<void> {
    role.pass = await bcrypt.hash(password, 10);
    await SaveRoleAsync(role);
}

export async function ClearRolePasswordAsync(role: Role): Promise<void> {
    role.pass = null;
    await SaveRoleAsync(role);
}

export async function GrantRoleAsync(role: Role, roleToGrant: Role): Promise<void> {
    const inherits: Set<string> = new Set<string>(roleToGrant.inheritedBy ?? [])
    inherits.add(role.name)
    roleToGrant.inheritedBy = [...inherits]
    await SaveRoleAsync(roleToGrant)
}

export async function RevokeRoleAsync(role: Role, roleToRevoke: Role): Promise<void> {
    const inherits: Set<string> = new Set<string>(roleToRevoke.inheritedBy ?? [])
    inherits.delete(role.name)
    roleToRevoke.inheritedBy = [...inherits]
    await SaveRoleAsync(roleToRevoke)
}

async function AttachRoleToHost(roleName: string, hostName: string) {
    const role = await GetRoleAsync(roleName)
    const oldAttachments = new Set(role.attachedTo)
    oldAttachments.add(hostName)
    role.attachedTo = [...oldAttachments]
    await SaveRoleAsync(role)
}

async function DetachRoleFromHost(roleName: string, hostName: string) {
    const role = await GetRoleAsync(roleName)
    const oldAttachments = new Set(role.attachedTo)
    oldAttachments.delete(hostName)
    role.attachedTo = [...oldAttachments]
    await SaveRoleAsync(role)
}
//#endregion

export async function NginxConfigPreview(blocks: EdgeBlockData[]): Promise<string> {
    return BuildNginxConfig(blocks)
}

function BuildNginxConfig(blocks: EdgeBlockData[]): string {
    function childContext(name: string): EdgeDirectiveContext {
        const val = (EdgeDirectiveContext as Record<string, unknown>)[name];
        if (typeof val === 'number') return val as EdgeDirectiveContext;
        return EdgeDirectiveContext.any;
    }

    function _build(block: EdgeBlockData, indent: number, context: EdgeDirectiveContext = EdgeDirectiveContext.any): string {
        const [name, ...rest] = block;
        const pad = '    '.repeat(indent);
        const directive = EdgeDirectives.find(d => d.key === name && (d.context & context) !== 0)
            ?? EdgeDirectives.find(d => d.key === name);
        const nonCtxParams = directive?.params.filter(p => p.primitive !== 'context') ?? [];
        const hasContext = directive?.params.some(p => p.primitive === 'context') ?? false;

        const applySlots = (vals: unknown[]) =>
            vals.map((v, i) => {
                if (!v && v !== 0) return '';
                const slot = nonCtxParams[i];
                if (slot?.primitive === 'ssl') {
                    const sub = String(v) + (name === 'ssl_certificate_key' ? '.key' : '.cert');
                    return path.join(NginxPaths.SslCertKeys, sub);
                }
                if (slot?.primitive === 'snippet') {
                    return path.join(NginxPaths.Snippets, String(v));
                }
                if (slot?.primitive === 'role') {
                    return path.join(NginxPaths.Roles, String(v));
                }
                const suffix = slot?.suffix ?? slot?.subSlot?.suffix;
                return suffix ? `${v}${suffix}` : String(v);
            }).filter(Boolean);

        const nextCtx = childContext(name);
        if (hasContext) {
            const slotVals = rest.slice(0, nonCtxParams.length);
            const children = (rest[nonCtxParams.length] ?? []) as EdgeBlockData[];
            const inner = children.map(c => _build(c, indent + 1, nextCtx)).filter(Boolean).join('\n');
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