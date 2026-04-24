'use client';
import { EdgeProxy } from '@/libs/edgeProxy';
import { SslCertKey, SslCertKeyMeta } from '@/types/types';

export async function listCerts(): Promise<SslCertKeyMeta[]> {
    return EdgeProxy.GetSslCertKeyListAsync();
}

export async function saveCert(label: string, cert: string, key: string): Promise<void> {
    return EdgeProxy.SaveSslCertKeyAsync(label, { cert, key } as SslCertKey);
}

export async function replaceCert(label: string, cert: string, key: string): Promise<void> {
    return EdgeProxy.SaveSslCertKeyAsync(label, { cert, key } as SslCertKey);
}

export async function deleteCert(label: string): Promise<void> {
    return EdgeProxy.DeleteSslCertKeyAsync(label);
}

export async function certExists(label: string): Promise<boolean> {
    try {
        const meta = await EdgeProxy.GetSslCertKeyMetaAsync(label);
        return !!meta.label;
    } catch {
        return false;
    }
}

export async function enableCert(label: string): Promise<void> {
    return EdgeProxy.EnableSslCertKeyAsync(label);
}

export async function disableCert(label: string): Promise<void> {
    return EdgeProxy.DisabledSslCertKeyAsync(label);
}
