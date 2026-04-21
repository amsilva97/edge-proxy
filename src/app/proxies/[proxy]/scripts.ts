import { AppData } from '@/libs/appData';
import { Nginx } from '@/libs/nginx';
import { EdgeBlockData } from '@/libs/edgeDirective';

function defaultConfig(): EdgeBlockData[] {
    return [];
}

export async function loadConfig(proxy: string): Promise<EdgeBlockData[]> {
    if (!await AppData.ExistsHttpProxyAsync(proxy)) {
        await AppData.SaveHttpProxyAsync(proxy, defaultConfig());
    }
    return AppData.LoadHttpProxyAsync(proxy) as Promise<EdgeBlockData[]>;
}

export async function saveConfig(proxy: string, data: EdgeBlockData[]): Promise<void> {
    await AppData.SaveHttpProxyAsync(proxy, data);
}

export async function deleteProxy(proxy: string): Promise<void> {
    await AppData.DeleteHttpProxyAsync(proxy);
    await Nginx.DisableHttpProxyAsync(proxy);
}

export async function enableProxy(proxy: string): Promise<void> {
    const data = await AppData.LoadHttpProxyAsync(proxy) as EdgeBlockData[];
    await Nginx.EnableHttpProxyAsync(proxy, data);
}

export async function disableProxy(proxy: string): Promise<void> {
    await Nginx.DisableHttpProxyAsync(proxy);
}

export async function isProxyEnabled(proxy: string): Promise<boolean> {
    return Nginx.IsEnabledHttpProxyAsync(proxy);
}

export async function listSslLabels(): Promise<string[]> {
    const certs = await AppData.GetSslListAsync();
    return certs.map(c => c.label);
}
