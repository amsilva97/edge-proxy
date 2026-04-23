'use client'

import { useEffect, useRef, useState } from 'react';
import { listCerts, saveCert, replaceCert, deleteCert, certExists, enableCert, disableCert } from './scripts';
import { AppData } from '@/libs/appData';
import Toolbar from '@/components/toolbar';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Table from '@/components/ui/table';
import Toggle from '@/components/ui/toggle';
import Dialog from '@/components/dialog';
import { Trash2, RefreshCw } from 'lucide-react';
import Chip from '@/components/ui/chip';
import RowMenu from '@/components/ui/row-menu';

function CertField({
    label,
    accept,
    onContent,
}: {
    label: string;
    accept: string;
    onContent: (content: string) => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [mode, setMode] = useState<'file' | 'paste'>('file');
    const [fileName, setFileName] = useState('');
    const [pasted, setPasted] = useState('');

    function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = ev => onContent(ev.target?.result as string ?? '');
        reader.readAsText(file);
    }

    function handlePaste(e: React.ChangeEvent<HTMLTextAreaElement>) {
        setPasted(e.target.value);
        onContent(e.target.value);
    }

    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-700">{label}</span>
                <div className="flex text-xs border border-zinc-200 rounded-md overflow-hidden">
                    {(['file', 'paste'] as const).map(m => (
                        <button
                            key={m}
                            type="button"
                            onClick={() => setMode(m)}
                            className={`px-2.5 py-0.5 transition-colors ${mode === m ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-800'}`}
                        >
                            {m === 'file' ? 'File' : 'Paste'}
                        </button>
                    ))}
                </div>
            </div>

            {mode === 'file' ? (
                <div
                    className="flex items-center px-3 py-1.5 border border-zinc-300 rounded-md text-sm cursor-pointer hover:border-zinc-400 transition-colors bg-white"
                    onClick={() => inputRef.current?.click()}
                >
                    <span className={fileName ? 'text-zinc-900' : 'text-zinc-400'}>
                        {fileName || 'Choose file…'}
                    </span>
                    <input
                        ref={inputRef}
                        type="file"
                        accept={accept}
                        className="hidden"
                        onChange={handleFile}
                    />
                </div>
            ) : (
                <textarea
                    value={pasted}
                    onChange={handlePaste}
                    placeholder="-----BEGIN CERTIFICATE-----&#10;…&#10;-----END CERTIFICATE-----"
                    rows={5}
                    className="px-3 py-2 border border-zinc-300 rounded-md text-xs font-mono text-zinc-900 placeholder-zinc-400 resize-none focus:outline-none focus:border-zinc-500 bg-white"
                />
            )}
        </div>
    );
}

function AddCertDialog({
    open,
    onClose,
    onAdded,
}: {
    open: boolean;
    onClose: () => void;
    onAdded: (cert: AppData.SslMeta) => void;
}) {
    const [label, setLabel] = useState('');
    const [certContent, setCertContent] = useState('');
    const [keyContent, setKeyContent] = useState('');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const labelRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open) {
            setLabel('');
            setCertContent('');
            setKeyContent('');
            setError('');
            setTimeout(() => labelRef.current?.focus(), 50);
        }
    }, [open]);

    async function handleSubmit() {
        const slug = label.trim();
        if (!slug) { setError('Label is required'); return; }
        if (!certContent) { setError('Certificate file is required'); return; }
        if (!keyContent) { setError('Key file is required'); return; }
        if (await certExists(slug)) { setError('A certificate with that label already exists'); return; }
        setSaving(true);
        await saveCert(slug, certContent, keyContent);
        onAdded({ label: slug, isEnabled: false, usedBy: '' });
        setSaving(false);
        onClose();
    }

    function onKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter' && !saving) handleSubmit();
    }

    return (
        <Dialog open={open} title="Add Certificate" onCancel={saving ? undefined : onClose}>
            <div className="flex flex-col gap-4">
                <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-zinc-700">Label</span>
                    <Input
                        ref={labelRef}
                        type="text"
                        value={label}
                        onChange={e => { setLabel(e.target.value); setError(''); }}
                        onKeyDown={onKeyDown}
                        placeholder="my-cert"
                    />
                </label>

                <CertField
                    label="Certificate (.crt / .pem)"
                    accept=".crt,.pem"
                    onContent={(c: string) => { setCertContent(c); setError(''); }}
                />

                <CertField
                    label="Certificate Key (.key / .pem)"
                    accept=".key,.pem"
                    onContent={(c: string) => { setKeyContent(c); setError(''); }}
                />

                {error && <span className="text-xs text-red-500">{error}</span>}

                <div className="flex justify-end gap-2 pt-1">
                    <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
                    <Button variant="solid" onClick={handleSubmit} disabled={saving}>
                        {saving ? 'Adding…' : 'Add'}
                    </Button>
                </div>
            </div>
        </Dialog>
    );
}

