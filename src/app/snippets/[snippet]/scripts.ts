'use client';
import { EdgeProxy } from "@/libs/edgeProxy";
import { Snippet } from "@/types/types";

export async function getSnippet(name: string): Promise<Snippet> {
    return EdgeProxy.GetSnippetAsync(name);
}

export async function saveSnippet(name: string, snippet: Snippet): Promise<void> {
    return EdgeProxy.SaveSnippetAsync(name, snippet);
}

export async function deleteSnippet(name: string): Promise<void> {
    return EdgeProxy.DeleteSnippetAsync(name);
}
