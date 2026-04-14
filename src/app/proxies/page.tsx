'use client'

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { listProxies, deleteProxy } from './scripts';
import { proxyExists } from './[proxy]/scripts';

function NewProxyForm({ onDone }: { onDone: () => void }) {
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { inputRef.current?.focus(); }, []);

    async function submit() {
        const slug = name.trim();
        if (!slug) return;
        if (await proxyExists(slug)) {
            setError('Already exists');
            return;
        }
        router.push(`/proxies/${slug}`);
    }

    return (
        <div className="flex items-center gap-2">
            <div className="flex flex-col gap-0.5">
                <input
                    ref={inputRef}
                    type="text"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setError(''); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') onDone(); }}
                    placeholder="proxy-name"
                    className={`w-44 ${error ? 'border-red-500 focus:border-red-500' : ''}`}
                />
                {error && <span className="text-xs text-red-500">{error}</span>}
            </div>
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

function ProxyRow({ name, onDeleted }: { name: string; onDeleted: () => void }) {
    const [confirming, setConfirming] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const router = useRouter();

    async function handleDelete(e: React.MouseEvent) {
        e.stopPropagation();
        setDeleting(true);
        await deleteProxy(name);
        onDeleted();
    }

    return (
        <tr
            className="group border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors"
            onClick={() => !confirming && router.push(`/proxies/${name}`)}
        >
            <td className="px-4 py-2.5 text-sm font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {name}
            </td>
            <td className="px-4 py-2.5 text-xs text-zinc-400">
                proxy
            </td>
            <td className="px-4 py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
                {confirming ? (
                    <div className="flex items-center justify-end gap-1.5">
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="px-2 py-0.5 rounded text-xs font-medium bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white transition-colors"
                        >
                            {deleting ? 'Deleting…' : 'Confirm'}
                        </button>
                        <button
                            onClick={() => setConfirming(false)}
                            className="px-2 py-0.5 rounded text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setConfirming(true)}
                        className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 transition-all text-xs leading-none"
                        aria-label="Delete"
                    >
                        ✕
                    </button>
                )}
            </td>
        </tr>
    );
}

export default function ProxiesPage() {
    const [proxies, setProxies] = useState<string[] | null>(null);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        listProxies().then(setProxies);
    }, []);

    function handleDeleted(name: string) {
        setProxies(prev => prev?.filter(p => p !== name) ?? null);
    }

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
            <div className="flex-1 overflow-auto">
                {proxies === null ? (
                    <div className="flex items-center justify-center h-32 text-sm text-zinc-400">Loading…</div>
                ) : proxies.length === 0 ? (
                    <div className="flex items-center justify-center h-32 text-sm text-zinc-400">No proxies yet. Click New to create one.</div>
                ) : (
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-zinc-200 dark:border-zinc-800">
                                <th className="px-4 py-2 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Name</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Type</th>
                                <th className="px-4 py-2" />
                            </tr>
                        </thead>
                        <tbody>
                            {proxies.map(name => (
                                <ProxyRow key={name} name={name} onDeleted={() => handleDeleted(name)} />
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

        </div>
    );
}
