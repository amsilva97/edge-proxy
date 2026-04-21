import { AppData } from "@/libs/appData";
import { Nginx } from "@/libs/nginx";


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
