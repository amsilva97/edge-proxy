export type EdgeProxyBlock = [EdgeProxyBlockKey, ...any[]];

export enum EdgeProxyBlockKey {
    Root,
    Server,
    Listen,
    ServerName,
}

export class EdgeProxyBlockHelper {
    constructor(private data: EdgeProxyBlock) { }

    /** Saves the provided block data into Edge Proxy json */
    public static save(block: EdgeProxyBlock): void {
        throw new Error("Method not implemented.");
    }

    /** Loads the block data from Edge Proxy json */
    public static load(): EdgeProxyBlock {
        throw new Error("Method not implemented.");
    }

    /** Deletes the block data from Edge Proxy json */
    public static delete(): void {
        throw new Error("Method not implemented.");
    }

    /**
     * Generates the Nginx configuration string based on the block data.
     * Additionally, adds the file to site-available.
     */
    public generateNginxConfig(): string {
        throw new Error("Method not implemented.");
    }
    
    /** Enables the proxy by creating a symbolic link in site-enabled and reloading Nginx */
    public enable(): void {
        throw new Error("Method not implemented.");
    }

    /** Disables the proxy by removing the symbolic link from site-enabled and reloading Nginx */
    public disable(): void {
        throw new Error("Method not implemented.");
    }
}
