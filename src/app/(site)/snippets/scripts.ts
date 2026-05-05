'use client';
import { EdgeProxy } from "@/libs/edgeProxy";
import { Snippet, SnippetMeta } from "@/types/types";

export async function listSnippets(): Promise<SnippetMeta[]> {
    return EdgeProxy.GetSnippetMetaListAsync();
}

export async function snippetExists(name: string): Promise<boolean> {
    try {
        const meta = await EdgeProxy.GetSnippetMetaAsync(name);
        return !!meta.label;
    } catch {
        return false;
    }
}

export async function createSnippet(name: string): Promise<void> {
    return EdgeProxy.SaveSnippetAsync(name, [] as Snippet);
}

export async function deleteSnippet(name: string): Promise<void> {
    return EdgeProxy.DeleteSnippetAsync(name);
}
