'use server';
import * as NginxActions from './nginx.actions';
import path from "path";
import fs from 'fs/promises';
import bcrypt from 'bcryptjs';
import { HttpHost, HttpHostMeta, HttpProxyType, Role, Snippet, SnippetMeta, SslCertKey, SslCertKeyMeta } from "@/types/types";
import { AppEnv } from "./appEnv";
import { EdgeBlockData, EdgeDirectiveContext, EdgeDirectives, EdgePrimitive, EdgeSlot } from "./edgeDirective";

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

export async function FindOrphanHttpHost(): Promise<string[]> {
    try {
        const nginxFiles = await fs.readdir(NginxPaths.HttpHosts);
        const dataFiles = new Set(
            (await fs.readdir(DataPaths.HttpHosts).catch(() => [] as string[]))
                .filter((f: string) => f.endsWith('.json'))
                .map((f: string) => f.slice(0, -5))
        );
        // compare by base name so files like "myhost.conf" match data entry "myhost"
        return nginxFiles.filter(f => !dataFiles.has(path.parse(f).name));
    } catch (err: any) {
        if (err?.code === 'ENOENT') return [];
        throw err;
    }
}

export async function ImportOrphanHttpHost(httpHostFileName: string): Promise<HttpHostMeta> {
    // strip extension (.conf etc.) to get the canonical host name used for data storage
    const httpHostName = path.parse(httpHostFileName).name;

    const dataPath = path.join(DataPaths.HttpHosts, `${httpHostName}.json`);
    const isOrphaned = await fs.access(dataPath).then(() => false).catch(() => true);
    if (!isOrphaned) throw new Error(`${httpHostName} already exists`);

    const nginxFilePath = path.join(NginxPaths.HttpHosts, httpHostFileName);
    const nginxConfig = await fs.readFile(nginxFilePath, 'utf8');
    const httpHost: HttpHost = ParseNginxConfig(nginxConfig);

    // Remove the original file when it has an extension — EnableHttpHostAsync will
    // write the canonical extensionless version, so this prevents leftover .conf files
    if (httpHostFileName !== httpHostName) {
        await fs.rm(nginxFilePath, { force: true });
    }

    await SaveHttpHostAsync(httpHostName, httpHost);
    return await EnableHttpHostAsync(httpHostName);
}

