'use client';
import * as EdgeProxyActions from './edgeProxy.actions';
import path from "path";
import { HttpHost, HttpHostMeta, Role, Snippet, SnippetMeta, SslCertKey, SslCertKeyMeta } from "@/types/types";
import { AppEnv } from "./appEnv";
import { EdgeBlockData } from "./edgeDirective";
import { NotificationManager, ToastNotificationStatus } from '@/components/notifier';
import { promises } from 'dns';

export namespace EdgeProxy {
    //#region HttpHost
    export async function GetHttpHostAsync(httpHostName: string): Promise<HttpHost> {
        return await EdgeProxyActions.GetHttpHostAsync(httpHostName);
    }

    export async function SaveHttpHostAsync(httpHostName: string, httpHost: HttpHost): Promise<HttpHostMeta> {
        return await EdgeProxyActions.SaveHttpHostAsync(httpHostName, httpHost);
    }

    export async function DeleteHttpHostAsync(httpHostName: string): Promise<void> {
        return await EdgeProxyActions.DeleteHttpHostAsync(httpHostName);
    }

    export async function EnableHttpHostAsync(httpHostName: string): Promise<HttpHostMeta | null> {
        try {
            return await EdgeProxyActions.EnableHttpHostAsync(httpHostName);
        }
        catch (err: any) {
            NotificationManager.addToast(
                String(err),
                ToastNotificationStatus.Error
            )
            return await GetHttpHostMetaAsync(httpHostName)
        }
    }

    export async function DisabledHttpHostAsync(httpHostName: string): Promise<HttpHostMeta> {
        return await EdgeProxyActions.DisabledHttpHostAsync(httpHostName);
    }

    export async function GetHttpHostMetaListAsync(): Promise<HttpHostMeta[]> {
        return await EdgeProxyActions.GetHttpHostMetaListAsync();
    }

    export async function GetHttpHostMetaAsync(httpHostName: string): Promise<HttpHostMeta> {
        return await EdgeProxyActions.GetHttpHostMetaAsync(httpHostName);
    }

    export async function FindOrphanHttpHost(): Promise<string[]> {
        return await EdgeProxyActions.FindOrphanHttpHost();
    }

    export async function ImportOrphanHttpHost(httpHostName: string): Promise<HttpHostMeta> {
        return await EdgeProxyActions.ImportOrphanHttpHost(httpHostName);
    }
    //#endregion

    //#region HttpHost Quick Host
    export async function SaveHttpProxyHostAsync(httpHostName: string, source: string,
        destination: string, sslCertKeyName: string | null, accessRole: string | null): Promise<HttpHostMeta> {
        return await EdgeProxyActions.SaveHttpProxyHostAsync(httpHostName, source, destination, sslCertKeyName, accessRole);
    }

    export async function SaveHttpLoadbalancerHostAsync(httpHostName: string, source: string,
        serverList: string[], sslCertKeyName: string | null, accessRole: string | null): Promise<HttpHostMeta> {
        return await EdgeProxyActions.SaveHttpLoadbalancerHostAsync(httpHostName, source, serverList, sslCertKeyName, accessRole);
    }

    export async function SaveHttpRedirectHostAsync(httpHostName: string, source: string,
        destination: string, isPermanent: boolean): Promise<HttpHostMeta> {
        return await EdgeProxyActions.SaveHttpRedirectHostAsync(httpHostName, source, destination, isPermanent);
    }

    export async function SaveHttpStaticHostAsync(httpHostName: string, source: string,
        pathToFile: string, isSpa: boolean, sslCertKeyName: string | null, accessRole: string | null): Promise<HttpHostMeta> {
        return await EdgeProxyActions.SaveHttpStaticHostAsync(httpHostName, source, pathToFile, isSpa, sslCertKeyName, accessRole);
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