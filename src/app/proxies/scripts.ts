import { AppData } from "@/libs/appData";
import { Nginx } from "@/libs/nginx";
import { EdgeBlockData } from "@/libs/edgeDirective";

export async function listProxies(): Promise<string[]> {
    return AppData.GetHttpProxyListAsync();
}

export async function deleteProxy(name: string): Promise<void> {
    await AppData.DeleteHttpProxyAsync(name);
    await Nginx.DisableHttpProxyAsync(name);
}

export async function proxyExists(name: string): Promise<boolean> {
    return AppData.ExistsHttpProxyAsync(name);
}

export async function isProxyEnabled(name: string): Promise<boolean> {
    return Nginx.IsEnabledHttpProxyAsync(name);
}

export async function enableProxy(name: string): Promise<void> {
    const data = await AppData.LoadHttpProxyAsync(name) as EdgeBlockData[];
    await Nginx.EnableHttpProxyAsync(name, data);
}

export async function disableProxy(name: string): Promise<void> {
    await Nginx.DisableHttpProxyAsync(name);
}
