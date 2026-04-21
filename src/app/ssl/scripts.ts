import { Nginx } from '@/libs/nginx';
import { AppData, SslCertMeta } from '@/libs/appData';

export async function listCerts(): Promise<SslCertMeta[]> {
    return AppData.GetSslListAsync();
}

export async function saveCert(label: string, cert: string, key: string): Promise<void> {
    return AppData.SaveSslAsync(label, cert, key);
}

export async function deleteCert(label: string): Promise<void> {
    return AppData.DeleteSslAsync(label);
}

export async function certExists(label: string): Promise<boolean> {
    return AppData.ExistsSslAsync(label);
}

export async function isCertEnabled(label: string): Promise<boolean> {
    return Nginx.IsEnabledSslAsync(label);
}

export async function enableCert(label: string): Promise<void> {
    const { cert, key } = await AppData.ReadSslAsync(label);
    await Nginx.EnableSslAsync(label, cert, key);
}

export async function disableCert(label: string): Promise<void> {
    await Nginx.DisableSslAsync(label);
}
