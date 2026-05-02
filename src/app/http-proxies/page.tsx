'use client'

import { useEffect, useRef, useState } from 'react';
import { HttpHostMeta } from '@/types/types';
import {
    listHttpProxies, proxyExists, saveHttpProxy,
    deleteHttpProxy, enableHttpProxy, disableHttpProxy, listSslCerts, listRoles,
} from './scripts';
import Toggle from '@/components/ui/toggle';
import Toolbar from '@/components/toolbar';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Table from '@/components/ui/table';
import Dialog from '@/components/dialog';
import { Pencil, Trash2 } from 'lucide-react';
import RowMenu from '@/components/ui/row-menu';

const selectCls = 'h-9 w-full rounded-md border border-zinc-300 bg-white px-2.5 text-sm text-zinc-900 outline-none transition-[border-color,box-shadow] focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:opacity-50 disabled:cursor-not-allowed';

interface ProxyFormDialogProps {
    open: boolean;
    onClose: () => void;
    onSaved: (label: string) => void;
    editMeta: HttpHostMeta | null;
    sslOptions: string[];
    roleOptions: string[];
}

function ProxyFormDialog({ open, onClose, onSaved, editMeta, sslOptions, roleOptions }: ProxyFormDialogProps) {
    const [name, setName] = useState('');
    const [source, setSource] = useState('');
    const [destination, setDestination] = useState('');
    const [ssl, setSsl] = useState('');
    const [accessRole, setAccessRole] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const nameRef = useRef<HTMLInputElement>(null);
    const sourceRef = useRef<HTMLInputElement>(null);
    const isEdit = editMeta !== null;

    useEffect(() => {
        if (!open) return;
        setError('');
        setBusy(false);
        if (editMeta) {
            setSource(editMeta.quickSetup?.source ?? '');
            setDestination(editMeta.quickSetup?.destination ?? '');
            setSsl(editMeta.quickSetup?.ssl ?? '');
            setAccessRole(editMeta.quickSetup?.accessRole ?? '');
            setTimeout(() => sourceRef.current?.focus(), 50);
        } else {
            setName('');
            setSource('');
            setDestination('');
            setSsl('');
            setAccessRole('');
            setTimeout(() => nameRef.current?.focus(), 50);
        }
    }, [open, editMeta]);

    async function submit() {
        const slug = isEdit ? editMeta!.label : name.trim();
        if (!slug || !source.trim() || !destination.trim()) return;
        setBusy(true);
        if (!isEdit && await proxyExists(slug)) {
            setError('A proxy with that name already exists');
            setBusy(false);
            return;
        }
        await saveHttpProxy(slug, source.trim(), destination.trim(), ssl.trim() || null, accessRole.trim() || null);
        onSaved(slug);
        setBusy(false);
    }

    function onKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter') submit();
    }

    const canSubmit = !busy && (isEdit || !!name.trim()) && !!source.trim() && !!destination.trim();

    return (
        <Dialog open={open} title={isEdit ? `Edit '${editMeta!.label}'` : 'New Proxy'} onCancel={onClose}>
            <div className="flex flex-col gap-4">
                {!isEdit && (
                    <label className="flex flex-col gap-1.5">
                        <span className="text-sm font-medium text-zinc-700">Name</span>
                        <Input
                            ref={nameRef}
                            type="text"
                            value={name}
                            onChange={e => { setName(e.target.value); setError(''); }}
                            onKeyDown={onKeyDown}
                            placeholder="my-proxy"
                        />
                        {error && <span className="text-xs text-red-500">{error}</span>}
                    </label>
                )}
                <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-zinc-700">Source</span>
                    <Input
                        ref={sourceRef}
                        type="text"
                        value={source}
                        onChange={e => setSource(e.target.value)}
                        onKeyDown={onKeyDown}
                        placeholder="example.com"
                    />
                </label>
                <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-zinc-700">Destination</span>
                    <Input
                        type="text"
                        value={destination}
                        onChange={e => setDestination(e.target.value)}
                        onKeyDown={onKeyDown}
                        placeholder="http://localhost:3000"
                    />
                </label>
                <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-zinc-700">
                        SSL Certificate{' '}
                        <span className="text-zinc-400 font-normal">(optional)</span>
                    </span>
                    <select value={ssl} onChange={e => setSsl(e.target.value)} className={selectCls}>
                        <option value="">None</option>
                        {sslOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </label>
                <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-zinc-700">
                        Access Role{' '}
                        <span className="text-zinc-400 font-normal">(optional)</span>
                    </span>
                    <select value={accessRole} onChange={e => setAccessRole(e.target.value)} className={selectCls}>
                        <option value="">None</option>
                        {roleOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </label>
                <div className="flex justify-end gap-2 pt-1">
                    <Button variant="outline" onClick={onClose} disabled={busy}>Cancel</Button>
                    <Button variant="solid" onClick={submit} disabled={!canSubmit}>
                        {isEdit ? (busy ? 'Saving…' : 'Save') : (busy ? 'Creating…' : 'Create')}
                    </Button>
                </div>
            </div>
        </Dialog>
    );
}

export default function HttpProxiesPage() {
    const [proxies, setProxies] = useState<HttpHostMeta[] | null>(null);
    const [sslOptions, setSslOptions] = useState<string[]>([]);
    const [roleOptions, setRoleOptions] = useState<string[]>([]);
    const [toggling, setToggling] = useState<Record<string, boolean>>({});
    const [formOpen, setFormOpen] = useState(false);
    const [editingProxy, setEditingProxy] = useState<string | null>(null);
    const [deletingProxy, setDeletingProxy] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    function refresh() { listHttpProxies().then(setProxies); }

    useEffect(() => {
        refresh();
        listSslCerts().then(setSslOptions);
        listRoles().then(setRoleOptions);
    }, []);

    async function handleToggle(label: string, next: boolean) {
        setToggling(prev => ({ ...prev, [label]: true }));
        if (next) await enableHttpProxy(label);
        else await disableHttpProxy(label);
        setProxies(prev => prev?.map(p => p.label === label ? { ...p, isEnabled: next } : p) ?? null);
        setToggling(prev => ({ ...prev, [label]: false }));
    }

    async function confirmDelete() {
        if (!deletingProxy) return;
        setDeleting(true);
        await deleteHttpProxy(deletingProxy);
        setProxies(prev => prev?.filter(p => p.label !== deletingProxy) ?? null);
        setDeletingProxy(null);
        setDeleting(false);
    }

    function openCreate() { setEditingProxy(null); setFormOpen(true); }
    function openEdit(label: string) { setEditingProxy(label); setFormOpen(true); }

    return (
        <div className="flex flex-col h-full bg-zinc-50 text-zinc-900">
            <Toolbar title="Http Proxies">
                <Button variant="solid" onClick={openCreate}>New Proxy</Button>
            </Toolbar>

            <ProxyFormDialog
                open={formOpen}
                onClose={() => setFormOpen(false)}
                onSaved={() => { setFormOpen(false); refresh(); }}
                editMeta={proxies?.find(p => p.label === editingProxy) ?? null}
                sslOptions={sslOptions}
                roleOptions={roleOptions}
            />

            <div className="flex-1 overflow-auto p-5">
                {proxies === null ? (
                    <div className="flex items-center justify-center h-32 text-sm text-zinc-500">Loading…</div>
                ) : proxies.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 gap-2">
                        <span className="text-sm text-zinc-500">No proxies yet.</span>
                        <Button variant="solid" onClick={openCreate}>New Proxy</Button>
                    </div>
                ) : (
                    <Table
                        columns={[
                            {
                                key: 'isEnabled',
                                label: 'Status',
                                width: '1px',
                                render: (_val, row) => (
                                    <Toggle
                                        checked={row.isEnabled}
                                        onChange={next => handleToggle(row.label, next)}
                                        disabled={toggling[row.label]}
                                    />
                                ),
                            },
                            { key: 'label', label: 'Name' },
                            {
                                key: 'quickSetup.source',
                                label: 'Source',
                                render: (_val, row) => row.quickSetup?.source ?? '',
                            },
                            {
                                key: 'quickSetup.destination',
                                label: 'Destination',
                                render: (_val, row) => row.quickSetup?.destination ?? '',
                            },
                            {
                                key: 'quickSetup.ssl',
                                label: 'SSL',
                                render: (_val, row) => row.quickSetup?.ssl ?? '—',
                            },
                            {
                                key: 'quickSetup.accessRole',
                                label: 'Access Role',
                                render: (_val, row) => row.quickSetup?.accessRole ?? '—',
                            },
                        ]}
                        data={proxies}
                        rowKey={row => row.label}
                        actions={row => (
                            <RowMenu items={[
                                {
                                    label: 'Edit',
                                    icon: <Pencil size={14} strokeWidth={1.75} />,
                                    onClick: () => openEdit(row.label),
                                },
                                {
                                    label: 'Delete',
                                    icon: <Trash2 size={14} strokeWidth={1.75} />,
                                    variant: 'danger',
                                    onClick: () => setDeletingProxy(row.label),
                                },
                            ]} />
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
