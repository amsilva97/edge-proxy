import { FileSystem } from './fileSystem';
import path from 'path';
import { DataPaths } from '@/libs/constants';

export interface SslCertMeta {
    label: string;
    path: string;
}

export namespace SslCerts {
    function certDir(label: string) {
        return path.join(DataPaths.ssl, label);
    }

    export async function ListAsync(): Promise<SslCertMeta[]> {
        try {
            const labels = await FileSystem.ReadDirAsync(DataPaths.ssl);
            return labels.map(label => ({
                label,
                path: path.join(DataPaths.ssl, label),
            }));
        } catch {
            return [];
        }
    }

    export async function SaveAsync(label: string, cert: string, key: string): Promise<void> {
        const dir = certDir(label);
        await FileSystem.MakeDirAsync(dir, { recursive: true });
        await FileSystem.WriteFileAsync(path.join(dir, 'cert'), cert);
        await FileSystem.WriteFileAsync(path.join(dir, 'key'), key);
    }

    export async function DeleteAsync(label: string): Promise<void> {
        await FileSystem.RemoveFileAsync(certDir(label), { force: true, recursive: true });
    }

    export async function ExistsAsync(label: string): Promise<boolean> {
        return FileSystem.ExistsAsync(certDir(label));
    }
}
