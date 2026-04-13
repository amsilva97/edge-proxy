'use client'

import { use, useState, useTransition, useEffect, Suspense } from 'react';
import Block, { BlockData } from '@/components/Block';
import { loadConfig, saveConfig } from './scripts';

function ProxyEditor({ proxy }: { proxy: string }) {
    const [data, setData] = useState<BlockData | null>(null);
    const [isPending, startTransition] = useTransition();
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        loadConfig(proxy).then(setData);
    }, [proxy]);

    function handleSave() {
        if (!data) return;
        startTransition(async () => {
            await saveConfig(proxy, data);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        });
    }

    return (
        <div className="flex flex-col h-full">

            {/* ── toolbar ── */}
            <div className="shrink-0 flex items-center justify-between gap-4 px-3 py-1.5 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <div className="flex items-center gap-2 text-sm min-w-0">
                    <a href="/" className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors shrink-0">
                        Proxies
                    </a>
                    <span className="text-zinc-300 dark:text-zinc-600">/</span>
                    <span className="font-medium truncate">{proxy}</span>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isPending || !data}
                    className="shrink-0 px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
                >
                    {isPending ? 'Saving…' : saved ? 'Saved ✓' : 'Save'}
                </button>
            </div>

            {/* ── content ── */}
            <div className="flex-1 overflow-auto p-2">
                {data
                    ? <Block data={data} onChange={setData} />
                    : <div className="flex items-center justify-center h-32 text-sm text-zinc-400">Loading…</div>
                }
            </div>

        </div>
    );
}

function ProxiesPageInner({ params }: { params: Promise<{ proxy: string }> }) {
    const { proxy } = use(params);
    return <ProxyEditor proxy={proxy} />;
}

export default function ProxiesPage({ params }: { params: Promise<{ proxy: string }> }) {
    return (
        <div className="h-full flex flex-col">
            <Suspense fallback={
                <div className="flex items-center justify-center flex-1 text-sm text-zinc-400">
                    Loading…
                </div>
            }>
                <ProxiesPageInner params={params} />
            </Suspense>
        </div>
    );
}
