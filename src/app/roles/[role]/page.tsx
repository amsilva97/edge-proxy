'use client'

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { Role } from '@/types/types';
import { listRoles, getRole, setRolePassword, clearRolePassword, grantRole, revokeRole } from '../scripts';
import Toolbar from '@/components/toolbar';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Chip from '@/components/ui/chip';
import Dialog from '@/components/dialog';
import { X } from 'lucide-react';

interface GrantRoleDialogProps {
    open: boolean;
    onClose: () => void;
    role: Role;
    allRoles: Role[];
    onGrant: (target: Role) => Promise<void>;
    onRevoke: (target: Role) => Promise<void>;
    busy: Record<string, boolean>;
}

function GrantRoleDialog({ open, onClose, role, allRoles, onGrant, onRevoke, busy }: GrantRoleDialogProps) {
    const [search, setSearch] = useState('');
    const searchRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!open) return;
        setSearch('');
        setTimeout(() => searchRef.current?.focus(), 50);
    }, [open]);

    const others = allRoles.filter(r => r.name !== role.name);
    const filtered = search.trim()
        ? others.filter(r => r.name.toLowerCase().includes(search.trim().toLowerCase()))
        : others;

    return (
        <Dialog open={open} title="Grant Role" onCancel={onClose}>
            <div className="flex flex-col gap-3">
                <Input
                    ref={searchRef}
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search roles…"
                    className="w-full"
                />
                <div className="flex flex-col divide-y divide-zinc-100 max-h-64 overflow-y-auto">
                    {filtered.length === 0 ? (
                        <p className="text-sm text-zinc-500 py-3 text-center">No roles found.</p>
                    ) : filtered.map(r => {
                        const granted = r.inheritedBy?.includes(role.name) ?? false;
                        return (
                            <div key={r.name} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-zinc-900">{r.name}</span>
                                    {r.pass === null && <Chip label="Login disabled" color="zinc" />}
                                </div>
                                <Button
                                    size="sm"
                                    variant={granted ? 'outline' : 'solid'}
                                    color={granted ? 'danger' : 'brand'}
                                    onClick={() => granted ? onRevoke(r) : onGrant(r)}
                                    disabled={busy[r.name]}
                                >
                                    {busy[r.name] ? '…' : granted ? 'Revoke' : 'Grant'}
                                </Button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </Dialog>
    );
}

export default function RoleDetailPage() {
    const { role: roleName } = useParams<{ role: string }>();
    const [role, setRole] = useState<Role | null>(null);
    const [allRoles, setAllRoles] = useState<Role[]>([]);
    const [newPassword, setNewPassword] = useState('');
    const [savingPassword, setSavingPassword] = useState(false);
    const [toggling, setToggling] = useState<Record<string, boolean>>({});
    const [grantDialogOpen, setGrantDialogOpen] = useState(false);

    function refresh() {
        Promise.all([getRole(roleName), listRoles()]).then(([r, all]) => {
            setRole(r);
            setAllRoles(all);
        });
    }
    useEffect(() => { refresh(); }, [roleName]);

    async function handleSetPassword() {
        if (!role || !newPassword.trim()) return;
        setSavingPassword(true);
        await setRolePassword(role, newPassword.trim());
        setNewPassword('');
        refresh();
        setSavingPassword(false);
    }

    async function handleDisableLogin() {
        if (!role) return;
        setSavingPassword(true);
        await clearRolePassword(role);
        refresh();
        setSavingPassword(false);
    }

    async function handleGrant(target: Role) {
        if (!role) return;
        setToggling(prev => ({ ...prev, [target.name]: true }));
        await grantRole(role, target);
        refresh();
        setToggling(prev => ({ ...prev, [target.name]: false }));
    }

    async function handleRevoke(target: Role) {
        if (!role) return;
        setToggling(prev => ({ ...prev, [target.name]: true }));
        await revokeRole(role, target);
        refresh();
        setToggling(prev => ({ ...prev, [target.name]: false }));
    }

    if (!role) return (
        <div className="flex items-center justify-center h-32 text-sm text-zinc-500">Loading…</div>
    );

    const grantedRoles = allRoles.filter(r => r.inheritedBy?.includes(role.name));

    return (
        <div className="flex flex-col h-full bg-zinc-50 text-zinc-900">
            <Toolbar title={roleName} />

            <div className="flex-1 overflow-auto p-5 flex flex-col gap-5">
                {/* Password */}
                <div className="bg-white border border-zinc-200 rounded-lg shadow-sm p-5">
                    <div className="flex items-center gap-3 mb-4">
                        <h2 className="text-sm font-semibold text-zinc-700">Password</h2>
                        {role.pass !== null
                            ? <Chip label="Login enabled" color="brand" />
                            : <Chip label="Login disabled" color="zinc" />
                        }
                    </div>
                    <div className="flex items-center gap-2">
                        <Input
                            type="password"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSetPassword()}
                            placeholder="New password"
                            className="w-64"
                        />
                        <Button variant="solid" onClick={handleSetPassword}
                            disabled={savingPassword || !newPassword.trim()}>
                            {savingPassword ? 'Saving…' : 'Set Password'}
                        </Button>
                        {role.pass !== null && (
                            <Button variant="outline" onClick={handleDisableLogin} disabled={savingPassword}>
                                Disable Login
                            </Button>
                        )}
                    </div>
                </div>

                {/* Inherited roles */}
                <div className="bg-white border border-zinc-200 rounded-lg shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-semibold text-zinc-700">Inherited Roles</h2>
                        <Button variant="outline" size="sm" onClick={() => setGrantDialogOpen(true)}>
                            Grant Role
                        </Button>
                    </div>
                    {grantedRoles.length === 0 ? (
                        <p className="text-sm text-zinc-500">No roles granted.</p>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {grantedRoles.map(r => (
                                <div key={r.name}
                                    className="flex items-center gap-1.5 bg-zinc-100 rounded-full pl-3 pr-1.5 py-1">
                                    <span className="text-sm text-zinc-800">{r.name}</span>
                                    <button
                                        onClick={() => handleRevoke(r)}
                                        disabled={toggling[r.name]}
                                        className="flex items-center justify-center text-zinc-400 hover:text-zinc-700 transition-colors disabled:opacity-40"
                                    >
                                        <X size={12} strokeWidth={2.5} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <GrantRoleDialog
                open={grantDialogOpen}
                onClose={() => setGrantDialogOpen(false)}
                role={role}
                allRoles={allRoles}
                onGrant={handleGrant}
                onRevoke={handleRevoke}
                busy={toggling}
            />
        </div>
    );
}
