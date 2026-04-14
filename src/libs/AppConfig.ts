export interface AppConfig {
    nginxBasePath: string;
}

export const DEFAULT_APP_CONFIG: AppConfig = {
    nginxBasePath: '/etc/nginx',
};
