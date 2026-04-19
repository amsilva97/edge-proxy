import { EdgeBlock } from "@/libs/edgeBlock";


export async function listProxies(): Promise<string[]> {
    return EdgeBlock.GetProxyListAsync();
}

export async function deleteProxy(name: string): Promise<void> {
    return EdgeBlock.DeleteAsync(name);
}

export async function proxyExists(name: string): Promise<boolean> {
    return EdgeBlock.DoExistsAsync(name);
}
