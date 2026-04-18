'use client'

import { use, useState, useTransition, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Block, { BlockData } from '@/components/block';
import { loadConfig, saveConfig, deleteProxy, enableProxy, disableProxy, isProxyEnabled } from './scripts';
import Toolbar from '@/components/toolbar';
import Button from '@/components/ui/button';
import Toggle from '@/components/ui/toggle';

function ProxyEditor({ proxy }: { proxy: string }) {
    const router = useRouter();
    const [data, setData] = useState<BlockData | null>(null);
    const [isPending, startTransition] = useTransition();
    const [saved, setSaved] = useState(false);
    const [enabled, setEnabled] = useState(false);

    useEffect(() => {
        loadConfig(proxy).then(setData);
        isProxyEnabled(proxy).then(setEnabled);
    }, [proxy]);

    function handleSave() {
        if (!data) return;
        startTransition(async () => {
            await saveConfig(proxy, data);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        });
    }

    function handleToggle(next: boolean) {
        startTransition(async () => {
            if (next) {
                await enableProxy(proxy);
            } else {
                await disableProxy(proxy);
            }
            setEnabled(next);
        });
    }

    function handleDelete() {
        startTransition(async () => {
            await deleteProxy(proxy);
            router.push('/proxies');
        });
    }

    return (
        <div className="flex flex-col h-full">

            {/* ── toolbar ── */}
            <Toolbar>
                <span className="flex-1 font-medium text-sm">{proxy}</span>

                <div className="flex items-center gap-3">
                    <Toggle
                        checked={enabled}
                        onChange={handleToggle}
                        label={enabled ? 'Enabled' : 'Disabled'}
                        disabled={isPending || !data}
                    />
                    <Button variant="primary" onClick={handleSave} disabled={isPending || !data}>
                        {saved ? 'Saved' : 'Save'}
                    </Button>
                    <Button variant="danger" onClick={handleDelete} disabled={isPending || !data}>
                        Delete
                    </Button>
                </div>
            </Toolbar>

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
