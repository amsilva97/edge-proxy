import { NotificationManager, ToastNotificationStatus } from '@/components/notifier';
import * as FilesActions from './fileSystem.actions';

export namespace FileSystem {
    export async function ReadDirAsync(path: string): Promise<string[]> {
        return await FilesActions.ReadDirAsync(path);
    }

    export async function ReadFileAsync(path: string): Promise<string> {
        try {
            return await FilesActions.ReadFileAsync(path);
        }
        catch (error: any) {
            NotificationManager.addToast(error.message, ToastNotificationStatus.Error);
            throw error;
        }
    }

    export async function MakeDirAsync(path: string, options: any): Promise<void> {
        await FilesActions.MakeDirAsync(path, options);
    }

    export async function WriteFileAsync(path: string, data: string): Promise<void> {
        await FilesActions.WriteFileAsync(path, data);
    }

    export async function RemoveFileAsync(path: string, options: { force: boolean; }): Promise<void> {
        await FilesActions.RemoveFileAsync(path, options);
    }

    export async function MakeSymlinkAsync(target: string, link: string): Promise<void> {
        await FilesActions.MakeSymlinkAsync(target, link);
    }

    export async function ExistsAsync(path: string): Promise<boolean> {
        return await FilesActions.ExistsAsync(path);
    }
}