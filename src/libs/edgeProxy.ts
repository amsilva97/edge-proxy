'use client';
import * as EdgeProxyActions from './edgeProxy.actions';
import path from "path";
import { HttpHost, HttpHostMeta, Role, Snippet, SnippetMeta, SslCertKey, SslCertKeyMeta } from "@/types/types";
import { AppEnv } from "./appEnv";
import { EdgeBlockData } from "./edgeDirective";

export namespace EdgeProxy {

    namespace DataPaths {
        const Root = 'data';
        export const HttpHost = path.join(Root, 'http-hosts');
        export const SslCertKey = path.join(Root, 'ssl');
    }

    namespace NginxPaths {
        const Root = AppEnv.nginxBasePath;
        export const EnabledHttpHost = path.join(Root, 'sites-enabled');
        export const SslCertKey = path.join(Root, 'ssl');
    }

    //#region HttpHost
    export async function GetHttpHostAsync(httpHostName: string): Promise<HttpHost> {
        return await EdgeProxyActions.GetHttpHostAsync(httpHostName);
    }

    export async function SaveHttpHostAsync(httpHostName: string, httpHost: HttpHost): Promise<void> {
        return await EdgeProxyActions.SaveHttpHostAsync(httpHostName, httpHost);
    }

    export async function DeleteHttpHostAsync(httpHostName: string): Promise<void> {
        return await EdgeProxyActions.DeleteHttpHostAsync(httpHostName);
    }

    export async function EnableHttpHostAsync(httpHostName: string): Promise<void> {
        return await EdgeProxyActions.EnableHttpHostAsync(httpHostName);
    }

    export async function DisabledHttpHostAsync(httpHostName: string): Promise<void> {
        return await EdgeProxyActions.DisabledHttpHostAsync(httpHostName);
    }

    export async function GetHttpHostMetaListAsync(): Promise<HttpHostMeta[]> {
        return await EdgeProxyActions.GetHttpHostMetaListAsync();
    }

    export async function GetHttpHostMetaAsync(httpHostName: string): Promise<HttpHostMeta> {
        return await EdgeProxyActions.GetHttpHostMetaAsync(httpHostName);
    }
    //#endregion

    //#region HttpHost Quick Host
    export async function SaveHttpProxyHostAsync(httpHostName: string, source: string,
        destination: string, sslCertKeyName: string | null): Promise<void> {
        await EdgeProxyActions.SaveHttpProxyHostAsync(httpHostName, source, destination, sslCertKeyName);
    }
    //#endregion

    //#region SslCertKey
    export async function GetSslCertKeyListAsync(): Promise<SslCertKeyMeta[]> {
        return await EdgeProxyActions.GetSslCertKeyMetaListAsync();
    }

    export async function GetSslCertKeyAsync(sslCertKeyName: string): Promise<SslCertKey> {
        return await EdgeProxyActions.GetSslCertKeyAsync(sslCertKeyName);
    }

    export async function SaveSslCertKeyAsync(sslCertKeyName: string, sslCertKey: SslCertKey): Promise<void> {
        return await EdgeProxyActions.SaveSslCertKeyAsync(sslCertKeyName, sslCertKey);
    }

    export async function DeleteSslCertKeyAsync(sslCertKeyName: string): Promise<void> {
        return await EdgeProxyActions.DeleteSslCertKeyAsync(sslCertKeyName);
    }

    export async function EnableSslCertKeyAsync(sslCertKeyName: string): Promise<void> {
        return await EdgeProxyActions.EnableSslCertKeyAsync(sslCertKeyName);
    }

    export async function DisabledSslCertKeyAsync(sslCertKeyName: string): Promise<void> {
        return await EdgeProxyActions.DisabledSslCertKeyAsync(sslCertKeyName);
    }

    export async function GetSslCertKeyMetaAsync(sslCertKeyName: string): Promise<SslCertKeyMeta> {
        return await EdgeProxyActions.GetSslCertKeyMetaAsync(sslCertKeyName);
    }
    //#endregion

    //#region Snippets
    export async function GetSnippetMetaListAsync(): Promise<SnippetMeta[]> {
        return await EdgeProxyActions.GetSnippetMetaListAsync();
    }

    export async function GetSnippetAsync(snippetName: string): Promise<Snippet> {
        return await EdgeProxyActions.GetSnippetAsync(snippetName);
    }

    export async function SaveSnippetAsync(snippetName: string, snippet: Snippet): Promise<void> {
        return await EdgeProxyActions.SaveSnippetAsync(snippetName, snippet);
    }

    export async function DeleteSnippetAsync(snippetName: string): Promise<void> {
        return await EdgeProxyActions.DeleteSnippetAsync(snippetName);
    }

    export async function GetSnippetMetaAsync(snippetName: string): Promise<SnippetMeta> {
        return await EdgeProxyActions.GetSnippetMetaAsync(snippetName);
    }
    //#endregion

    //#region Roles
    export async function GetRoleListAsync(): Promise<Role[]> {
        return await EdgeProxyActions.GetRoleListAsync();
    }

    export async function GetRoleAsync(roleName: string): Promise<Role> {
        return await EdgeProxyActions.GetRoleAsync(roleName);
    }

    export async function SaveRoleAsync(role: Role): Promise<void> {
        return await EdgeProxyActions.SaveRoleAsync(role);
    }

    export async function SetRolePasswordAsync(role: Role, password: string): Promise<void> {
        return await EdgeProxyActions.SetRolePasswordAsync(role, password);
    }

    export async function ClearRolePasswordAsync(role: Role): Promise<void> {
        return await EdgeProxyActions.ClearRolePasswordAsync(role);
    }

    export async function GrantRoleAsync(role: Role, roleToGrant: Role): Promise<void> {
        return await EdgeProxyActions.GrantRoleAsync(role, roleToGrant);
    }

    export async function RevokeRoleAsync(role: Role, roleToRevoke: Role): Promise<void> {
        return await EdgeProxyActions.RevokeRoleAsync(role, roleToRevoke);
    }
    //#endregion

    export async function NginxConfigPreview(blocks: EdgeBlockData[]): Promise<string> {
        return await EdgeProxyActions.NginxConfigPreview(blocks);
    }
}