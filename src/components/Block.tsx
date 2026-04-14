'use client'

import { JSX, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { EdgeProxyBlockKey } from "@/libs/EdgeProxyBlockKey";
import type { EdgeProxyBlock } from "@/libs/EdgeProxyBlock";

export { EdgeProxyBlockKey as BlockKey };
export type { EdgeProxyBlock as BlockData };

// ── per-type style tokens ──────────────────────────────────────────────────

const typeStyle = {
    [EdgeProxyBlockKey.Root]: {
        border:  'border-zinc-200 dark:border-zinc-700',
        header:  'bg-zinc-50 dark:bg-zinc-800',
        label:   'text-zinc-500 dark:text-zinc-400',
    },
    [EdgeProxyBlockKey.Server]: {
        border:  'border-blue-200 dark:border-blue-800',
        header:  'bg-blue-50 dark:bg-blue-950',
        label:   'text-blue-600 dark:text-blue-400',
    },
    [EdgeProxyBlockKey.Listen]: {
        border:  'border-emerald-200 dark:border-emerald-800',
        header:  'bg-emerald-50 dark:bg-emerald-950',
        label:   'text-emerald-600 dark:text-emerald-400',
    },
    [EdgeProxyBlockKey.ServerName]: {
        border:  'border-violet-200 dark:border-violet-800',
        header:  'bg-violet-50 dark:bg-violet-950',
        label:   'text-violet-600 dark:text-violet-400',
    },
} satisfies Record<EdgeProxyBlockKey, { border: string; header: string; label: string }>;

// ── helpers ────────────────────────────────────────────────────────────────

function defaultContent(key: EdgeProxyBlockKey): any[] {
    switch (key) {
        case EdgeProxyBlockKey.Listen:     return ['', '80'];
        case EdgeProxyBlockKey.ServerName: return [''];
        default:                  return [];
    }
}

// ── Del button ─────────────────────────────────────────────────────────────

const Del = ({ onClick }: { onClick: () => void }) => (
    <button
        onClick={onClick}
        aria-label="Delete"
        className="opacity-0 group-hover/card:opacity-100 text-zinc-400 hover:text-red-500 transition-all text-xs leading-none"
    >
        ✕
    </button>
);

// ── InsertBar ──────────────────────────────────────────────────────────────

interface InsertOption { label: string; onClick: () => void; }

function InsertBar({ options }: { options: InsertOption[] }) {
    const [open, setOpen] = useState(false);
    const [pos, setPos] = useState({ top: 0, left: 0 });
    const triggerRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        function onDown(e: MouseEvent) {
            if (
                menuRef.current && !menuRef.current.contains(e.target as Node) &&
                triggerRef.current && !triggerRef.current.contains(e.target as Node)
            ) setOpen(false);
        }
        document.addEventListener('mousedown', onDown);
        return () => document.removeEventListener('mousedown', onDown);
    }, [open]);

    function handleClick() {
        if (triggerRef.current) {
            const r = triggerRef.current.getBoundingClientRect();
            setPos({ top: r.bottom + window.scrollY + 4, left: r.left + window.scrollX + 12 });
        }
        setOpen(o => !o);
    }

    return (
        <div className="relative group/bar h-3 flex items-center">
            <div
                ref={triggerRef}
                className="w-full h-px bg-transparent group-hover/bar:bg-blue-400 dark:group-hover/bar:bg-blue-600 cursor-pointer rounded-full transition-colors flex items-center justify-center"
                onClick={handleClick}
            >
                <span className="opacity-0 group-hover/bar:opacity-100 transition-opacity bg-blue-500 text-white text-xs leading-none rounded-full w-3 h-3 flex items-center justify-center select-none shrink-0">
                    +
                </span>
            </div>

            {open && createPortal(
                <div
                    ref={menuRef}
                    style={{ top: pos.top, left: pos.left }}
                    className="fixed z-[9999] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded shadow-lg shadow-black/10 py-0.5 min-w-28"
                >
                    {options.map(({ label, onClick }) => (
                        <button
                            key={label}
                            onClick={() => { onClick(); setOpen(false); }}
                            className="w-full px-2 py-1 text-xs text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                        >
                            {label}
                        </button>
                    ))}
                </div>,
                document.body
            )}
        </div>
    );
}

// ── Card wrapper ───────────────────────────────────────────────────────────

function Card({
    blockKey,
    label,
    onDelete,
    children,
    inline = false,
}: {
    blockKey: EdgeProxyBlockKey;
    label: string;
    onDelete?: () => void;
    children: React.ReactNode;
    inline?: boolean;
}) {
    const s = typeStyle[blockKey];
    if (inline) {
        return (
            <div className={`group/card flex items-center gap-1.5 rounded border ${s.border} px-1.5 py-0.5 bg-white dark:bg-zinc-900`}>
                <span className={`text-xs font-semibold uppercase tracking-wide shrink-0 ${s.label}`}>
                    {label}
                </span>
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    {children}
                </div>
                {onDelete && <Del onClick={onDelete} />}
            </div>
        );
    }
    return (
        <div className={`group/card rounded border ${s.border} overflow-hidden`}>
            <div className={`flex items-center justify-between px-1.5 py-0.5 ${s.header} border-b ${s.border}`}>
                <span className={`text-xs font-semibold uppercase tracking-wide ${s.label}`}>
                    {label}
                </span>
                {onDelete && <Del onClick={onDelete} />}
            </div>
            <div className="p-1 bg-white dark:bg-zinc-900">
                {children}
            </div>
        </div>
    );
}

