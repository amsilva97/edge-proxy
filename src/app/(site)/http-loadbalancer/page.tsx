'use client'

import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { HttpHostMeta } from '@/types/types';
import {
    listLoadbalancers, loadbalancerExists, saveLoadbalancer,
    deleteLoadbalancer, enableLoadbalancer, disableLoadbalancer,
    listSslCerts, listRoles,
} from './scripts';
import Toggle from '@/components/ui/toggle';
import Toolbar from '@/components/toolbar';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Table from '@/components/ui/table';
import Dialog from '@/components/dialog';
import { Pencil, Trash2, X } from 'lucide-react';
import RowMenu from '@/components/ui/row-menu';

const selectCls = 'h-9 w-full rounded-md border border-zinc-300 bg-white px-2.5 text-sm text-zinc-900 outline-none transition-[border-color,box-shadow] focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:opacity-50 disabled:cursor-not-allowed';

interface LBFormDialogProps {
    open: boolean;
    onClose: () => void;
    onSaved: (meta: HttpHostMeta) => void;
    editMeta: HttpHostMeta | null;
    sslOptions: string[];
    roleOptions: string[];
}

function LBFormDialog({ open, onClose, onSaved, editMeta, sslOptions, roleOptions }: LBFormDialogProps) {
    const [name, setName] = useState('');
    const [source, setSource] = useState('');
    const [servers, setServers] = useState<string[]>([]);
    const [serverInput, setServerInput] = useState('');
    const [ssl, setSsl] = useState('');
    const [accessRole, setAccessRole] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const nameRef = useRef<HTMLInputElement>(null);
    const sourceRef = useRef<HTMLInputElement>(null);
    const serverInputRef = useRef<HTMLInputElement>(null);
    const isEdit = editMeta !== null;

    useEffect(() => {
        if (!open) return;
        setError('');
        setBusy(false);
        setServerInput('');
        if (editMeta) {
            setSource(editMeta.quickSetup?.source ?? '');
            setServers(editMeta.quickSetup?.servers ? editMeta.quickSetup.servers.split(',').filter(Boolean) : []);
            setSsl(editMeta.quickSetup?.ssl ?? '');
            setAccessRole(editMeta.quickSetup?.accessRole ?? '');
            setTimeout(() => sourceRef.current?.focus(), 50);
        } else {
            setName('');
            setSource('');
            setServers([]);
            setSsl('');
            setAccessRole('');
            setTimeout(() => nameRef.current?.focus(), 50);
        }
    }, [open, editMeta]);

    function addServer() {
        const val = serverInput.trim();
        if (!val || servers.includes(val)) return;
        setServers(prev => [...prev, val]);
        setServerInput('');
        serverInputRef.current?.focus();
    }

    function removeServer(s: string) {
        setServers(prev => prev.filter(x => x !== s));
    }

    async function submit() {
        const slug = isEdit ? editMeta!.label : name.trim();
        if (!slug || !source.trim() || servers.length === 0) return;
        setBusy(true);
        if (!isEdit && await loadbalancerExists(slug)) {
            setError('A load balancer with that name already exists');
            setBusy(false);
            return;
        }
        const meta = await saveLoadbalancer(slug, source.trim(), servers, ssl.trim() || null, accessRole.trim() || null);
        onSaved(meta);
        setBusy(false);
    }

    const canSubmit = !busy && (isEdit || !!name.trim()) && !!source.trim() && servers.length > 0;

    return (
        <Dialog open={open} title={isEdit ? `Edit '${editMeta!.label}'` : 'New Load Balancer'} onCancel={onClose}>
            <div className="flex flex-col gap-4">
                {!isEdit && (
                    <label className="flex flex-col gap-1.5">
                        <span className="text-sm font-medium text-zinc-700">Name</span>
                        <Input
                            ref={nameRef}
                            type="text"
                            value={name}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => { setName(e.target.value); setError(''); }}
                            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && submit()}
                            placeholder="my-loadbalancer"
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
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setSource(e.target.value)}
                        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && submit()}
                        placeholder="example.com"
                    />
                </label>
                <div className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-zinc-700">Backend Servers</span>
                    {servers.length > 0 && (
                        <div className="flex flex-col gap-1 mb-1">
                            {servers.map(s => (
                                <div key={s} className="flex items-center justify-between gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1.5">
                                    <span className="text-sm font-mono text-zinc-700">{s}</span>
                                    <button onClick={() => removeServer(s)} className="text-zinc-400 hover:text-red-500 transition-colors">
                                        <X size={14} strokeWidth={2} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="flex gap-2">
                        <Input
                            ref={serverInputRef}
                            type="text"
                            value={serverInput}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setServerInput(e.target.value)}
                            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && addServer()}
                            placeholder="192.168.1.10:3000"
                            className="flex-1"
                        />
                        <Button variant="outline" onClick={addServer} disabled={!serverInput.trim()}>Add</Button>
                    </div>
                </div>
                <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-zinc-700">
                        SSL Certificate{' '}
                        <span className="text-zinc-400 font-normal">(optional)</span>
                    </span>
                    <select value={ssl} onChange={e => setSsl(e.target.value)} className={selectCls}>
                        <option value="">None</option>
                        {sslOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </label>
                <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-zinc-700">
                        Access Role{' '}
                        <span className="text-zinc-400 font-normal">(optional)</span>
                    </span>
                    <select value={accessRole} onChange={e => setAccessRole(e.target.value)} className={selectCls}>
                        <option value="">None</option>
                        {roleOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
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

export default function HttpLoadbalancerPage() {
    const [lbs, setLbs] = useState<HttpHostMeta[] | null>(null);
    const [sslOptions, setSslOptions] = useState<string[]>([]);
    const [roleOptions, setRoleOptions] = useState<string[]>([]);
    const [toggling, setToggling] = useState<Record<string, boolean>>({});
    const [formOpen, setFormOpen] = useState(false);
    const [editingLb, setEditingLb] = useState<string | null>(null);
    const [deletingLb, setDeletingLb] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    function refresh() { listLoadbalancers().then(setLbs); }

    useEffect(() => {
        refresh();
        listSslCerts().then(setSslOptions);
        listRoles().then(setRoleOptions);
    }, []);

    async function handleToggle(label: string, next: boolean) {
        setToggling(prev => ({ ...prev, [label]: true }));
        const meta = next ? await enableLoadbalancer(label) : await disableLoadbalancer(label);
        if (meta) setLbs(prev => prev?.map(lb => lb.label === label ? meta : lb) ?? null);
        setToggling(prev => ({ ...prev, [label]: false }));
    }

    async function confirmDelete() {
        if (!deletingLb) return;
        setDeleting(true);
        await deleteLoadbalancer(deletingLb);
        setLbs(prev => prev?.filter(lb => lb.label !== deletingLb) ?? null);
        setDeletingLb(null);
        setDeleting(false);
    }

    function openCreate() { setEditingLb(null); setFormOpen(true); }
    function openEdit(label: string) { setEditingLb(label); setFormOpen(true); }

    return (
        <div className="flex flex-col h-full bg-zinc-50 text-zinc-900">
            <Toolbar title="Load Balancers">
                <Button variant="solid" onClick={openCreate}>New Load Balancer</Button>
            </Toolbar>

            <LBFormDialog
                open={formOpen}
                onClose={() => setFormOpen(false)}
                onSaved={meta => {
                    setFormOpen(false);
                    setLbs(prev => {
                        if (!prev) return [meta];
                        const idx = prev.findIndex(lb => lb.label === meta.label);
                        return idx >= 0 ? prev.map(lb => lb.label === meta.label ? meta : lb) : [...prev, meta];
                    });
                }}
                editMeta={lbs?.find(lb => lb.label === editingLb) ?? null}
                sslOptions={sslOptions}
                roleOptions={roleOptions}
            />

            <div className="flex-1 overflow-auto p-5">
                {lbs === null ? (
                    <div className="flex items-center justify-center h-32 text-sm text-zinc-500">Loading…</div>
                ) : lbs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 gap-2">
                        <span className="text-sm text-zinc-500">No load balancers yet.</span>
                        <Button variant="solid" onClick={openCreate}>New Load Balancer</Button>
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
                                key: 'quickSetup.servers',
                                label: 'Servers',
                                render: (_val, row) => {
                                    const list = row.quickSetup?.servers?.split(',').filter(Boolean) ?? [];
                                    return list.length > 0
                                        ? `${list[0]}${list.length > 1 ? ` +${list.length - 1} more` : ''}`
                                        : '—';
                                },
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
                        data={lbs}
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
                                    onClick: () => setDeletingLb(row.label),
                                },
                            ]} />
                        )}
                    />
                )}
            </div>

            <Dialog
                open={deletingLb !== null}
                title={`Delete '${deletingLb}'`}
                onCancel={() => !deleting && setDeletingLb(null)}
            >
                <p className="text-sm text-zinc-600 mb-4">This cannot be undone.</p>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setDeletingLb(null)} disabled={deleting}>Cancel</Button>
                    <Button variant="solid" color="danger" onClick={confirmDelete} disabled={deleting}>
                        {deleting ? 'Deleting…' : 'Delete'}
                    </Button>
                </div>
            </Dialog>
        </div>
    );
}
