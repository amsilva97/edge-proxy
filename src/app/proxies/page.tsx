'use client'

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { listProxies } from './scripts';

function NewProxyForm({ onDone }: { onDone: () => void }) {
    const [name, setName] = useState('');
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { inputRef.current?.focus(); }, []);

    function submit() {
        const slug = name.trim();
        if (slug) router.push(`/proxies/${slug}`);
    }

    return (
        <div className="flex items-center gap-2">
            <input
                ref={inputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') onDone(); }}
                placeholder="proxy-name"
                className="w-44"
            />
            <button
                onClick={submit}
                disabled={!name.trim()}
                className="px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
            >
                Create
            </button>
            <button
                onClick={onDone}
                className="px-3 py-1 rounded-md text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 text-sm transition-colors"
            >
                Cancel
            </button>
        </div>
    );
}

export default function ProxiesPage() {
    const [proxies, setProxies] = useState<string[] | null>(null);
    const [creating, setCreating] = useState(false);
    const router = useRouter();

    useEffect(() => {
        listProxies().then(setProxies);
    }, []);

    return (
        <div className="flex flex-col h-full">

            {/* ── toolbar ── */}
            <div className="shrink-0 flex items-center justify-between gap-4 px-3 py-1.5 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <span className="text-sm font-medium">Proxies</span>
                {creating
                    ? <NewProxyForm onDone={() => setCreating(false)} />
                    : (
                        <button
                            onClick={() => setCreating(true)}
                            className="px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
                        >
                            New
                        </button>
                    )
                }
            </div>

            {/* ── content ── */}
            <div className="flex-1 overflow-auto p-4">
                {proxies === null ? (
                    <div className="flex items-center justify-center h-32 text-sm text-zinc-400">Loading…</div>
                ) : proxies.length === 0 ? (
                    <div className="flex items-center justify-center h-32 text-sm text-zinc-400">No proxies yet. Click New to create one.</div>
                ) : (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
                        {proxies.map(name => (
                            <button
                                key={name}
                                onClick={() => router.push(`/proxies/${name}`)}
                                className="group text-left rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-sm transition-all p-4 flex flex-col gap-1"
                            >
                                <span className="text-sm font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                    {name}
                                </span>
                                <span className="text-xs text-zinc-400">proxy</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}
