'use client'

import { useEffect, useRef, useState } from 'react';
import { HttpHostMeta } from '@/types/types';
import {
    listHttpRedirects, redirectExists, saveHttpRedirect,
    deleteHttpRedirect, enableHttpRedirect, disableHttpRedirect,
} from './scripts';
import Toggle from '@/components/ui/toggle';
import Toolbar from '@/components/toolbar';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Table from '@/components/ui/table';
import Dialog from '@/components/dialog';
import { Pencil, Trash2 } from 'lucide-react';
import RowMenu from '@/components/ui/row-menu';

interface RedirectFormDialogProps {
    open: boolean;
    onClose: () => void;
    onSaved: (meta: HttpHostMeta) => void;
    editMeta: HttpHostMeta | null;
}

function RedirectFormDialog({ open, onClose, onSaved, editMeta }: RedirectFormDialogProps) {
    const [name, setName] = useState('');
    const [source, setSource] = useState('');
    const [destination, setDestination] = useState('');
    const [isPermanent, setIsPermanent] = useState(false);
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
            setIsPermanent(editMeta.quickSetup?.isPermanent !== 'false');
            setTimeout(() => sourceRef.current?.focus(), 50);
        } else {
            setName('');
            setSource('');
            setDestination('');
            setIsPermanent(false);
            setTimeout(() => nameRef.current?.focus(), 50);
        }
    }, [open, editMeta]);

    async function submit() {
        const slug = isEdit ? editMeta!.label : name.trim();
        if (!slug || !source.trim() || !destination.trim()) return;
        setBusy(true);
        if (!isEdit && await redirectExists(slug)) {
            setError('A redirect with that name already exists');
            setBusy(false);
            return;
        }
        const meta = await saveHttpRedirect(slug, source.trim(), destination.trim(), isPermanent);
        onSaved(meta);
        setBusy(false);
    }

    function onKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter') submit();
    }

    const canSubmit = !busy && (isEdit || !!name.trim()) && !!source.trim() && !!destination.trim();

    return (
        <Dialog open={open} title={isEdit ? `Edit '${editMeta!.label}'` : 'New Redirect'} onCancel={onClose}>
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
                            placeholder="my-redirect"
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
                    <div className="flex items-stretch rounded-md border border-zinc-300 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20 overflow-hidden">
                        <span className="flex items-center bg-zinc-50 px-2.5 text-sm text-zinc-500 border-r border-zinc-300 select-none whitespace-nowrap">https://</span>
                        <input
                            type="text"
                            value={destination}
                            onChange={e => setDestination(e.target.value)}
                            onKeyDown={onKeyDown}
                            placeholder="new.example.com"
                            className="flex-1 min-w-0 px-3 py-1.5 text-sm bg-white text-zinc-900 placeholder:text-zinc-400 outline-none"
                        />
                    </div>
                </label>
                <label className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-zinc-700">
                        Permanent
                        <span className="ml-1.5 text-zinc-400 font-normal text-xs">(301 vs 302)</span>
                    </span>
                    <Toggle checked={isPermanent} onChange={setIsPermanent} />
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

export default function HttpRedirectsPage() {
    const [redirects, setRedirects] = useState<HttpHostMeta[] | null>(null);
    const [toggling, setToggling] = useState<Record<string, boolean>>({});
    const [formOpen, setFormOpen] = useState(false);
    const [editingRedirect, setEditingRedirect] = useState<string | null>(null);
    const [deletingRedirect, setDeletingRedirect] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    function refresh() { listHttpRedirects().then(setRedirects); }

    useEffect(() => { refresh(); }, []);

    async function handleToggle(label: string, next: boolean) {
        setToggling(prev => ({ ...prev, [label]: true }));
        const meta = next ? await enableHttpRedirect(label) : await disableHttpRedirect(label);
        if (meta) setRedirects(prev => prev?.map(r => r.label === label ? meta : r) ?? null);
        setToggling(prev => ({ ...prev, [label]: false }));
    }

    async function confirmDelete() {
        if (!deletingRedirect) return;
        setDeleting(true);
        await deleteHttpRedirect(deletingRedirect);
        setRedirects(prev => prev?.filter(r => r.label !== deletingRedirect) ?? null);
        setDeletingRedirect(null);
        setDeleting(false);
    }

    function openCreate() { setEditingRedirect(null); setFormOpen(true); }
    function openEdit(label: string) { setEditingRedirect(label); setFormOpen(true); }

    return (
        <div className="flex flex-col h-full bg-zinc-50 text-zinc-900">
            <Toolbar title="Http Redirects">
                <Button variant="solid" onClick={openCreate}>New Redirect</Button>
            </Toolbar>

            <RedirectFormDialog
                open={formOpen}
                onClose={() => setFormOpen(false)}
                onSaved={meta => {
                    setFormOpen(false);
                    setRedirects(prev => {
                        if (!prev) return [meta];
                        const idx = prev.findIndex(r => r.label === meta.label);
                        return idx >= 0 ? prev.map(r => r.label === meta.label ? meta : r) : [...prev, meta];
                    });
                }}
                editMeta={redirects?.find(r => r.label === editingRedirect) ?? null}
            />

            <div className="flex-1 overflow-auto p-5">
                {redirects === null ? (
                    <div className="flex items-center justify-center h-32 text-sm text-zinc-500">Loading…</div>
                ) : redirects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 gap-2">
                        <span className="text-sm text-zinc-500">No redirects yet.</span>
                        <Button variant="solid" onClick={openCreate}>New Redirect</Button>
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
                                key: 'quickSetup.isPermanent',
                                label: 'Type',
                                render: (_val, row) => row.quickSetup?.isPermanent === 'false' ? '302 Temporary' : '301 Permanent',
                            },
                        ]}
                        data={redirects}
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
                                    onClick: () => setDeletingRedirect(row.label),
                                },
                            ]} />
                        )}
                    />
                )}
            </div>

            <Dialog
                open={deletingRedirect !== null}
                title={`Delete '${deletingRedirect}'`}
                onCancel={() => !deleting && setDeletingRedirect(null)}
            >
                <p className="text-sm text-zinc-600 mb-4">This cannot be undone.</p>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setDeletingRedirect(null)} disabled={deleting}>Cancel</Button>
                    <Button variant="solid" color="danger" onClick={confirmDelete} disabled={deleting}>
                        {deleting ? 'Deleting…' : 'Delete'}
                    </Button>
                </div>
            </Dialog>
        </div>
    );
}
