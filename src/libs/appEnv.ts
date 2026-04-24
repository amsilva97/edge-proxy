// 'use client';
import * as AppEnvActions from './appEnv.actions';

export class AppEnv {
    static get nginxBasePath(): string {
        return process.env.NEXT_PUBLIC_NGINX_PATH ?? '/etc/nginx';
    }

    static async LoadEnvAsync(): Promise<Record<string, string>> {
        return await AppEnvActions.LoadEnvAsync();
    }

    static async SaveEnvAsync(dict: Record<string, string>): Promise<void> {
        return await AppEnvActions.SaveEnvAsync(dict);
    }
}
