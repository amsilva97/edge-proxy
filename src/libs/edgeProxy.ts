'use client';
import * as EdgeProxyActions from './edgeProxy.actions';
import path from "path";
import { HttpHost, HttpHostMeta, SslCertKey, SslCertKeyMeta } from "@/types/types";
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
        return await EdgeProxyActions.GetHttpHostAsync(httpHostName)
    }

    export async function SaveHttpHostAsync(httpHostName: string, httpHost: HttpHost): Promise<void> {
        return await EdgeProxyActions.SaveHttpHostAsync(httpHostName, httpHost)
    }

    export async function DeleteHttpHostAsync(httpHostName: string): Promise<void> {
        return await EdgeProxyActions.DeleteHttpHostAsync(httpHostName)
    }

    export async function EnableHttpHostAsync(httpHostName: string): Promise<void> {
        return await EdgeProxyActions.EnableHttpHostAsync(httpHostName)
    }

    export async function DisabledHttpHostAsync(httpHostName: string): Promise<void> {
        return await EdgeProxyActions.DisabledHttpHostAsync(httpHostName)
    }

    export async function GetHttpHostMetaListAsync(): Promise<HttpHostMeta[]> {
        return await EdgeProxyActions.GetHttpHostMetaListAsync()
    }

    export async function GetHttpHostMetaAsync(httpHostName: string): Promise<HttpHostMeta> {
        return await EdgeProxyActions.GetHttpHostMetaAsync(httpHostName)
    }
    //#endregion

    //#region SslCertKey
    export async function GetSslCertKeyListAsync(): Promise<SslCertKeyMeta[]> {
        return await EdgeProxyActions.GetSslCertKeyListAsync()
    }

    export async function GetSslCertKeyAsync(sslCertKeyName: string): Promise<SslCertKey> {
        return await EdgeProxyActions.GetSslCertKeyAsync(sslCertKeyName)
    }

    export async function SaveSslCertKeyAsync(sslCertKeyName: string, sslCertKey: SslCertKey): Promise<void> {
        return await EdgeProxyActions.SaveSslCertKeyAsync(sslCertKeyName, sslCertKey)
    }

    export async function DeleteSslCertKeyAsync(sslCertKeyName: string): Promise<void> {
        return await EdgeProxyActions.DeleteSslCertKeyAsync(sslCertKeyName)
    }

    export async function EnableSslCertKeyAsync(sslCertKeyName: string): Promise<void> {
        return await EdgeProxyActions.EnableSslCertKeyAsync(sslCertKeyName)
    }

    export async function DisabledSslCertKeyAsync(sslCertKeyName: string): Promise<void> {
        return await EdgeProxyActions.DisabledSslCertKeyAsync(sslCertKeyName)
    }

    export async function GetSslCertKeyMetaAsync(sslCertKeyName: string): Promise<SslCertKeyMeta> {
        return await EdgeProxyActions.GetSslCertKeyMetaAsync(sslCertKeyName)
    }
    //#endregion

    export async function NginxConfigPreview(blocks: EdgeBlockData[]): Promise<string> {
        return await EdgeProxyActions.NginxConfigPreview(blocks)
    }
}