function ReplaceCertDialog({
    label,
    onClose,
}: {
    label: string | null;
    onClose: () => void;
}) {
    const [certContent, setCertContent] = useState('');
    const [keyContent, setKeyContent] = useState('');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (label) { setCertContent(''); setKeyContent(''); setError(''); }
    }, [label]);

    async function handleSubmit() {
        if (!label) return;
        if (!certContent) { setError('Certificate file is required'); return; }
        if (!keyContent) { setError('Key file is required'); return; }
        setSaving(true);
        await replaceCert(label, certContent, keyContent);
        setSaving(false);
        onClose();
    }

    return (
        <Dialog open={label !== null} title={`Replace '${label}'`} onCancel={saving ? undefined : onClose}>
            <div className="flex flex-col gap-4">
                <CertField
                    label="Certificate (.crt / .pem)"
                    accept=".crt,.pem"
                    onContent={(c: string) => { setCertContent(c); setError(''); }}
                />
                <CertField
                    label="Certificate Key (.key / .pem)"
                    accept=".key,.pem"
                    onContent={(c: string) => { setKeyContent(c); setError(''); }}
                />
                {error && <span className="text-xs text-red-500">{error}</span>}
                <div className="flex justify-end gap-2 pt-1">
                    <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
                    <Button variant="solid" onClick={handleSubmit} disabled={saving}>
                        {saving ? 'Replacing…' : 'Replace'}
                    </Button>
                </div>
            </div>
        </Dialog>
    );
}

export default function SslPage() {
    const [certs, setCerts] = useState<AppData.SslMeta[] | null>(null);
    const [toggling, setToggling] = useState<Record<string, boolean>>({});
    const [adding, setAdding] = useState(false);
    const [replacingLabel, setReplacingLabel] = useState<string | null>(null);
    const [deletingLabel, setDeletingLabel] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        listCerts().then(setCerts);
    }, []);

    async function handleToggle(label: string, next: boolean) {
        setToggling(prev => ({ ...prev, [label]: true }));
        if (next) await enableCert(label);
        else await disableCert(label);
        setCerts(prev => prev?.map(c => c.label === label ? { ...c, isEnabled: next } : c) ?? null);
        setToggling(prev => ({ ...prev, [label]: false }));
    }

    async function confirmDelete() {
        if (!deletingLabel) return;
        setDeleting(true);
        await deleteCert(deletingLabel);
        setCerts(prev => prev?.filter(c => c.label !== deletingLabel) ?? null);
        setDeletingLabel(null);
        setDeleting(false);
    }

    return (
        <div className="flex flex-col h-full bg-zinc-50 text-zinc-900">

            <Toolbar title="SSL Certificates">
                <Button variant="solid" onClick={() => setAdding(true)}>Add Certificate</Button>
            </Toolbar>

            <div className="flex-1 overflow-auto p-5">
                {certs === null ? (
                    <div className="flex items-center justify-center h-32 text-sm text-zinc-500">
                        Loading…
                    </div>
                ) : certs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 gap-2">
                        <span className="text-sm text-zinc-500">No certificates yet.</span>
                        <Button variant="solid" onClick={() => setAdding(true)}>Add Certificate</Button>
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
                                        checked={row.isEnabled}
                                        onChange={next => handleToggle(row.label, next)}
                                        disabled={toggling[row.label]}
                                    />
                                ),
                            },
                            { key: 'label', label: 'Label' },
                            {
                                key: 'usedBy',
                                label: 'In Use',
                                width: '1px',
                                render: (_val, row) => row.usedBy
                                    ? <Chip label="Used" color="brand" variant="solid" />
                                    : <Chip label="Unused" color="zinc" variant="outline" />,
                            },
                        ]}
                        data={certs}
                        rowKey={row => row.label}
                        actions={row => (
                            <RowMenu items={[
                                {
                                    label: 'Replace',
                                    icon: <RefreshCw size={14} strokeWidth={1.75} />,
                                    onClick: () => setReplacingLabel(row.label),
                                },
                                {
                                    label: 'Delete',
                                    icon: <Trash2 size={14} strokeWidth={1.75} />,
                                    variant: 'danger',
                                    onClick: () => setDeletingLabel(row.label),
                                },
                            ]} />
                        )}
                    />
                )}
            </div>

            <AddCertDialog
                open={adding}
                onClose={() => setAdding(false)}
                onAdded={cert => setCerts(prev => [...(prev ?? []), cert])}
            />

            <ReplaceCertDialog
                label={replacingLabel}
                onClose={() => setReplacingLabel(null)}
            />

            <Dialog
                open={deletingLabel !== null}
                title={`Delete '${deletingLabel}'`}
                onCancel={() => !deleting && setDeletingLabel(null)}
            >
                <p className="text-sm text-zinc-600 mb-4">This will permanently remove the certificate and key files.</p>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setDeletingLabel(null)} disabled={deleting}>Cancel</Button>
                    <Button variant="solid" color="danger" onClick={confirmDelete} disabled={deleting}>
                        {deleting ? 'Deleting…' : 'Delete'}
                    </Button>
                </div>
            </Dialog>

        </div>
    );
}
