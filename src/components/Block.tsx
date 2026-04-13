'use client'

import { JSX } from "react";
import { BlockKey } from "@/libs/block";
import type { BlockData } from "@/libs/block";

export { BlockKey };
export type { BlockData };

interface BlockProps {
    data: BlockData;
    onChange?: (data: BlockData) => void;
}

export default function Block({ data, onChange }: BlockProps): JSX.Element {
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
                    <div className="font-semibold">{label}</div>
                    <div className="ml-4 flex flex-col gap-2 mt-1">
                        {content.map((child: BlockData, index: number) => (
                            <Block
                                key={index}
                                data={child}
                                onChange={(updated) => updateChild(index, updated)}
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
            const hasSsl = content.includes('ssl');
            const ports = content.filter((v: any) => v !== 'ssl');

            return (
                <div className="flex items-start gap-2">
                    <div className="font-semibold w-24">Listen</div>
                    <div className="flex flex-col gap-1">
                        {ports.map((value: string, portIdx: number) => {
                            // Map back to the real index in content
                            const realIdx = content.indexOf(value, portIdx === 0 ? 0 : content.indexOf(ports[portIdx - 1]) + 1);
                            return (
                                <label key={realIdx} className="flex items-center gap-2">
                                    <span className="text-sm">Port</span>
                                    <input
                                        type="number"
                                        min={1}
                                        max={65535}
                                        value={Number(value)}
                                        onChange={(e) => updateChild(realIdx, e.target.value)}
                                        className="border rounded px-1 w-24"
                                    />
                                </label>
                            );
                        })}
                        <label className="flex items-center gap-2 mt-0.5">
                            <input
                                type="checkbox"
                                checked={hasSsl}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        addItem('ssl');
                                    } else {
                                        updateContent(content.filter((c: any) => c !== 'ssl'));
                                    }
                                }}
                            />
                            <span className="text-sm">ssl</span>
                        </label>
                        <button
                            onClick={() => addItem('80')}
                            className="text-xs border rounded px-2 py-0.5 text-blue-600 border-blue-400 hover:bg-blue-50 self-start mt-0.5"
                        >
                            + Port
                        </button>
                    </div>
                </div>
            );
        }

        case BlockKey.ServerName: {
            return (
                <div className="flex items-start gap-2">
                    <div className="font-semibold w-24">ServerName</div>
                    <div className="flex flex-col gap-1">
                        {content.map((value: string, index: number) => (
                            <input
                                key={index}
                                value={value}
                                onChange={(e) => updateChild(index, e.target.value)}
                                className="border rounded px-1"
                                placeholder="example.com"
                            />
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
