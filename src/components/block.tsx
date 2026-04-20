'use client'

import { EdgeBlockData, EdgeDirective, EdgeDirectiveContext, EdgeDirectives, EdgeSlot } from "@/libs/edgeDirective";
import { JSX, useState, useRef, useEffect } from "react";

export type BlockData = EdgeBlockData[];

function insideContext(name: string): EdgeDirectiveContext {
    const val = (EdgeDirectiveContext as Record<string, unknown>)[name];
    if (typeof val === 'number') return val as EdgeDirectiveContext;
    return EdgeDirectiveContext.all;
}

function findDirective(name: string): EdgeDirective | undefined {
    return EdgeDirectives.find(d => d.name === name);
}

function isContextDirective(d: EdgeDirective | undefined): boolean {
    return !!d?.slots.some(s => s.one_of.includes('context'));
}

// Slot value input — renders a select for on_off/enum, text/number otherwise
function SlotInput({ slot, value, onChange }: { slot: EdgeSlot; value: string; onChange: (v: string) => void }): JSX.Element {
    const enumPrim = slot.one_of.find((p): p is { enum: readonly string[] } => typeof p === 'object' && 'enum' in p);
    const isOnOff = slot.one_of.includes('on_off');
    const placeholder = slot.label ?? slot.one_of.filter(p => typeof p === 'string').join(' | ');

    if (isOnOff) {
        return (
            <select value={value} onChange={e => onChange(e.target.value)}
                className="text-sm px-2 py-1 rounded-md border border-zinc-200 bg-white font-mono text-zinc-700">
                <option value="">–</option>
                <option>on</option>
                <option>off</option>
            </select>
        );
    }

    if (enumPrim) {
        return (
            <select value={value} onChange={e => onChange(e.target.value)}
                className="text-sm px-2 py-1 rounded-md border border-zinc-200 bg-white font-mono text-zinc-700">
                <option value="">–</option>
                {enumPrim.enum.map(v => <option key={v}>{v}</option>)}
            </select>
        );
    }

    return (
        <input
            type={slot.one_of.includes('number') ? 'number' : 'text'}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className="text-sm px-2 py-1.5 font-mono w-40"
        />
    );
}

interface ICard {
    data: EdgeBlockData;
    depth?: number;
    onChange?: (newData: EdgeBlockData) => void;
    onDelete?: () => void;
}

