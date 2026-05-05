'use client'

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Role } from '@/types/types';
import { listRoles, saveRole, roleExists } from './scripts';
import Toolbar from '@/components/toolbar';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Table from '@/components/ui/table';
import Dialog from '@/components/dialog';
import Chip from '@/components/ui/chip';

function PasswordCell({ pass }: { pass: string | null }) {
    if (pass === null) return <Chip label="Disabled" color="zinc" />;
    return <span className="font-mono tracking-widest text-zinc-400 select-none">{'●'.repeat(12)}</span>;
}

interface NewRoleDialogProps {
    open: boolean;
    onClose: () => void;
    onSaved: () => void;
}

function NewRoleDialog({ open, onClose, onSaved }: NewRoleDialogProps) {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const nameRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!open) return;
        setName(''); setPassword(''); setError(''); setBusy(false);
        setTimeout(() => nameRef.current?.focus(), 50);
    }, [open]);

    async function submit() {
        const slug = name.trim();
        if (!slug) return;
        setBusy(true);
        if (await roleExists(slug)) {
            setError('A role with that name already exists');
            setBusy(false);
            return;
        }
        await saveRole({ name: slug, pass: password.trim() || null, inheritedBy: [] });
        onSaved();
        setBusy(false);
    }

    return (
        <Dialog open={open} title="New Role" onCancel={onClose}>
            <div className="flex flex-col gap-4">
                <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-zinc-700">Name</span>
                    <Input ref={nameRef} type="text" value={name}
                        onChange={e => { setName(e.target.value); setError(''); }}
                        onKeyDown={e => e.key === 'Enter' && submit()}
                        placeholder="admin" />
                    {error && <span className="text-xs text-red-500">{error}</span>}
                </label>
                <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-zinc-700">
                        Password <span className="text-zinc-400 font-normal">(optional — leave blank to disable login)</span>
                    </span>
                    <Input type="password" value={password}
                        onChange={e => setPassword(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && submit()}
                        placeholder="••••••••" />
                </label>
                <div className="flex justify-end gap-2 pt-1">
                    <Button variant="outline" onClick={onClose} disabled={busy}>Cancel</Button>
                    <Button variant="solid" onClick={submit} disabled={busy || !name.trim()}>
                        {busy ? 'Creating…' : 'Create'}
                    </Button>
                </div>
            </div>
        </Dialog>
    );
}

export default function RolesPage() {
    const [roles, setRoles] = useState<Role[] | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const router = useRouter();

    function refresh() { listRoles().then(setRoles); }
    useEffect(() => { refresh(); }, []);

    return (
        <div className="flex flex-col h-full bg-zinc-50 text-zinc-900">
            <Toolbar title="Roles">
                <Button variant="solid" onClick={() => setFormOpen(true)}>New Role</Button>
            </Toolbar>

            <NewRoleDialog
                open={formOpen}
                onClose={() => setFormOpen(false)}
                onSaved={() => { setFormOpen(false); refresh(); }}
            />

            <div className="flex-1 overflow-auto p-5">
                {roles === null ? (
                    <div className="flex items-center justify-center h-32 text-sm text-zinc-500">Loading…</div>
                ) : roles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 gap-2">
                        <span className="text-sm text-zinc-500">No roles yet.</span>
                        <Button variant="solid" onClick={() => setFormOpen(true)}>New Role</Button>
                    </div>
                ) : (
                    <Table
                        columns={[
                            { key: 'name', label: 'Name' },
                            {
                                key: 'pass',
                                label: 'Password',
                                render: (_val, row) => <PasswordCell pass={row.pass} />,
                            },
                            {
                                key: 'inheritedBy',
                                label: 'Inherited By',
                                render: (_val, row) => (row.inheritedBy?.length ?? 0) > 0
                                    ? <Chip label={String(row.inheritedBy.length)} color="brand" />
                                    : <span className="text-zinc-400">—</span>,
                            },
                            {
                                key: 'attachedTo',
                                label: 'In Use',
                                width: '1px',
                                render: (_val, row) => row.attachedTo?.length
                                    ? <Chip label="Used" color="brand" variant="solid" />
                                    : <Chip label="Unused" color="zinc" variant="outline" />,
                            },
                        ]}
                        data={roles}
                        rowKey={row => row.name}
                        onRowClick={row => router.push(`/roles/${row.name}`)}
                    />
                )}
            </div>
        </div>
    );
}
