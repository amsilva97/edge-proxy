'use client';
import { EdgeProxy } from "@/libs/edgeProxy";
import { HttpHostMeta } from "@/types/types";

export async function findOrphans(): Promise<string[]> {
    return EdgeProxy.FindOrphanHttpHost();
}

export async function importOrphan(name: string): Promise<HttpHostMeta> {
    return EdgeProxy.ImportOrphanHttpHost(name);
}

export async function importRawConfig(name: string, config: string): Promise<HttpHostMeta> {
    return EdgeProxy.ImportRawHttpHost(name, config);
}
