import { EdgeBlock } from '@/libs/edgeBlock';
import { EdgeBlockData } from '@/libs/edgeDirective';

function defaultConfig(): EdgeBlockData {
    return ['root']
}

export async function loadConfig(proxy: string): Promise<EdgeBlockData> {
    if (!await EdgeBlock.DoExistsAsync(proxy)) {
        await EdgeBlock.SaveAsync(proxy, defaultConfig());
    }
    return EdgeBlock.LoadAsync(proxy);
}

export async function saveConfig(proxy: string, data: EdgeBlockData): Promise<void> {
    await EdgeBlock.SaveAsync(proxy, data);
}

export async function deleteProxy(proxy: string): Promise<void> {
    await EdgeBlock.DeleteAsync(proxy);
}

export async function enableProxy(proxy: string): Promise<void> {
    await EdgeBlock.EnableAsync(proxy);
}

export async function disableProxy(proxy: string): Promise<void> {
    await EdgeBlock.DisableAsync(proxy);
}

export async function isProxyEnabled(proxy: string): Promise<boolean> {
    return await EdgeBlock.IsEnabledAsync(proxy);
}
