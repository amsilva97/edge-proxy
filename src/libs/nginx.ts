import path from 'path';
import { EdgeBlockData, EdgeDirectives } from './edgeDirective';
import * as NginxActions from './nginx.actions';
import { FileSystem } from './fileSystem'
import { DataPaths } from './constants';
import { AppConfig } from './appConfig';
import { promises } from 'dns';

export namespace Nginx {
    const HTTP_PROXY = 'sites-enabled'
    const SSL = 'ssl'
    const SSL_CERT_EXTENSION = '.cert'
    const SSL_KEY_EXTENSION = '.key'

    export async function ReloadAsync(): Promise<void> {
        const command = 'nginx -s reload';
        await NginxActions.ReloadAction();
    }

    export async function GetHttpProxyListAsync(): Promise<string[]> {
        const appSettings = await AppConfig.LoadAsync()
        const httpProxyPath = path.join(appSettings.nginxBasePath, HTTP_PROXY);
        return await FileSystem.ReadDirAsync(httpProxyPath)
    }

    export async function EnableHttpProxyAsync(proxyName: string, edgeBlockData: EdgeBlockData): Promise<void> {
        const appSettings = await AppConfig.LoadAsync()
        const httpProxyPath = path.join(appSettings.nginxBasePath, HTTP_PROXY, proxyName);
        const nginxCongif = BuildNginxConfig([edgeBlockData]);
        await FileSystem.WriteFileAsync(httpProxyPath, nginxCongif);
    }

    export async function DisableHttpProxyAsync(proxyName: string): Promise<void> {
        const appSettings = await AppConfig.LoadAsync()
        const httpProxyPath = path.join(appSettings.nginxBasePath, HTTP_PROXY, proxyName);
        await FileSystem.RemoveFileAsync(httpProxyPath)
    }

    export async function IsEnabledHttpProxyAsync(proxyName: string): Promise<boolean> {
        const appSettings = await AppConfig.LoadAsync()
        const httpProxyPath = path.join(appSettings.nginxBasePath, HTTP_PROXY, proxyName);
        return await FileSystem.ExistsAsync(httpProxyPath)
    }

    export async function EnableSslAsync(sslName: string, cert: string, key: string): Promise<void> {
        const appSettings = await AppConfig.LoadAsync()
        const sslPath = path.join(appSettings.nginxBasePath, SSL)
        const sslCertPath = path.join(sslPath, sslName + SSL_CERT_EXTENSION)
        const sslKeyPath = path.join(sslPath, sslName + SSL_KEY_EXTENSION)
        await FileSystem.WriteFileAsync(sslCertPath, cert);
        await FileSystem.WriteFileAsync(sslKeyPath, key);
    }

    export async function DisableSslAsync(sslName: string): Promise<void> {
        const appSettings = await AppConfig.LoadAsync()
        const sslPath = path.join(appSettings.nginxBasePath, SSL)
        const sslCertPath = path.join(sslPath, sslName + SSL_CERT_EXTENSION)
        const sslKeyPath = path.join(sslPath, sslName + SSL_KEY_EXTENSION)
        await FileSystem.RemoveFileAsync(sslCertPath);
        await FileSystem.RemoveFileAsync(sslKeyPath);
    }

    function BuildNginxConfig(blocks: EdgeBlockData[]): string {
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
                        const sub = name === 'ssl_certificate_key' ? 'key' : 'cert';
                        return path.join(DataPaths.ssl, String(v), sub);
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
}