function Card({ data, depth = 0, onChange, onDelete }: ICard): JSX.Element {
    const name = data[0];
    const directive = findDirective(name);
    const isCtx = isContextDirective(directive);

    // Context blocks: data = [name, EdgeBlockData[]]  (children wrapped in one array)
    // Directive blocks: data = [name, ...string[]]     (slot values as strings)
    const children: EdgeBlockData[] = isCtx ? ((data[1] as unknown as EdgeBlockData[]) ?? []) : [];
    const slotValues: string[] = isCtx ? [] : (data.slice(1) as unknown as string[]);

    const [adding, setAdding] = useState(false);
    const [search, setSearch] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { if (adding) inputRef.current?.focus(); }, [adding]);

    const ctx = insideContext(name);
    const filtered = EdgeDirectives.filter(d =>
        d.name !== 'root' &&
        (d.context & ctx) !== 0 &&
        d.name.toLowerCase().includes(search.toLowerCase())
    );

    function handleChildChange(i: number, updated: EdgeBlockData) {
        const next = [...children];
        next[i] = updated;
        onChange?.([name, next] as unknown as EdgeBlockData);
    }

    function handleChildDelete(i: number) {
        const next = children.filter((_, j) => j !== i);
        onChange?.([name, next] as unknown as EdgeBlockData);
    }

    function handleAdd(directiveName: string) {
        const newChild: EdgeBlockData = [directiveName];
        onChange?.([name, [...children, newChild]] as unknown as EdgeBlockData);
        setAdding(false);
        setSearch('');
    }

    function handleSlotChange(i: number, value: string) {
        const next = [...slotValues];
        next[i] = value;
        onChange?.([name, ...next] as unknown as EdgeBlockData);
    }

    // Non-context: render as a single inline row, no card chrome
    if (!isCtx) {
        return (
            <div className={`flex items-center gap-2 py-1${depth > 0 ? " ml-4" : ""}`}>
                <span className="w-1.5 h-3 rounded-full bg-brand/40 flex-shrink-0" />
                <span className="font-mono text-sm font-medium text-zinc-700 tracking-tight w-40 shrink-0">{name}</span>
                {directive?.slots.map((slot, i) => (
                    <div key={i} className="flex items-center gap-1">
                        {slot.label && <span className="text-xs text-zinc-400 font-mono">{slot.label}</span>}
                        <SlotInput slot={slot} value={slotValues[i] ?? ''} onChange={v => handleSlotChange(i, v)} />
                        {slot.optional && <span className="text-[10px] text-zinc-300 font-mono">opt</span>}
                    </div>
                ))}
                {onDelete && (
                    <button onClick={onDelete} title="Delete"
                        className="ml-auto text-zinc-300 hover:text-red-500 transition-colors text-lg leading-none">
                        ×
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className={`rounded-lg border border-zinc-200 bg-white shadow-sm${depth > 0 ? " ml-4" : ""}`}>
            {/* Header */}
            <div className="flex items-center gap-2 px-3 py-2 bg-zinc-50 border-b border-zinc-200 rounded-t-lg">
                <span className="w-1.5 h-4 rounded-full bg-brand flex-shrink-0" />
                <span className="font-mono text-sm font-semibold text-zinc-800 tracking-tight">{name}</span>
                <div className="ml-auto flex items-center gap-2">
                    {children.length > 0 && (
                        <span className="text-xs text-zinc-400 font-mono">
                            {children.length} block{children.length !== 1 ? "s" : ""}
                        </span>
                    )}
                    {onDelete && (
                        <button onClick={onDelete} title="Delete"
                            className="text-zinc-300 hover:text-red-500 transition-colors text-lg leading-none">
                            ×
                        </button>
                    )}
                </div>
            </div>

            {/* Context block: nested children + add bar */}
            <div className="flex flex-col gap-2 p-3">
                {children.map((child, i) => (
                    <Card
                        key={i}
                        data={child}
                        depth={depth + 1}
                        onChange={(u) => handleChildChange(i, u)}
                        onDelete={() => handleChildDelete(i)}
                    />
                ))}

                <div className="relative">
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
                                        <button key={d.name} onMouseDown={() => handleAdd(d.name)}
                                            className="w-full text-left px-3 py-1.5 text-sm font-mono hover:bg-zinc-50 text-zinc-700">
                                            {d.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <button onClick={() => setAdding(true)}
                            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-brand transition-colors py-1">
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
    data: EdgeBlockData[];
    context: EdgeDirectiveContext;
    onChange?: (newData: EdgeBlockData[]) => void;
}

export default function Block({ data, context, onChange }: IBlockProps): JSX.Element {
    const [adding, setAdding] = useState(false);
    const [search, setSearch] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { if (adding) inputRef.current?.focus(); }, [adding]);

    const filtered = EdgeDirectives.filter(d =>
        (d.context & context) !== 0 &&
        d.name.toLowerCase().includes(search.toLowerCase())
    );

    function handleChange(i: number, updated: EdgeBlockData) {
        const next = [...data];
        next[i] = updated;
        onChange?.(next);
    }

    function handleDelete(i: number) {
        onChange?.(data.filter((_, j) => j !== i));
    }

    function handleAdd(name: string) {
        onChange?.([...data, [name] as EdgeBlockData]);
        setAdding(false);
        setSearch('');
    }

    return (
        <div className="flex flex-col gap-2">
            {data.map((child, i) => (
                <Card
                    key={i}
                    data={child}
                    depth={0}
                    onChange={(u) => handleChange(i, u)}
                    onDelete={() => handleDelete(i)}
                />
            ))}

            <div className="relative">
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
                                    <button key={d.name} onMouseDown={() => handleAdd(d.name)}
                                        className="w-full text-left px-3 py-1.5 text-sm font-mono hover:bg-zinc-50 text-zinc-700">
                                        {d.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <button onClick={() => setAdding(true)}
                        className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-brand transition-colors py-1">
                        <span className="text-base leading-none">+</span>
                        Add directive
                    </button>
                )}
            </div>
        </div>
    );
}
