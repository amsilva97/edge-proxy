'use client'

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { listSnippets, deleteSnippet, snippetExists, createSnippet } from './scripts';
import { SnippetMeta } from '@/types/types';
import Toolbar from '@/components/toolbar';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Table from '@/components/ui/table';
import Dialog from '@/components/dialog';
import { Pencil, Trash2 } from 'lucide-react';
import RowMenu from '@/components/ui/row-menu';

function NewSnippetDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
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
        if (await snippetExists(slug)) {
            setError('A snippet with that name already exists');
            return;
        }
        await createSnippet(slug);
        router.push(`/snippets/${slug}`);
    }

    function onKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter') submit();
    }

    return (
        <Dialog open={open} title="New Snippet" onCancel={onClose}>
            <div className="flex flex-col gap-4">
                <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-zinc-700">Name</span>
                    <Input
                        ref={inputRef}
                        type="text"
                        value={name}
                        onChange={e => { setName(e.target.value); setError(''); }}
                        onKeyDown={onKeyDown}
                        placeholder="snippet-name"
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

export default function SnippetsPage() {
    const [snippets, setSnippets] = useState<SnippetMeta[] | null>(null);
    const [creating, setCreating] = useState(false);
    const [deletingSnippet, setDeletingSnippet] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        listSnippets().then(setSnippets);
    }, []);

    async function confirmDelete() {
        if (!deletingSnippet) return;
        setDeleting(true);
        await deleteSnippet(deletingSnippet);
        setSnippets(prev => prev?.filter(s => s.label !== deletingSnippet) ?? null);
        setDeletingSnippet(null);
        setDeleting(false);
    }

    return (
        <div className="flex flex-col h-full bg-zinc-50 text-zinc-900">

            <Toolbar title="Snippets">
                <Button variant="solid" onClick={() => setCreating(true)}>New Snippet</Button>
            </Toolbar>

            <NewSnippetDialog open={creating} onClose={() => setCreating(false)} />

            <div className="flex-1 overflow-auto p-5">
                {snippets === null ? (
                    <div className="flex items-center justify-center h-32 text-sm text-zinc-500">
                        Loading…
                    </div>
                ) : snippets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 gap-2">
                        <span className="text-sm text-zinc-500">No snippets yet.</span>
                        <Button variant="solid" onClick={() => setCreating(true)}>New Snippet</Button>
                    </div>
                ) : (
                    <Table
                        columns={[
                            { key: 'label', label: 'Name' },
                            {
                                key: 'attachedTo',
                                label: 'Used By',
                                render: (val: string[]) => (
                                    <span className="text-sm text-zinc-500">
                                        {val.length === 0 ? '—' : val.join(', ')}
                                    </span>
                                ),
                            },
                        ]}
                        data={snippets}
                        rowKey={row => row.label}
                        actions={row => (
                            <RowMenu items={[
                                {
                                    label: 'Edit',
                                    icon: <Pencil size={14} strokeWidth={1.75} />,
                                    onClick: () => router.push(`/snippets/${row.label}`),
                                },
                                {
                                    label: 'Delete',
                                    icon: <Trash2 size={14} strokeWidth={1.75} />,
                                    variant: 'danger',
                                    onClick: () => setDeletingSnippet(row.label),
                                },
                            ]} />
                        )}
                    />
                )}
            </div>

            <Dialog
                open={deletingSnippet !== null}
                title={`Delete '${deletingSnippet}'`}
                onCancel={() => !deleting && setDeletingSnippet(null)}
            >
                <p className="text-sm text-zinc-600 mb-4">This cannot be undone.</p>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setDeletingSnippet(null)} disabled={deleting}>Cancel</Button>
                    <Button variant="solid" color="danger" onClick={confirmDelete} disabled={deleting}>
                        {deleting ? 'Deleting…' : 'Delete'}
                    </Button>
                </div>
            </Dialog>

        </div>
    );
}