// ── Block ──────────────────────────────────────────────────────────────────

interface BlockProps {
    data: EdgeProxyBlock;
    onChange?: (data: EdgeProxyBlock) => void;
    onDelete?: () => void;
}

export default function Block({ data, onChange, onDelete }: BlockProps): JSX.Element {
    const blockKey = data[0];
    const content: any[] = data[1] ?? [];

    function updateContent(next: any[]) { onChange?.([blockKey, next]); }
    function updateChild(index: number, value: any) {
        const next = [...content];
        next[index] = value;
        updateContent(next);
    }
    function removeItem(index: number) {
        updateContent(content.filter((_, i) => i !== index));
    }
    function insertAt(index: number, item: any) {
        const next = [...content];
        next.splice(index, 0, item);
        updateContent(next);
    }

    switch (blockKey) {
        case EdgeProxyBlockKey.Root:
        case EdgeProxyBlockKey.Server: {
            const label = EdgeProxyBlockKey[blockKey];
            const childOptions = blockKey === EdgeProxyBlockKey.Root
                ? [{ key: EdgeProxyBlockKey.Server,     label: 'Server'     }]
                : [
                    { key: EdgeProxyBlockKey.Listen,     label: 'Listen'     },
                    { key: EdgeProxyBlockKey.ServerName, label: 'ServerName' },
                ];

            function barOptions(idx: number): InsertOption[] {
                return childOptions.map(({ key, label: l }) => ({
                    label: l,
                    onClick: () => insertAt(idx, [key, defaultContent(key)]),
                }));
            }

            return (
                <Card blockKey={blockKey} label={label} onDelete={onDelete}>
                    <div className="flex flex-col gap-px">
                        <InsertBar options={barOptions(0)} />
                        {content.map((child: EdgeProxyBlock, index: number) => (
                            <div key={index}>
                                <Block
                                    data={child}
                                    onChange={(updated) => updateChild(index, updated)}
                                    onDelete={() => removeItem(index)}
                                />
                                <InsertBar options={barOptions(index + 1)} />
                            </div>
                        ))}
                    </div>
                </Card>
            );
        }

        case EdgeProxyBlockKey.Listen: {
            const ip     = content[0] ?? '';
            const port   = content[1] ?? '80';
            const hasSsl = content.slice(2).includes('ssl');

            function setIp(val: string)   { updateChild(0, val); }
            function setPort(val: string) { updateChild(1, val); }
            function setSsl(on: boolean) {
                const flags = content.slice(2).filter((f: string) => f !== 'ssl');
                if (on) flags.push('ssl');
                updateContent([ip, port, ...flags]);
            }

            return (
                <Card blockKey={blockKey} label="Listen" onDelete={onDelete} inline>
                    <input
                        type="text"
                        value={ip}
                        onChange={(e) => setIp(e.target.value)}
                        className="w-28"
                        placeholder="0.0.0.0"
                    />
                    <span className="text-zinc-400 text-xs select-none">:</span>
                    <input
                        type="number"
                        min={1}
                        max={65535}
                        value={Number(port)}
                        onChange={(e) => setPort(e.target.value)}
                        className="w-16"
                    />
                    <label className="flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={hasSsl}
                            onChange={(e) => setSsl(e.target.checked)}
                            className="accent-emerald-500"
                        />
                        SSL
                    </label>
                </Card>
            );
        }

        case EdgeProxyBlockKey.ServerName: {
            return (
                <Card blockKey={blockKey} label="Server Name" onDelete={onDelete} inline>
                    <div className="flex flex-wrap items-center gap-1 flex-1 min-w-0">
                        {content.map((value: string, index: number) => (
                            <div key={index} className="flex items-center gap-0.5 group/name">
                                <input
                                    type="text"
                                    value={value}
                                    onChange={(e) => updateChild(index, e.target.value)}
                                    className="w-28 min-w-0"
                                    placeholder="example.com"
                                />
                                <button
                                    onClick={() => removeItem(index)}
                                    aria-label="Delete"
                                    className="opacity-0 group-hover/name:opacity-100 text-zinc-400 hover:text-red-500 transition-all text-xs leading-none"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={() => insertAt(content.length, '')}
                            className="text-xs text-zinc-400 hover:text-violet-500 transition-colors leading-none"
                            aria-label="Add name"
                        >
                            +
                        </button>
                    </div>
                </Card>
            );
        }

        default:
            return (
                <pre className="text-xs text-zinc-500 font-mono px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
                    {EdgeProxyBlockKey[blockKey]} {JSON.stringify(content)}
                </pre>
            );
    }
}
