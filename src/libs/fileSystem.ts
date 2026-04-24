import { NotificationManager, ToastNotificationStatus } from '@/components/notifier';
import * as FilesActions from './fileSystem.actions';

/** @deprecated I want to remove this */
export namespace FileSystem {
    export async function ReadDirAsync(path: string): Promise<string[]> {
        return await FilesActions.ReadDirAsync(path);
    }

    /** @deprecated I want to mnove all of this to edgeData */
    export async function ReadFileAsync(path: string): Promise<string> {
        try {
            return await FilesActions.ReadFileAsync(path);
        }
        catch (error: any) {
            NotificationManager.addToast(error.message, ToastNotificationStatus.Error);
            throw error;
        }
    }

    /** @deprecated I want to mnove all of this to edgeData */
    export async function TryReadFileAsync(path: string): Promise<string | null> {
        try {
            return await FilesActions.ReadFileAsync(path);
        }
        catch (error: any) {
            return null
        }
    }

    /** @deprecated I want to mnove all of this to edgeData */
    export async function MakeDirAsync(path: string, options: any): Promise<void> {
        await FilesActions.MakeDirAsync(path, options);
    }

    /** @deprecated I want to mnove all of this to edgeData */
    export async function WriteFileAsync(path: string, data: string): Promise<void> {
        await FilesActions.WriteFileAsync(path, data);
    }

    /** @deprecated I want to mnove all of this to edgeData */
    export async function RemoveFileAsync(path: string, options: { force?: boolean; recursive?: boolean } = {}): Promise<void> {
        await FilesActions.RemoveFileAsync(path, options);
    }

    /** @deprecated I want to mnove all of this to edgeData */
    export async function MakeSymlinkAsync(target: string, link: string): Promise<void> {
        await FilesActions.MakeSymlinkAsync(target, link);
    }

    /** @deprecated I want to mnove all of this to edgeData */
    export async function ExistsAsync(path: string): Promise<boolean> {
        return await FilesActions.ExistsAsync(path);
    }
}