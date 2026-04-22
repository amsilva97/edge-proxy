'use client'

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { listProxies, deleteProxy, proxyExists, isProxyEnabled, enableProxy, disableProxy } from './scripts';
import Toggle from '@/components/ui/toggle';
import Toolbar from '@/components/toolbar';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Table from '@/components/ui/table';
import Dialog from '@/components/dialog';
import { Trash2 } from 'lucide-react';

function NewProxyDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    useEffect(() => {
        if (open) {
            setName('');
            setError('');
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [open]);

    async function submit() {
        const slug = name.trim();
        if (!slug) return;
        if (await proxyExists(slug)) {
            setError('A proxy with that name already exists');
            return;
        }
        router.push(`/proxies/${slug}`);
    }

    function onKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter') submit();
    }

    return (
        <Dialog open={open} title="New Proxy" onCancel={onClose}>
            <div className="flex flex-col gap-4">
                <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-zinc-700">Name</span>
                    <Input
                        ref={inputRef}
                        type="text"
                        value={name}
                        onChange={e => { setName(e.target.value); setError(''); }}
                        onKeyDown={onKeyDown}
                        placeholder="proxy-name"
                    />
                    {error && <span className="text-xs text-red-500">{error}</span>}
                </label>
                <div className="flex justify-end gap-2 pt-1">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button variant="solid" onClick={submit} disabled={!name.trim()}>Create</Button>
                </div>
            </div>
        </Dialog>
    );
}

const columns = [
    { key: 'name', label: 'Name' },
];

export default function ProxiesPage() {
    const [proxies, setProxies] = useState<string[] | null>(null);
    const [enabled, setEnabled] = useState<Record<string, boolean>>({});
    const [toggling, setToggling] = useState<Record<string, boolean>>({});
    const [creating, setCreating] = useState(false);
    const [deletingProxy, setDeletingProxy] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        listProxies().then(async list => {
            setProxies(list);
            const states = await Promise.all(list.map(name => isProxyEnabled(name)));
            setEnabled(Object.fromEntries(list.map((name, i) => [name, states[i]])));
        });
    }, []);

    async function handleToggle(name: string, next: boolean) {
        setToggling(prev => ({ ...prev, [name]: true }));
        if (next) await enableProxy(name);
        else await disableProxy(name);
        setEnabled(prev => ({ ...prev, [name]: next }));
        setToggling(prev => ({ ...prev, [name]: false }));
    }

    function handleDeleted(name: string) {
        setProxies(prev => prev?.filter(p => p !== name) ?? null);
    }

    async function confirmDelete() {
        if (!deletingProxy) return;
        setDeleting(true);
        await deleteProxy(deletingProxy);
        handleDeleted(deletingProxy);
        setDeletingProxy(null);
        setDeleting(false);
    }

    const rows = proxies?.map(name => ({ name })) ?? [];

    return (
        <div className="flex flex-col h-full bg-zinc-50 text-zinc-900">

            <Toolbar title="Proxies">
                <Button variant="solid" onClick={() => setCreating(true)}>New Proxy</Button>
            </Toolbar>

            <NewProxyDialog open={creating} onClose={() => setCreating(false)} />

            <div className="flex-1 overflow-auto p-5">
                {proxies === null ? (
                    <div className="flex items-center justify-center h-32 text-sm text-zinc-500">
                        Loading…
                    </div>
                ) : proxies.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 gap-2">
                        <span className="text-sm text-zinc-500">No proxies yet.</span>
                        <Button variant="solid" onClick={() => setCreating(true)}>New Proxy</Button>
                    </div>
                ) : (
                    <Table
                        columns={[
                            {
                                key: 'enabled',
                                label: 'Status',
                                width: '1px',
                                render: (_val, row) => (
                                    <Toggle
                                        checked={enabled[row.name] ?? false}
                                        onChange={next => handleToggle(row.name, next)}
                                        disabled={toggling[row.name]}
                                    />
                                ),
                            },
                            ...columns,
                        ]}
                        data={rows}
                        rowKey={row => row.name}
                        onRowClick={row => router.push(`/proxies/${row.name}`)}
                        actions={row => (
                            <button
                                onClick={() => setDeletingProxy(row.name)}
                                className="opacity-0 group-hover:opacity-100 text-zinc-900 hover:text-red-500 transition-colors"
                                aria-label="Delete"
                            >
                                <Trash2 size={14} strokeWidth={1.75} />
                            </button>
                        )}
                    />
                )}
            </div>

            <Dialog
                open={deletingProxy !== null}
                title={`Delete '${deletingProxy}'`}
                onCancel={() => !deleting && setDeletingProxy(null)}
            >
                <p className="text-sm text-zinc-600 mb-4">This cannot be undone.</p>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setDeletingProxy(null)} disabled={deleting}>Cancel</Button>
                    <Button variant="solid" color="danger" onClick={confirmDelete} disabled={deleting}>
                        {deleting ? 'Deleting…' : 'Delete'}
                    </Button>
                </div>
            </Dialog>

        </div>
    );
}
