'use client'

import { EdgeBlockData, EdgeDirectiveContext, EdgeDirectives } from "@/libs/edgeDirective";
import { JSX, useState, useRef, useEffect } from "react";

// Map a block name to the context it exposes inside itself.
// root (context=0) is treated as nginx's main context.
// Any name matching an EdgeDirectiveContext key uses that value.
// Unknown names get `all` so nothing is hidden.
function insideContext(name: string): EdgeDirectiveContext {
    if (name === 'root') return EdgeDirectiveContext.main;
    const val = (EdgeDirectiveContext as Record<string, unknown>)[name];
    if (typeof val === 'number') return val as EdgeDirectiveContext;
    return EdgeDirectiveContext.all;
}

export type BlockData = EdgeBlockData;

interface ICard {
    data: EdgeBlockData;
    depth?: number;
    onChange?: (newData: EdgeBlockData) => void;
}

function Card({ data, depth = 0, onChange }: ICard): JSX.Element {
    const name = data[0];
    const children = data.slice(1) as EdgeBlockData[];
    const [adding, setAdding] = useState(false);
    const [search, setSearch] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (adding) inputRef.current?.focus();
    }, [adding]);

    const ctx = insideContext(name);
    const filtered = EdgeDirectives.filter(d =>
        d.name !== 'root' &&
        (d.context & ctx) !== 0 &&
        d.name.toLowerCase().includes(search.toLowerCase())
    );

    function handleChildChange(index: number, newChild: EdgeBlockData) {
        const updated = [...children];
        updated[index] = newChild;
        onChange?.([name, ...updated] as EdgeBlockData);
    }

    function handleAdd(directiveName: string) {
        onChange?.([name, ...children, [directiveName]] as EdgeBlockData);
        setAdding(false);
        setSearch('');
    }

    return (
        <div className={`rounded-lg border border-zinc-200 bg-white shadow-sm${depth > 0 ? " ml-4" : ""}`}>
            <div className="flex items-center gap-2 px-3 py-2 bg-zinc-50 border-b border-zinc-200 rounded-t-lg">
                <span className="w-1.5 h-4 rounded-full bg-brand flex-shrink-0" />
                <span className="font-mono text-sm font-semibold text-zinc-800 tracking-tight">{name}</span>
                {children.length > 0 && (
                    <span className="ml-auto text-xs text-zinc-400 font-mono">
                        {children.length} block{children.length !== 1 ? "s" : ""}
                    </span>
                )}
            </div>

            <div className="flex flex-col gap-2 p-3">
                {children.map((child, i) => (
                    <Card
                        key={i}
                        data={child}
                        depth={depth + 1}
                        onChange={(updated) => handleChildChange(i, updated)}
                    />
                ))}

                <div className={`relative${depth > 0 ? " ml-4" : ""}`}>
                    {adding ? (
                        <>
                            <input
                                ref={inputRef}
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                onBlur={() => { setAdding(false); setSearch(''); }}
                                onKeyDown={e => {
                                    if (e.key === 'Escape') { setAdding(false); setSearch(''); }
                                    if (e.key === 'Enter' && filtered.length > 0) handleAdd(filtered[0].name);
                                }}
                                placeholder="Search directive…"
                                className="w-full text-sm px-2 py-1.5"
                            />
                            {filtered.length > 0 && (
                                <div className="absolute top-full left-0 right-0 z-10 mt-1 max-h-48 overflow-auto rounded-md border border-zinc-200 bg-white shadow-lg">
                                    {filtered.map(d => (
                                        <button
                                            key={d.name}
                                            onMouseDown={() => handleAdd(d.name)}
                                            className="w-full text-left px-3 py-1.5 text-sm font-mono hover:bg-zinc-50 text-zinc-700"
                                        >
                                            {d.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <button
                            onClick={() => setAdding(true)}
                            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-brand transition-colors py-1"
                        >
                            <span className="text-base leading-none">+</span>
                            Add directive
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

interface IBlockProps {
    data: EdgeBlockData;
    onChange?: (newData: EdgeBlockData) => void;
}

export default function Block({ data, onChange }: IBlockProps): JSX.Element {
    return <Card data={data} onChange={onChange} />;
}
