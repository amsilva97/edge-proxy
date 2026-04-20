import { SslCerts, SslCertMeta } from '@/libs/sslCerts';

export async function listCerts(): Promise<SslCertMeta[]> {
    return SslCerts.ListAsync();
}

export async function saveCert(label: string, cert: string, key: string): Promise<void> {
    return SslCerts.SaveAsync(label, cert, key);
}

export async function deleteCert(label: string): Promise<void> {
    return SslCerts.DeleteAsync(label);
}

export async function certExists(label: string): Promise<boolean> {
    return SslCerts.ExistsAsync(label);
}
