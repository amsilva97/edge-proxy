/** Type for an edge proxy block — [directiveName, ...slotValues] */
export type EdgeProxyBlock = [string, ...any[]];

/** Interface for the application settings */
export interface EdgeProxySettings {
    nginxBasePath: string;
}