export async function ImportRawHttpHostAsync(httpHostName: string, rawNginxConfig: string): Promise<HttpHostMeta> {
    const dataPath = path.join(DataPaths.HttpHosts, `${httpHostName}.json`);
    const isManaged = await fs.access(dataPath).then(() => true).catch(() => false);
    if (isManaged) throw new Error(`${httpHostName} already exists`);

    const nginxFilePath = path.join(NginxPaths.HttpHosts, httpHostName);
    await fs.mkdir(path.dirname(nginxFilePath), { recursive: true });
    await fs.writeFile(nginxFilePath, rawNginxConfig, 'utf8');
    return ImportOrphanHttpHost(httpHostName);
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
    const location = ["location", "/", [
        ["proxy_pass", 'http://' + normalizedDestination],
        ["proxy_set_header", "Host", "$host"],
        ["proxy_set_header", "X-Real-IP", "$remote_addr"],
        ["proxy_set_header", "X-Forwarded-For", "$proxy_add_x_forwarded_for"],
        ["proxy_set_header", "X-Forwarded-Proto", "$scheme"],
    ]]
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

export async function SaveHttpRedirectHostAsync(httpHostName: string, source: string,
    destination: string, isPermanent: boolean): Promise<HttpHostMeta> {
    const statusCode = isPermanent ? 301 : 302
    const normalizedDestination = destination.replace(/^https?:\/\//, '')
    const httpHost = [
        ["server", [
            ["listen", 80],
            ["server_name", source],
            ["return", `${statusCode} http://${normalizedDestination}`]
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

export async function SaveHttpStaticHostAsync(httpHostName: string, source: string,
    pathToFile: string, isSpa: boolean, sslCertKeyName: string | null, accessRole: string | null): Promise<HttpHostMeta> {
    const httpHost = []

    // SSL redirect server
    if (sslCertKeyName) {
        const redirectServerDirectives = [["listen", 80], ["server_name", source], ["return", "301 https://$host$request_uri"]]
        httpHost.push(["server", redirectServerDirectives])
    }

    // Main server
    const location = ["location", "/", [["try_files", "$uri", "$uri/", isSpa ? "/index.html" : "=404"]]]
    const basicAuth = accessRole
        ? [["auth_basic", '"Authorization Required"'], ["auth_basic_user_file", accessRole]]
        : []
    const sslCertKeyDirectives = sslCertKeyName
        ? [["ssl_certificate", sslCertKeyName], ["ssl_certificate_key", sslCertKeyName]]
        : []
    const mainServerDirectives = [
        ["listen", sslCertKeyName ? 443 : 80, "", sslCertKeyName ? "ssl" : ""],
        ["server_name", source],
        ["root", pathToFile],
        ["index", "index.html"],
        ...basicAuth,
        ...sslCertKeyDirectives,
        location
    ]
    httpHost.push(["server", mainServerDirectives])

    await SaveHttpHostAsync(httpHostName, httpHost as HttpHost)
    return await SaveHttpHostMetaAsync(httpHostName, {
        type: HttpProxyType.Static,
        quickSetup: {
            source,
            pathToFile,
            isSpa: String(isSpa),
            ssl: sslCertKeyName,
            accessRole
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

//#region Utils
export async function NginxConfigPreview(blocks: EdgeBlockData[]): Promise<string> {
    return BuildNginxConfig(blocks)
}

/** Converts edge block data to Nginx configuration */
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

        if (name === 'custom_directive') {
            const [customKey, customValue] = rest as unknown as string[];
            if (!customKey) return '';
            return customValue ? `${pad}${customKey} ${customValue};` : `${pad}${customKey};`;
        }

        if (name === 'custom_context') {
            const slotVals = rest.slice(0, nonCtxParams.length) as unknown as string[];
            const children = (rest[nonCtxParams.length] ?? []) as EdgeBlockData[];
            const [contextName, ...extraData] = slotVals;
            if (!contextName) return '';
            const inner = children.map(c => _build(c, indent + 1, EdgeDirectiveContext.any)).filter(Boolean).join('\n');
            const parts = [contextName, ...extraData.filter(Boolean)];
            return `${pad}${parts.join(' ')} {\n${inner}\n${pad}}`;
        }

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

/** Parses Nginx configuration into edge block data */
function ParseNginxConfig(nginxConfig: string): EdgeBlockData[] {
    type Token = { type: 'word' | '{' | '}' | ';'; value: string };

    function tokenize(input: string): Token[] {
        const tokens: Token[] = [];
        let i = 0;
        while (i < input.length) {
            if (/\s/.test(input[i])) { i++; continue; }
            if (input[i] === '#') { while (i < input.length && input[i] !== '\n') i++; continue; }
            if (input[i] === '"' || input[i] === "'") {
                const quote = input[i++];
                let val = '';
                while (i < input.length && input[i] !== quote) {
                    if (input[i] === '\\') i++; // escaped quote inside string
                    val += input[i++];
                }
                i++; // closing quote
                tokens.push({ type: 'word', value: val });
                continue;
            }
            if (input[i] === '{') { tokens.push({ type: '{', value: '{' }); i++; continue; }
            if (input[i] === '}') { tokens.push({ type: '}', value: '}' }); i++; continue; }
            if (input[i] === ';') { tokens.push({ type: ';', value: ';' }); i++; continue; }
            // anything else is part of a word — stop at whitespace or special chars
            let word = '';
            while (i < input.length && !/[\s{};#"']/.test(input[i])) word += input[i++];
            if (word) tokens.push({ type: 'word', value: word });
        }
        return tokens;
    }

    // BuildNginxConfig transforms certain slot values into full paths, have to undo that here
    function reverseSlot(value: string, slot: EdgeSlot | undefined): unknown {
        if (!slot) return value; // extra values (e.g. server_name with multiple names) just pass through
        // ssl slots get written as full paths with .cert/.key — strip both
        if (slot.primitive === 'ssl') return path.relative(NginxPaths.SslCertKeys, value).replace(/\.(cert|key)$/, '');
        if (slot.primitive === 'snippet') return path.relative(NginxPaths.Snippets, value);
        if (slot.primitive === 'role') return path.relative(NginxPaths.Roles, value);
        // some slots have a suffix baked in (e.g. "ms", "s") — strip it so the value round-trips cleanly
        const suffix = slot.suffix ?? slot.subSlot?.suffix;
        if (suffix && value.endsWith(suffix)) return value.slice(0, -suffix.length);
        // tried leaving numbers as strings but the block data comparison broke
        if (slot.primitive === 'number') { const n = Number(value); return isNaN(n) ? value : n; }
        return value;
    }

    const tokens = tokenize(nginxConfig);
    let pos = 0;

    function peek(): Token | undefined { return tokens[pos]; }
    function consume(): Token { return tokens[pos++]; }

    function parseBlocks(): EdgeBlockData[] {
        const blocks: EdgeBlockData[] = [];
        // stop at } so the caller can consume it — don't consume it here or nesting breaks
        while (pos < tokens.length && peek()?.type !== '}') {
            const block = parseStatement();
            if (block) blocks.push(block);
        }
        return blocks;
    }

    function parseStatement(): EdgeBlockData | null {
        const keyToken = consume();
        if (!keyToken || keyToken.type !== 'word') return null; // garbage token, skip
        const key = keyToken.value;

        // collect all value tokens before we hit a { or ;
        const vals: string[] = [];
        while (pos < tokens.length && peek()!.type === 'word') vals.push(consume().value);

        const next = peek();

        if (next?.type === ';') {
            consume();
            const directive = EdgeDirectives.find(d => d.key === key);
            // unrecognized directive — wrap it so BuildNginxConfig can reproduce it
            if (!directive) return ['custom_directive', key as any, vals[0] as any];
            const nonCtxParams = directive.params.filter(p => p.primitive !== 'context');
            const reversed = vals.map((v, i) => reverseSlot(v, nonCtxParams[i]));
            return [key, ...reversed] as unknown as EdgeBlockData;
        }

        if (next?.type === '{') {
            consume();
            const children = parseBlocks();
            if (peek()?.type === '}') consume(); // eat the closing brace
            const directive = EdgeDirectives.find(d => d.key === key);
            // unknown block context (geo, map, etc.) — custom_context takes [name, extraData?, children]
            if (!directive) return ['custom_context', key as any, vals[0] as any, children as any];
            const nonCtxParams = directive.params.filter(p => p.primitive !== 'context');
            const reversed = vals.map((v, i) => reverseSlot(v, nonCtxParams[i]));
            // children always go at the end, after the slot values — matches how BuildNginxConfig reads them
            return [key, ...reversed, children] as unknown as EdgeBlockData;
        }

        return null;
    }

    return parseBlocks();
}

//#endregion