'use client'

import { useEffect, useRef, useState } from 'react';
import { HttpHostMeta } from '@/types/types';
import {
    listHttpStatics, staticExists, saveHttpStatic,
    deleteHttpStatic, enableHttpStatic, disableHttpStatic,
    listSslCerts, listRoles,
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

interface StaticFormDialogProps {
    open: boolean;
    onClose: () => void;
    onSaved: (meta: HttpHostMeta) => void;
    editMeta: HttpHostMeta | null;
    sslOptions: string[];
    roleOptions: string[];
}

function StaticFormDialog({ open, onClose, onSaved, editMeta, sslOptions, roleOptions }: StaticFormDialogProps) {
    const [name, setName] = useState('');
    const [source, setSource] = useState('');
    const [pathToFile, setPathToFile] = useState('');
    const [isSpa, setIsSpa] = useState(false);
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
            setPathToFile(editMeta.quickSetup?.pathToFile ?? '');
            setIsSpa(editMeta.quickSetup?.isSpa === 'true');
            setSsl(editMeta.quickSetup?.ssl ?? '');
            setAccessRole(editMeta.quickSetup?.accessRole ?? '');
            setTimeout(() => sourceRef.current?.focus(), 50);
        } else {
            setName('');
            setSource('');
            setPathToFile('');
            setIsSpa(false);
            setSsl('');
            setAccessRole('');
            setTimeout(() => nameRef.current?.focus(), 50);
        }
    }, [open, editMeta]);

    async function submit() {
        const slug = isEdit ? editMeta!.label : name.trim();
        if (!slug || !source.trim() || !pathToFile.trim()) return;
        setBusy(true);
        if (!isEdit && await staticExists(slug)) {
            setError('A static host with that name already exists');
            setBusy(false);
            return;
        }
        const meta = await saveHttpStatic(slug, source.trim(), pathToFile.trim(), isSpa, ssl.trim() || null, accessRole.trim() || null);
        onSaved(meta);
        setBusy(false);
    }

    function onKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter') submit();
    }

    const canSubmit = !busy && (isEdit || !!name.trim()) && !!source.trim() && !!pathToFile.trim();

    return (
        <Dialog open={open} title={isEdit ? `Edit '${editMeta!.label}'` : 'New Static Host'} onCancel={onClose}>
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
                            placeholder="my-site"
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
                    <span className="text-sm font-medium text-zinc-700">Path to Files</span>
                    <Input
                        type="text"
                        value={pathToFile}
                        onChange={e => setPathToFile(e.target.value)}
                        onKeyDown={onKeyDown}
                        placeholder="/var/www/html"
                    />
                </label>
                <label className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-zinc-700">
                        Single Page App
                        <span className="ml-1.5 text-zinc-400 font-normal text-xs">(routes fall back to index.html)</span>
                    </span>
                    <Toggle checked={isSpa} onChange={setIsSpa} />
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

export default function HttpStaticPage() {
    const [statics, setStatics] = useState<HttpHostMeta[] | null>(null);
    const [sslOptions, setSslOptions] = useState<string[]>([]);
    const [roleOptions, setRoleOptions] = useState<string[]>([]);
    const [toggling, setToggling] = useState<Record<string, boolean>>({});
    const [formOpen, setFormOpen] = useState(false);
    const [editingStatic, setEditingStatic] = useState<string | null>(null);
    const [deletingStatic, setDeletingStatic] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    function refresh() { listHttpStatics().then(setStatics); }

    useEffect(() => {
        refresh();
        listSslCerts().then(setSslOptions);
        listRoles().then(setRoleOptions);
    }, []);

    async function handleToggle(label: string, next: boolean) {
        setToggling(prev => ({ ...prev, [label]: true }));
        const meta = next ? await enableHttpStatic(label) : await disableHttpStatic(label);
        if (meta) setStatics(prev => prev?.map(s => s.label === label ? meta : s) ?? null);
        setToggling(prev => ({ ...prev, [label]: false }));
    }

    async function confirmDelete() {
        if (!deletingStatic) return;
        setDeleting(true);
        await deleteHttpStatic(deletingStatic);
        setStatics(prev => prev?.filter(s => s.label !== deletingStatic) ?? null);
        setDeletingStatic(null);
        setDeleting(false);
    }

    function openCreate() { setEditingStatic(null); setFormOpen(true); }
    function openEdit(label: string) { setEditingStatic(label); setFormOpen(true); }

    return (
        <div className="flex flex-col h-full bg-zinc-50 text-zinc-900">
            <Toolbar title="Http Static">
                <Button variant="solid" onClick={openCreate}>New Static Host</Button>
            </Toolbar>

            <StaticFormDialog
                open={formOpen}
                onClose={() => setFormOpen(false)}
                onSaved={meta => {
                    setFormOpen(false);
                    setStatics(prev => {
                        if (!prev) return [meta];
                        const idx = prev.findIndex(s => s.label === meta.label);
                        return idx >= 0 ? prev.map(s => s.label === meta.label ? meta : s) : [...prev, meta];
                    });
                }}
                editMeta={statics?.find(s => s.label === editingStatic) ?? null}
                sslOptions={sslOptions}
                roleOptions={roleOptions}
            />

            <div className="flex-1 overflow-auto p-5">
                {statics === null ? (
                    <div className="flex items-center justify-center h-32 text-sm text-zinc-500">Loading…</div>
                ) : statics.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 gap-2">
                        <span className="text-sm text-zinc-500">No static hosts yet.</span>
                        <Button variant="solid" onClick={openCreate}>New Static Host</Button>
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
                                key: 'quickSetup.pathToFile',
                                label: 'Path',
                                render: (_val, row) => row.quickSetup?.pathToFile ?? '',
                            },
                            {
                                key: 'quickSetup.isSpa',
                                label: 'SPA',
                                render: (_val, row) => row.quickSetup?.isSpa === 'true' ? 'Yes' : 'No',
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
                        data={statics}
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
                                    onClick: () => setDeletingStatic(row.label),
                                },
                            ]} />
                        )}
                    />
                )}
            </div>

            <Dialog
                open={deletingStatic !== null}
                title={`Delete '${deletingStatic}'`}
                onCancel={() => !deleting && setDeletingStatic(null)}
            >
                <p className="text-sm text-zinc-600 mb-4">This cannot be undone.</p>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setDeletingStatic(null)} disabled={deleting}>Cancel</Button>
                    <Button variant="solid" color="danger" onClick={confirmDelete} disabled={deleting}>
                        {deleting ? 'Deleting…' : 'Delete'}
                    </Button>
                </div>
            </Dialog>
        </div>
    );
}
