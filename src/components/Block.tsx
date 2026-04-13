'use client'

import { JSX } from "react";
import { BlockKey } from "@/libs/block";
import type { BlockData } from "@/libs/block";

export { BlockKey };
export type { BlockData };

interface BlockProps {
    data: BlockData;
    onChange?: (data: BlockData) => void;
    onDelete?: () => void;
}

const Del = ({ onClick }: { onClick: () => void }) => (
    <button
        onClick={onClick}
        className="text-xs text-red-400 hover:text-red-600 px-1"
        aria-label="Delete"
    >
        ✕
    </button>
);

export default function Block({ data, onChange, onDelete }: BlockProps): JSX.Element {
    const blockKey = data[0];
    const content: any[] = data[1] ?? [];

    function updateContent(next: any[]) {
        onChange?.([blockKey, next]);
    }

    function updateChild(index: number, value: any) {
        const next = [...content];
        next[index] = value;
        updateContent(next);
    }

    function removeItem(index: number) {
        updateContent(content.filter((_, i) => i !== index));
    }

    function addItem(item: any) {
        updateContent([...content, item]);
    }

    switch (blockKey) {
        case BlockKey.Root:
        case BlockKey.Server: {
            const label = BlockKey[blockKey];
            const childOptions = blockKey === BlockKey.Root
                ? [{ key: BlockKey.Server, label: 'Server' }]
                : [
                    { key: BlockKey.Listen,     label: 'Listen'     },
                    { key: BlockKey.ServerName, label: 'ServerName' },
                ];

            return (
                <div>
                    <div className="flex items-center gap-1">
                        <span className="font-semibold">{label}</span>
                        {onDelete && <Del onClick={onDelete} />}
                    </div>
                    <div className="ml-4 flex flex-col gap-2 mt-1">
                        {content.map((child: BlockData, index: number) => (
                            <Block
                                key={index}
                                data={child}
                                onChange={(updated) => updateChild(index, updated)}
                                onDelete={() => removeItem(index)}
                            />
                        ))}
                        <div className="flex gap-2 mt-1">
                            {childOptions.map(({ key, label: optLabel }) => (
                                <button
                                    key={key}
                                    onClick={() => addItem([key, []])}
                                    className="text-xs border rounded px-2 py-0.5 text-blue-600 border-blue-400 hover:bg-blue-50"
                                >
                                    + {optLabel}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        case BlockKey.Listen: {
            // content layout: [ip, port, ...flags]
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
            return (
                <div className="flex items-start gap-2">
                    <div className="flex items-center gap-1">
                        <span className="font-semibold w-24">ServerName</span>
                        {onDelete && <Del onClick={onDelete} />}
                    </div>
                    <div className="flex flex-col gap-1">
                        {content.map((value: string, index: number) => (
                            <div key={index} className="flex items-center gap-1">
                                <input
                                    value={value}
                                    onChange={(e) => updateChild(index, e.target.value)}
                                    className="border rounded px-1"
                                    placeholder="example.com"
                                />
                                <Del onClick={() => removeItem(index)} />
                            </div>
                        ))}
                        <button
                            onClick={() => addItem('')}
                            className="text-xs border rounded px-2 py-0.5 text-blue-600 border-blue-400 hover:bg-blue-50 self-start mt-0.5"
                        >
                            + Name
                        </button>
                    </div>
                </div>
            );
        }

        default:
            return <pre>{BlockKey[blockKey]} {JSON.stringify(content)}</pre>;
    }
}
