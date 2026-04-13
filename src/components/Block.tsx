'use client'

import { JSX, useEffect, useRef, useState } from "react";
import { BlockKey } from "@/libs/block";
import type { BlockData } from "@/libs/block";

export { BlockKey };
export type { BlockData };

// ── helpers ────────────────────────────────────────────────────────────────

function defaultContent(key: BlockKey): any[] {
    switch (key) {
        case BlockKey.Listen:     return ['', '80'];
        case BlockKey.ServerName: return [''];
        default:                  return [];
    }
}

// ── Del button ─────────────────────────────────────────────────────────────

const Del = ({ onClick }: { onClick: () => void }) => (
    <button
        onClick={onClick}
        className="text-xs text-red-400 hover:text-red-600 px-1"
        aria-label="Delete"
    >
        ✕
    </button>
);

// ── InsertBar ──────────────────────────────────────────────────────────────

interface InsertOption { label: string; onClick: () => void; }

function InsertBar({ options }: { options: InsertOption[] }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        function onDown(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node))
                setOpen(false);
        }
        document.addEventListener('mousedown', onDown);
        return () => document.removeEventListener('mousedown', onDown);
    }, [open]);

    return (
        <div ref={ref} className="relative group h-4 flex items-center">
            {/* hover bar */}
            <div
                className="w-full h-0.5 bg-transparent group-hover:bg-blue-400 cursor-pointer rounded transition-colors flex items-center justify-center"
                onClick={() => setOpen(o => !o)}
            >
                <span className="opacity-0 group-hover:opacity-100 bg-blue-500 text-white text-xs leading-none rounded-full w-4 h-4 flex items-center justify-center select-none">
                    +
                </span>
            </div>

            {/* popover */}
            {open && (
                <div className="absolute left-4 top-5 z-20 bg-white border rounded shadow-lg py-1 min-w-32">
                    {options.map(({ label, onClick }) => (
                        <button
                            key={label}
                            onClick={() => { onClick(); setOpen(false); }}
                            className="w-full px-3 py-1.5 text-sm hover:bg-blue-50 text-left"
                        >
                            {label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Block ──────────────────────────────────────────────────────────────────

interface BlockProps {
    data: BlockData;
    onChange?: (data: BlockData) => void;
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
        case BlockKey.Root:
        case BlockKey.Server: {
            const label = BlockKey[blockKey];
            const childOptions = blockKey === BlockKey.Root
                ? [{ key: BlockKey.Server,     label: 'Server'     }]
                : [
                    { key: BlockKey.Listen,     label: 'Listen'     },
                    { key: BlockKey.ServerName, label: 'ServerName' },
                ];

            function barOptions(insertIdx: number): InsertOption[] {
                return childOptions.map(({ key, label: optLabel }) => ({
                    label: optLabel,
                    onClick: () => insertAt(insertIdx, [key, defaultContent(key)]),
                }));
            }

            return (
                <div>
                    <div className="flex items-center gap-1">
                        <span className="font-semibold">{label}</span>
                        {onDelete && <Del onClick={onDelete} />}
                    </div>
                    <div className="ml-4 flex flex-col mt-1">
                        <InsertBar options={barOptions(0)} />
                        {content.map((child: BlockData, index: number) => (
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
                </div>
            );
        }

        case BlockKey.Listen: {
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
                <div className="flex items-start gap-2">
                    <div className="flex items-center gap-1">
                        <span className="font-semibold w-24">Listen</span>
                        {onDelete && <Del onClick={onDelete} />}
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <span className="text-sm w-8">IP</span>
                            <input
                                type="text"
                                value={ip}
                                onChange={(e) => setIp(e.target.value)}
                                className="border rounded px-1 w-36"
                                placeholder="0.0.0.0"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm w-8">Port</span>
                            <input
                                type="number"
                                min={1}
                                max={65535}
                                value={Number(port)}
                                onChange={(e) => setPort(e.target.value)}
                                className="border rounded px-1 w-24"
                            />
                        </div>
                        <label className="flex items-center gap-2 mt-0.5">
                            <input
                                type="checkbox"
                                checked={hasSsl}
                                onChange={(e) => setSsl(e.target.checked)}
                            />
                            <span className="text-sm">ssl</span>
                        </label>
                    </div>
                </div>
            );
        }

        case BlockKey.ServerName: {
            const nameBarOptions = (idx: number): InsertOption[] => [{
                label: 'Name',
                onClick: () => insertAt(idx, ''),
            }];

            return (
                <div className="flex items-start gap-2">
                    <div className="flex items-center gap-1">
                        <span className="font-semibold w-24">ServerName</span>
                        {onDelete && <Del onClick={onDelete} />}
                    </div>
                    <div className="flex flex-col">
                        <InsertBar options={nameBarOptions(0)} />
                        {content.map((value: string, index: number) => (
                            <div key={index}>
                                <div className="flex items-center gap-1">
                                    <input
                                        value={value}
                                        onChange={(e) => updateChild(index, e.target.value)}
                                        className="border rounded px-1"
                                        placeholder="example.com"
                                    />
                                    <Del onClick={() => removeItem(index)} />
                                </div>
                                <InsertBar options={nameBarOptions(index + 1)} />
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        default:
            return <pre>{BlockKey[blockKey]} {JSON.stringify(content)}</pre>;
    }
}
