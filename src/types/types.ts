import { EdgeBlockData } from '@/libs/edgeDirective';

export enum HttpProxyType {
    Advanced
}

/** @deprecated use 'HttpHost' and/or 'HttpHostMeta' */
export type EdgeProxyHost = {
    block: HttpHost,
    meta: HttpHostMeta
}

export type HttpHost = EdgeBlockData[];

export interface HttpHostMeta {
    label: string;
    isEnabled: boolean;
    type: HttpProxyType
}

export type SslCertKey = {
    cert: string;
    key: string;
}

export type SslCertKeyMeta = {
    label: string;
    isEnabled: boolean;
    usedBy: string[];
}