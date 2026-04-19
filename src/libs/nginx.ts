'use client';
import * as NginxActions from './nginx.actions';

export namespace Nginx {
    export async function ReloadAsync(): Promise<void> {
        const command = 'nginx -s reload';
        await NginxActions.ReloadAction();
    }
}