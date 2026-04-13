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

    if (!data) return null;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold">Proxy: {proxy}</h1>
                <button
                    onClick={handleSave}
                    disabled={isPending}
                    className="px-4 py-1.5 rounded bg-blue-600 text-white text-sm disabled:opacity-50"
                >
                    {isPending ? 'Saving…' : saved ? 'Saved ✓' : 'Save'}
                </button>
            </div>
            <Block data={data} onChange={setData} />
        </div>
    );
}

function ProxiesPageInner({ params }: { params: Promise<{ proxy: string }> }) {
    const { proxy } = use(params);
    return <ProxyEditor proxy={proxy} />;
}

export default function ProxiesPage({ params }: { params: Promise<{ proxy: string }> }) {
    return (
        <main className="p-6">
            <Suspense fallback={<div>Loading…</div>}>
                <ProxiesPageInner params={params} />
            </Suspense>
        </main>
    );
}
