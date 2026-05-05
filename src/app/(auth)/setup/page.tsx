'use client'

import { useState } from 'react';
import Input from '@/components/ui/input';
import Button from '@/components/ui/button';

export default function SetupPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [busy, setBusy] = useState(false);

    const mismatch = confirm.length > 0 && confirm !== password;
    const canSubmit = !busy && !!username.trim() && !!password && password === confirm;

    async function handleSubmit(e: React.SyntheticEvent) {
        e.preventDefault();
        if (!canSubmit) return;
        setBusy(true);
        // TODO: wire up account creation
        await new Promise(r => setTimeout(r, 800));
        setBusy(false);
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50">
            <div className="w-full max-w-sm">
                <div className="bg-white border border-zinc-200 rounded-xl shadow-sm px-8 py-10">
                    <h1 className="text-xl font-semibold text-zinc-900 mb-1">Create admin account</h1>
                    <p className="text-sm text-zinc-500 mb-7">Set up your credentials to get started</p>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <label className="flex flex-col gap-1.5">
                            <span className="text-sm font-medium text-zinc-700">Username</span>
                            <Input
                                type="text"
                                value={username}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                                placeholder="admin"
                                autoComplete="username"
                                autoFocus
                                className="w-full"
                            />
                        </label>

                        <label className="flex flex-col gap-1.5">
                            <span className="text-sm font-medium text-zinc-700">Password</span>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                autoComplete="new-password"
                                className="w-full"
                            />
                        </label>

                        <label className="flex flex-col gap-1.5">
                            <span className="text-sm font-medium text-zinc-700">Confirm password</span>
                            <Input
                                type="password"
                                value={confirm}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirm(e.target.value)}
                                placeholder="••••••••"
                                autoComplete="new-password"
                                className="w-full"
                            />
                            {mismatch && (
                                <span className="text-xs text-red-500">Passwords do not match</span>
                            )}
                        </label>

                        <Button
                            type="submit"
                            variant="solid"
                            disabled={!canSubmit}
                            className="w-full mt-1"
                        >
                            {busy ? 'Creating account…' : 'Create account'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
