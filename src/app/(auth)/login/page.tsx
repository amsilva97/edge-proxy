'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/input';
import Button from '@/components/ui/button';
import { checkIsSetup, signIn, getSessionValid } from './scripts';

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        getSessionValid().then(valid => {
            if (valid) { router.replace('/http-hosts'); return; }
            checkIsSetup().then(needsSetup => {
                if (needsSetup) router.replace('/setup');
                else setChecking(false);
            });
        });
    }, [router]);

    const canSubmit = !busy && !!username.trim() && !!password;

    async function handleSubmit(e: React.SyntheticEvent) {
        e.preventDefault();
        if (!canSubmit) return;
        setBusy(true);
        setError('');
        const result = await signIn(username.trim(), password);
        if (result?.error) {
            setError(result.error);
            setBusy(false);
        }
    }

    if (checking) return null;

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50">
            <div className="w-full max-w-sm">
                <div className="bg-white border border-zinc-200 rounded-xl shadow-sm px-8 py-10">
                    <h1 className="text-xl font-semibold text-zinc-900 mb-1">Sign in</h1>
                    <p className="text-sm text-zinc-500 mb-7">Enter your credentials to continue</p>

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
                                autoComplete="current-password"
                                className="w-full"
                            />
                        </label>

                        {error && <p className="text-xs text-red-500">{error}</p>}

                        <Button
                            type="submit"
                            variant="solid"
                            disabled={!canSubmit}
                            className="w-full mt-1"
                        >
                            {busy ? 'Signing in…' : 'Sign in'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
