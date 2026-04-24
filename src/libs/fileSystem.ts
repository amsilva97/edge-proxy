// import { NotificationManager, ToastNotificationStatus } from '@/components/notifier';
import * as FilesActions from './fileSystem.actions';

/** @deprecated I want to remove this */
export namespace FileSystem {

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
    export async function WriteFileAsync(path: string, data: string): Promise<void> {
        await FilesActions.WriteFileAsync(path, data);
    }
}