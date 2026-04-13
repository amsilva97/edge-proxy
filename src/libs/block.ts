export enum BlockKey {
    Root,
    Server,
    Listen,
    ServerName,
}

export type BlockData = [BlockKey, ...any[]];
