/** Enum for the keys of an edge proxy block */
export enum EdgeProxyBlockKey {
    Root,
    Server,
    Listen,
    ServerName,
}

/** Type for an edge proxy block */
export type EdgeProxyBlock = [EdgeProxyBlockKey, ...any[]];

/** Interface for the application settings */
export interface EdgeProxySettings {
    nginxBasePath: string;
}