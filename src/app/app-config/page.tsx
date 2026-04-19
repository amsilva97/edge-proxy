'use client'

import { EdgeProxySettings } from '@/types/types';
import { useEffect, useState, useTransition } from 'react';
import { LoadConfig, SaveConfig } from './scripts';
import Toolbar from '@/components/toolbar';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';

export default function AppConfigPage() {
    const [config, setConfig] = useState<EdgeProxySettings | null>(null);
    const [isPending, startTransition] = useTransition();
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        LoadConfig().then(setConfig);
    }, []);

    function handleSave() {
        if (!config) return;
        startTransition(async () => {
            await SaveConfig(config);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        });
    }

    return (
        <div className="flex flex-col h-full bg-zinc-50 text-zinc-900">

            <Toolbar title="App Config">
                <Button variant="solid" onClick={handleSave} disabled={isPending || !config}>
                    {isPending ? 'Saving…' : saved ? 'Saved' : 'Save'}
                </Button>
            </Toolbar>

            {config ? (
                <div className="flex-1 overflow-auto p-5">
                    <div className="max-w-lg flex flex-col gap-6">

                        <section className="flex flex-col gap-3">
                            <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Nginx</h2>

                            <label className="flex flex-col gap-1.5">
                                <span className="text-sm font-medium text-zinc-700">Base path</span>
                                <Input
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
