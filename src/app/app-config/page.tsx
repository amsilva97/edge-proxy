'use client'

import { useEffect, useState, useTransition } from 'react';
import { loadAppSettingAsync, saveAppSettingAsync } from './scripts';
import { EdgeProxySettings } from '@/libs/AppConfig';

export default function AppConfigPage() {
    const [config, setConfig] = useState<EdgeProxySettings | null>(null);
    const [isPending, startTransition] = useTransition();
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        loadAppSettingAsync().then(setConfig);
    }, []);

    function handleSave() {
        if (!config) return;
        startTransition(async () => {
            await saveAppSettingAsync(config);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        });
    }

    return (
        <div className="flex flex-col h-full">

            {/* ── toolbar ── */}
            <div className="shrink-0 flex items-center justify-between gap-4 px-3 py-1.5 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <span className="text-sm font-medium">App Config</span>
                <button
                    onClick={handleSave}
                    disabled={isPending || !config}
                    className="shrink-0 px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
                >
                    {isPending ? 'Saving…' : saved ? 'Saved ✓' : 'Save'}
                </button>
            </div>

            {/* ── content ── */}
            {config ? (
                <div className="flex-1 overflow-auto p-4">
                    <div className="max-w-lg flex flex-col gap-6">

                        <section className="flex flex-col gap-3">
                            <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                                Nginx
                            </h2>
                            <label className="flex flex-col gap-1">
                                <span className="text-sm text-zinc-700 dark:text-zinc-300">Base path</span>
                                <input
                                    type="text"
                                    value={config.nginxBasePath}
                                    onChange={(e) => setConfig({ ...config, nginxBasePath: e.target.value })}
                                    placeholder="/etc/nginx"
                                    className="w-full"
                                />
                                <span className="text-xs text-zinc-400">
                                    Root directory of your nginx installation (e.g. /etc/nginx)
                                </span>
                            </label>
                        </section>

                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-center flex-1 text-sm text-zinc-400">
                    Loading…
                </div>
            )}

        </div>
    );
}
