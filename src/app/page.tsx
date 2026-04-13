'use client'

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Home() {
    const router = useRouter();
    const [name, setName] = useState('');

    function open() {
        const slug = name.trim();
        if (slug) router.push(`/proxies/${slug}`);
    }

    return (
        <div className="flex flex-1 items-center justify-center h-full">
            <div className="w-full max-w-sm flex flex-col gap-5 px-6">

                <div className="flex flex-col gap-1">
                    <h1 className="text-xl font-semibold tracking-tight">Open a proxy</h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Enter a proxy name to open or create its config.
                    </p>
                </div>

                <div className="flex gap-2">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && open()}
                        placeholder="my-proxy"
                        className="flex-1 min-w-0"
                        autoFocus
                    />
                    <button
                        onClick={open}
                        disabled={!name.trim()}
                        className="shrink-0 px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
                    >
                        Open
                    </button>
                </div>

            </div>
        </div>
    );
}
