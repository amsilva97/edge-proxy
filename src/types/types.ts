export enum HttpProxyType {
    Advanced
}
export interface HttpProxyMeta {
    label: string;
    isEnabled: boolean;
    type: HttpProxyType
}

import { EdgeBlockData } from '@/libs/edgeDirective';

export type EdgeProxyBlock = EdgeBlockData[];

export type EdgeProxyHost = {
    block: EdgeProxyBlock,
    meta: HttpProxyMeta
}

/** Interface for the application settings */
export interface EdgeProxySettings {
    nginxBasePath: string;
}