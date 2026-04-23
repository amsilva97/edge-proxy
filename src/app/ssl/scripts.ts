import { AppData } from '@/libs/appData';
import { Nginx } from '@/libs/nginx';

export async function listCerts(): Promise<AppData.SslMeta[]> {
    return AppData.GetSslListAsync();
}

export async function saveCert(label: string, cert: string, key: string): Promise<void> {
    return AppData.CreateSslAsync(label, cert, key);
}

export async function replaceCert(label: string, cert: string, key: string): Promise<void> {
    return AppData.UpdateSslCertKeyAsync(label, cert, key);
}

export async function deleteCert(label: string): Promise<void> {
    return AppData.DeleteSslAsync(label);
}

export async function certExists(label: string): Promise<boolean> {
    return AppData.ExistsSslAsync(label);
}

export async function enableCert(label: string): Promise<void> {
    const { cert, key } = await AppData.GetSslCertKeyAsync(label);
    await Nginx.EnableSslAsync(label, cert, key);
    await AppData.SaveSslMetaAsync(label, { isEnabled: true });
}

export async function disableCert(label: string): Promise<void> {
    await Nginx.DisableSslAsync(label);
    await AppData.SaveSslMetaAsync(label, { isEnabled: false });
}
