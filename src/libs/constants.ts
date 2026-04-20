import path from 'path';

export namespace DataPaths {
    export const root = 'data';
    export const appConfig = path.join(root, 'app-config.json');
    export const proxies = path.join(root, 'proxies');
    export const ssl = path.join(root, 'ssl');
}
