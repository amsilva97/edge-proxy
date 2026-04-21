'use client'

import { use, useState, useTransition, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Block, { BlockData } from '@/components/block';
import { EdgeBlock } from '@/libs/edgeBlock';
import { EdgeDirectiveContext } from '@/libs/edgeDirective';
import { loadConfig, saveConfig, deleteProxy, enableProxy, disableProxy, isProxyEnabled, listSslLabels } from './scripts';
import Toolbar from '@/components/toolbar';
import Button from '@/components/ui/button';
import Toggle from '@/components/ui/toggle';
import Dialog from '@/components/dialog';

function NginxPreview({ data }: { data: BlockData }) {
    const text = EdgeBlock.BuildNginxConfig(data).trim();
    return (
        <div className="h-full flex flex-col rounded-lg overflow-hidden border border-zinc-200 bg-white">
            <div className="px-3 py-1.5 border-b border-zinc-200 bg-zinc-50 shrink-0">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">nginx preview</span>
            </div>
            <pre className="flex-1 overflow-auto p-4 text-[12px] leading-5 font-mono text-zinc-700 whitespace-pre">
                {text || <span className="text-zinc-300">No config yet.</span>}
            </pre>
        </div>
    );
}

function ProxyEditor({ proxy }: { proxy: string }) {
    const router = useRouter();
    const [data, setData] = useState<BlockData | null>(null);
    const [isPending, startTransition] = useTransition();
    const [saved, setSaved] = useState(false);
    const [enabled, setEnabled] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [sslLabels, setSslLabels] = useState<string[]>([]);

    useEffect(() => {
        loadConfig(proxy).then(setData);
        isProxyEnabled(proxy).then(setEnabled);
        listSslLabels().then(setSslLabels);
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
            if (next) await enableProxy(proxy);
            else await disableProxy(proxy);
            setEnabled(next);
        });
    }

    async function handleDelete() {
        setDeleting(true);
        await deleteProxy(proxy);
        router.push('/proxies');
    }

    return (
        <div className="flex flex-col h-full bg-zinc-50 text-zinc-900">

            <Toolbar title={proxy}>
                <Toggle
                    checked={enabled}
                    onChange={handleToggle}
                    label={enabled ? 'Enabled' : 'Disabled'}
                    disabled={isPending || !data}
                />
                <Button variant="outline" color="danger" onClick={() => setConfirmDelete(true)} disabled={isPending || !data}>
                    Delete
                </Button>
                <Button variant="solid" onClick={handleSave} disabled={isPending || !data}>
                    {saved ? 'Saved' : 'Save'}
                </Button>
            </Toolbar>

            <div className="flex-1 overflow-hidden flex gap-4 p-4">
                <div className="flex-1 overflow-auto">
                    {data
                        ? <Block data={data} context={EdgeDirectiveContext.http} onChange={setData} sslLabels={sslLabels} />
                        : <div className="flex items-center justify-center h-32 text-sm text-zinc-400">Loading…</div>
                    }
                </div>
                <div className="flex-1 overflow-hidden">
                    {data && <NginxPreview data={data} />}
                </div>
            </div>

            <Dialog
                open={confirmDelete}
                title={`Delete '${proxy}'`}
                onCancel={() => !deleting && setConfirmDelete(false)}
            >
                <p className="text-sm text-zinc-600 mb-4">This cannot be undone.</p>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setConfirmDelete(false)} disabled={deleting}>Cancel</Button>
                    <Button variant="solid" color="danger" onClick={handleDelete} disabled={deleting}>
                        {deleting ? 'Deleting…' : 'Delete'}
                    </Button>
                </div>
            </Dialog>

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
                <div className="flex items-center justify-center flex-1 text-sm text-zinc-400">Loading…</div>
            }>
                <ProxiesPageInner params={params} />
            </Suspense>
        </div>
    );
}
