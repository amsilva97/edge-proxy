'use client'

import { useEffect, useRef, useState } from 'react';
import { HttpHostMeta } from '@/types/types';
import { findOrphans, importOrphan, importRawConfig } from './scripts';
import Toolbar from '@/components/toolbar';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Table from '@/components/ui/table';
import Dialog from '@/components/dialog';

const textareaCls = 'h-48 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-mono text-zinc-900 placeholder:text-zinc-400 outline-none resize-none transition-[border-color,box-shadow] focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:opacity-50 disabled:cursor-not-allowed';

interface ImportConfigDialogProps {
    open: boolean;
    onClose: () => void;
    onImported: (meta: HttpHostMeta) => void;
}

function ImportConfigDialog({ open, onClose, onImported }: ImportConfigDialogProps) {
    const [name, setName] = useState('');
    const [config, setConfig] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const nameRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!open) return;
        setName('');
        setConfig('');
        setError('');
        setBusy(false);
        setTimeout(() => nameRef.current?.focus(), 50);
    }, [open]);

    async function submit() {
        const slug = name.trim();
        if (!slug || !config.trim()) return;
        setBusy(true);
        setError('');
        try {
            const meta = await importRawConfig(slug, config.trim());
            onImported(meta);
        } catch (err: any) {
            setError(String(err?.message ?? err));
            setBusy(false);
        }
    }

    function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') submit();
    }

    const canSubmit = !busy && !!name.trim() && !!config.trim();

    return (
        <Dialog open={open} title="Import Config" onCancel={onClose}>
            <div className="flex flex-col gap-4">
                <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-zinc-700">Name</span>
                    <Input
                        ref={nameRef}
                        type="text"
                        value={name}
                        onChange={e => { setName(e.target.value); setError(''); }}
                        onKeyDown={onKeyDown}
                        placeholder="my-host"
                        disabled={busy}
                        className="w-full"
                    />
                </label>
                <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-zinc-700">Config</span>
                    <textarea
                        value={config}
                        onChange={e => { setConfig(e.target.value); setError(''); }}
                        placeholder="Paste your nginx config here…"
                        className={textareaCls}
                        disabled={busy}
                    />
                </label>
                {error && <span className="text-xs text-red-500">{error}</span>}
                <div className="flex justify-end gap-2 pt-1">
                    <Button variant="outline" onClick={onClose} disabled={busy}>Cancel</Button>
                    <Button variant="solid" onClick={submit} disabled={!canSubmit}>
                        {busy ? 'Importing…' : 'Import'}
                    </Button>
                </div>
            </div>
        </Dialog>
    );
}

export default function ImportPage() {
    const [orphans, setOrphans] = useState<string[] | null>(null);
    const [importing, setImporting] = useState<Record<string, boolean>>({});
    const [dialogOpen, setDialogOpen] = useState(false);

    function refresh() { findOrphans().then(setOrphans); }
    useEffect(() => { refresh(); }, []);

    async function handleImportOrphan(name: string) {
        setImporting(prev => ({ ...prev, [name]: true }));
        try {
            await importOrphan(name);
            setOrphans(prev => prev?.filter(o => o !== name) ?? null);
        } finally {
            setImporting(prev => { const next = { ...prev }; delete next[name]; return next; });
        }
    }

    return (
        <div className="flex flex-col h-full bg-zinc-50 text-zinc-900">
            <Toolbar title="Import">
                <Button variant="solid" onClick={() => setDialogOpen(true)}>Import Config</Button>
            </Toolbar>

            <ImportConfigDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onImported={() => setDialogOpen(false)}
            />

            <div className="flex-1 overflow-auto p-5">
                {orphans === null ? (
                    <div className="flex items-center justify-center h-32 text-sm text-zinc-500">Loading…</div>
                ) : orphans.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 gap-2">
                        <span className="text-sm text-zinc-500">No orphaned hosts found.</span>
                        <Button variant="outline" onClick={() => setDialogOpen(true)}>Import Config</Button>
                    </div>
                ) : (
                    <Table
                        columns={[{ key: 'name', label: 'Host' }]}
                        data={orphans.map(name => ({ name }))}
                        rowKey={row => row.name}
                        actions={row => (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleImportOrphan(row.name)}
                                disabled={importing[row.name]}
                            >
                                {importing[row.name] ? 'Importing…' : 'Import'}
                            </Button>
                        )}
                    />
                )}
            </div>
        </div>
    );
}
