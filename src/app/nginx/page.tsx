'use client'

import { useEffect, useState } from 'react';
import { Nginx, NginxStatus, NginxProcess } from '@/libs/nginx';
import Toolbar from '@/components/toolbar';
import Button from '@/components/ui/button';
import Table from '@/components/ui/table';
import Chip from '@/components/ui/chip';
import { RefreshCw } from 'lucide-react';

export default function NginxPage() {
    const [status, setStatus] = useState<NginxStatus | null>(null);
    const [processes, setProcesses] = useState<NginxProcess[] | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function refresh() {
        const [s, p] = await Promise.all([
            Nginx.GetStatusAsync(),
            Nginx.GetProcessesAsync(),
        ]);
        setStatus(s);
        setProcesses(p);
    }

    useEffect(() => { refresh(); }, []);

    async function handle(action: () => Promise<void>) {
        setBusy(true);
        setError(null);
        try {
            await action();
        } catch (e: any) {
            setError(e?.message ?? String(e));
        } finally {
            await refresh();
            setBusy(false);
        }
    }

    return (
        <div className="flex flex-col h-full bg-zinc-50 text-zinc-900">
            <Toolbar title="Nginx">
                <Button variant="outline" onClick={refresh} disabled={busy}>
                    <RefreshCw size={13} strokeWidth={1.75} className="mr-1.5" />
                    Refresh
                </Button>
                <Button
                    variant="solid"
                    onClick={() => handle(status?.active ? Nginx.StopAsync : Nginx.StartAsync)}
                    disabled={busy || status === null}
                    color={status?.active ? 'danger' : undefined}
                >
                    {status?.active ? 'Stop' : 'Start'}
                </Button>
                <Button
                    variant="solid"
                    onClick={() => handle(Nginx.ReloadAsync)}
                    disabled={busy || !status?.active}
                >
                    Reload Config
                </Button>
            </Toolbar>

            <div className="flex-1 overflow-auto p-5 flex flex-col gap-4">

                <div className="bg-white border border-zinc-200 rounded-lg px-4 py-3 flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-zinc-500">Status</span>
                        {status === null
                            ? <Chip label="Loading…" color="zinc" />
                            : status.active
                                ? <Chip label="Running" color="brand" variant="solid" />
                                : <Chip label="Stopped" color="zinc" variant="outline" />
                        }
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-zinc-500">Service</span>
                        {status === null
                            ? <Chip label="Loading…" color="zinc" />
                            : status.enabled
                                ? <Chip label="Enabled" color="brand" variant="solid" />
                                : <Chip label="Disabled" color="zinc" variant="outline" />
                        }
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 font-mono whitespace-pre-wrap">
                        {error}
                    </div>
                )}

                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Processes</p>
                    {processes === null ? (
                        <div className="flex items-center justify-center h-32 text-sm text-zinc-500">Loading…</div>
                    ) : processes.length === 0 ? (
                        <div className="flex items-center justify-center h-32 text-sm text-zinc-500">No nginx processes running.</div>
                    ) : (
                        <Table
                            columns={[
                                { key: 'pid', label: 'PID', width: '1px' },
                                { key: 'user', label: 'User', width: '1px' },
                                { key: 'cpu', label: 'CPU%', width: '1px' },
                                { key: 'mem', label: 'MEM%', width: '1px' },
                                { key: 'stat', label: 'Stat', width: '1px' },
                                { key: 'command', label: 'Command' },
                            ]}
                            data={processes}
                            rowKey={row => String(row.pid)}
                        />
                    )}
                </div>

            </div>
        </div>
    );
}
