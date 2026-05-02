import { EdgeBlockData } from '@/libs/edgeDirective';
import { inherits } from 'util';

export enum HttpProxyType {
    Advanced,
    Proxy
}

export type HttpHost = EdgeBlockData[];

export type HttpHostMeta = {
    label: string;
    isEnabled: boolean;
    type: HttpProxyType;
    usedSsls: string[];
    usedSnippets: string[];
    quickSetup: Record<string, string | null>
}

export type SslCertKey = {
    label: string;
    cert: string;
    key: string;
}

export type SslCertKeyMeta = {
    label: string;
    isEnabled: boolean;
    attachedTo: string[];
}

export type Snippet = EdgeBlockData[];

export type SnippetMeta = {
    label: string;
    attachedTo: string[];
}

export type Role = {
    name: string;
    pass: string | null;
    inheritedBy: string[]
}