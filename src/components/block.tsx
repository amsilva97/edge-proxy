'use client'

import { EdgeBlockData, EdgeDirective, EdgeDirectiveContext, EdgeDirectives, EdgeSlot } from "@/libs/edgeDirective";
import React, { JSX, useState, useRef, useEffect } from "react";

export type BlockData = EdgeBlockData[];


function insideContext(name: string): EdgeDirectiveContext {
    const val = (EdgeDirectiveContext as Record<string, unknown>)[name];
    if (typeof val === 'number') return val as EdgeDirectiveContext;
    return EdgeDirectiveContext.any;
}

function findDirective(name: string): EdgeDirective | undefined {
    return EdgeDirectives.find(d => d.key === name);
}

function isContextDirective(d: EdgeDirective | undefined): boolean {
    return !!d?.params.some(s => s.primitive.includes('context'));
}

// Slot value input — checkbox for flags, select for string[], number/text otherwise.
// Flag values ARE the nginx token: 'ssl', 'backlog=512', etc. Empty string = absent.
// active=true: param was explicitly added via the options picker — skip checkbox, × handles removal.
function SlotInput({ slot, value, onChange, active, sslLabels }: { slot: EdgeSlot; value: string; onChange: (v: string) => void; active?: boolean; sslLabels?: string[] }): JSX.Element {
    const { primitive, label, subSlot } = slot;

    if (primitive === 'flag') {
        const sep = subSlot?.prefix ?? '=';
        const tokenPrefix = `${label}${sep}`;
        const subValue = subSlot
            ? (value.startsWith(tokenPrefix) ? value.slice(tokenPrefix.length) : '')
            : '';
        const handleSubChange = (newSub: string) => onChange(`${tokenPrefix}${newSub}`);

        // Active optional flag: no checkbox — presence is already confirmed, × removes it
        if (active) {
            if (!subSlot) {
                // Pure flag: just show the label as a static tag
                return <span className="text-sm font-mono text-zinc-600 px-1">{label}</span>;
            }
            // Flag+subSlot: show label then value input
            return (
                <div className="flex items-center gap-1">
                    <span className="text-sm font-mono text-zinc-600">{label}</span>
                    {Array.isArray(subSlot.primitive) ? (
                        <select value={subValue} onChange={e => handleSubChange(e.target.value)}
                            className="text-sm px-2 py-1 rounded-md border border-zinc-200 bg-white font-mono text-zinc-700">
                            {subSlot.primitive.map(v => <option key={v}>{v}</option>)}
                        </select>
                    ) : (
                        <input
                            type={subSlot.primitive === 'number' ? 'number' : 'text'}
                            value={subValue}
                            onChange={e => handleSubChange(e.target.value)}
                            placeholder={label ?? ''}
                            style={{ fieldSizing: 'content' } as React.CSSProperties}
                            className="text-sm px-2 py-1.5 font-mono"
                        />
                    )}
                </div>
            );
        }

        const isOn = value !== '';
        const handleToggle = (checked: boolean) => {
            if (!checked) { onChange(''); return; }
            if (!subSlot) { onChange(label ?? ''); return; }
            const defaultSub = Array.isArray(subSlot.primitive)
                ? subSlot.primitive[0]
                : subSlot.primitive === 'number' ? '0' : '';
            onChange(`${tokenPrefix}${defaultSub}`);
        };

        return (
            <div className="flex items-center gap-1">
                <label className="flex items-center gap-1 text-sm font-mono text-zinc-700 cursor-pointer select-none">
                    <input type="checkbox" checked={isOn} onChange={e => handleToggle(e.target.checked)} className="rounded" />
                    {label}
                </label>
                {subSlot && isOn && (
                    <div className="flex items-center gap-0.5">
                        {Array.isArray(subSlot.primitive) ? (
                            <select value={subValue} onChange={e => handleSubChange(e.target.value)}
                                className="text-sm px-2 py-1 rounded-md border border-zinc-200 bg-white font-mono text-zinc-700">
                                {subSlot.primitive.map(v => <option key={v}>{v}</option>)}
                            </select>
                        ) : (
                            <input
                                type={subSlot.primitive === 'number' ? 'number' : 'text'}
                                value={subValue}
                                onChange={e => handleSubChange(e.target.value)}
                                placeholder={subSlot.label ?? ''}
                                style={{ fieldSizing: 'content' } as React.CSSProperties}
                                className="text-sm px-2 py-1.5 font-mono"
                            />
                        )}
                    </div>
                )}
            </div>
        );
    }

    if (primitive === 'ssl') {
        return (
            <select value={value} onChange={e => onChange(e.target.value)}
                className="text-sm px-2 py-1 rounded-md border border-zinc-200 bg-white font-mono text-zinc-700">
                <option value="" disabled>select certificate…</option>
                {(sslLabels ?? []).map(l => <option key={l} value={l}>{l}</option>)}
            </select>
        );
    }

    if (Array.isArray(primitive)) {
        return (
            <select value={value} onChange={e => onChange(e.target.value)}
                className="text-sm px-2 py-1 rounded-md border border-zinc-200 bg-white font-mono text-zinc-700">
                <option value="" disabled>{label ?? '–'}</option>
                {primitive.map(v => <option key={v}>{v}</option>)}
            </select>
        );
    }

    return (
        <input
            type={primitive === 'number' ? 'number' : 'text'}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={label ?? primitive}
            style={{ fieldSizing: 'content' } as React.CSSProperties}
            className="text-sm px-2 py-1.5 font-mono"
        />
    );
}

interface ICard {
    data: EdgeBlockData;
    depth?: number;
    onChange?: (newData: EdgeBlockData) => void;
    onDelete?: () => void;
    sslLabels?: string[];
}

function Card({ data, depth = 0, onChange, onDelete, sslLabels }: ICard): JSX.Element {
    const name = data[0];
    const directive = findDirective(name);
    const isCtx = isContextDirective(directive);

    // Non-context params (slot values) vs the single context param (children block).
    // Storage: [name, ...slotValues, children[]] for context directives,
    //          [name, ...slotValues]              for plain directives.
    const allParams = directive?.params ?? [];
    const nonCtxParams = allParams.filter(p => p.primitive !== 'context');
    const rest = data.slice(1) as unknown[];
    const slotValues: string[] = rest.slice(0, nonCtxParams.length) as string[];
    const children: EdgeBlockData[] = isCtx
        ? ((rest[nonCtxParams.length] as EdgeBlockData[]) ?? [])
        : [];

    const [adding, setAdding] = useState(false);
    const [search, setSearch] = useState('');
    const [addingOpt, setAddingOpt] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const optRef = useRef<HTMLDivElement>(null);

    const [activeOpts, setActiveOpts] = useState<Set<number>>(() => {
        const set = new Set<number>();
        nonCtxParams.forEach((s, j) => {
            if (s.optional && slotValues[j] && slotValues[j] !== '') set.add(j);
        });
        return set;
    });

    useEffect(() => { if (adding) inputRef.current?.focus(); }, [adding]);

    const ctx = insideContext(name);
    const filtered = EdgeDirectives.filter(d =>
        d.key !== 'root' &&
        (d.context & ctx) !== 0 &&
        d.key.toLowerCase().includes(search.toLowerCase())
    );

    function emit(nextSlots: string[], nextChildren: EdgeBlockData[]) {
        if (isCtx) onChange?.([name, ...nextSlots, nextChildren] as unknown as EdgeBlockData);
        else       onChange?.([name, ...nextSlots] as unknown as EdgeBlockData);
    }

    function handleChildChange(i: number, updated: EdgeBlockData) {
        const next = [...children]; next[i] = updated;
        emit(slotValues, next);
    }
    function handleChildDelete(i: number) {
        emit(slotValues, children.filter((_, j) => j !== i));
    }
    function handleAdd(directiveName: string) {
        emit(slotValues, [...children, [directiveName] as EdgeBlockData]);
        setAdding(false); setSearch('');
    }
    function handleSlotChange(j: number, value: string) {
        const next = [...slotValues]; next[j] = value;
        emit(next, children);
    }

    function activateOpt(j: number) {
        const slot = nonCtxParams[j];
        let defaultVal = '';
        if (slot.primitive === 'flag') {
            if (!slot.subSlot) { defaultVal = slot.label ?? ''; }
            else {
                const sep = slot.subSlot.prefix ?? '=';
                const sub = Array.isArray(slot.subSlot.primitive)
                    ? slot.subSlot.primitive[0]
                    : slot.subSlot.primitive === 'number' ? '0' : '';
                defaultVal = `${slot.label}${sep}${sub}`;
            }
        } else if (Array.isArray(slot.primitive)) { defaultVal = slot.primitive[0]; }
        else if (slot.primitive === 'number') { defaultVal = '0'; }
        handleSlotChange(j, defaultVal);
        setActiveOpts(prev => new Set([...prev, j]));
        setAddingOpt(false);
    }
    function deactivateOpt(j: number) {
        handleSlotChange(j, '');
        setActiveOpts(prev => { const s = new Set(prev); s.delete(j); return s; });
    }

    // Param rows shared by both plain and context header
    const required       = nonCtxParams.map((s, j) => ({ s, j })).filter(({ s }) => !s.optional);
    const activeOptional = nonCtxParams.map((s, j) => ({ s, j })).filter(({ s, j }) => s.optional && activeOpts.has(j));
    const inactiveOptional = nonCtxParams.map((s, j) => ({ s, j })).filter(({ s, j }) => s.optional && !activeOpts.has(j));

    const paramInputs = (
        <div className="flex flex-wrap items-center gap-1 flex-1">
            {required.map(({ s, j }) => (
                <SlotInput key={j} slot={s} value={slotValues[j] ?? ''} onChange={v => handleSlotChange(j, v)} sslLabels={sslLabels} />
            ))}
            {activeOptional.map(({ s, j }) => (
                <div key={j} className="flex items-center gap-0.5">
                    <SlotInput slot={s} value={slotValues[j] ?? ''} onChange={v => handleSlotChange(j, v)} active sslLabels={sslLabels} />
                    <button onClick={() => deactivateOpt(j)}
                        className="text-zinc-300 hover:text-red-400 transition-colors leading-none px-0.5">×</button>
                </div>
            ))}
            {inactiveOptional.length > 0 && (
                <div ref={optRef} className="relative">
                    <button
                        onClick={() => setAddingOpt(v => !v)}
                        onBlur={e => { if (!optRef.current?.contains(e.relatedTarget)) setAddingOpt(false); }}
                        className="flex items-center gap-0.5 text-xs text-zinc-400 hover:text-brand font-mono transition-colors px-1 py-0.5">
                        + option
                    </button>
                    {addingOpt && (
                        <div className="absolute top-full left-0 z-10 mt-1 min-w-36 max-h-48 overflow-auto rounded-md border border-zinc-200 bg-white shadow-lg">
                            {inactiveOptional.map(({ s, j }) => (
                                <button key={j} onMouseDown={() => activateOpt(j)}
                                    className="w-full text-left px-3 py-1.5 text-sm font-mono hover:bg-zinc-50 text-zinc-700">
                                    {s.label ?? (Array.isArray(s.primitive) ? s.primitive[0] : s.primitive)}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    // Plain directive — inline row
    if (!isCtx) {
        return (
            <div className={`flex items-start gap-2 py-1${depth > 0 ? " ml-4" : ""}`}>
                <span className="w-1.5 h-3 rounded-full bg-brand/40 flex-shrink-0 mt-1.5" />
                <span className="font-mono text-sm font-medium text-zinc-700 tracking-tight shrink-0 pt-0.5">{name}</span>
                {paramInputs}
                {onDelete && (
                    <button onClick={onDelete} title="Delete"
                        className="text-zinc-300 hover:text-red-500 transition-colors text-lg leading-none shrink-0">
                        ×
                    </button>
                )}
            </div>
        );
    }

    // Context block — card with header params + nested children
    return (
        <div className={`rounded-lg border border-zinc-200 bg-white shadow-sm${depth > 0 ? " ml-4" : ""}`}>
            <div className="flex items-center gap-2 px-3 py-2 bg-zinc-50 border-b border-zinc-200 rounded-t-lg">
                <span className="w-1.5 h-4 rounded-full bg-brand flex-shrink-0" />
                <span className="font-mono text-sm font-semibold text-zinc-800 tracking-tight shrink-0">{name}</span>
                {nonCtxParams.length > 0 && paramInputs}
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

            <div className="flex flex-col gap-2 p-3">
                {children.map((child, i) => (
                    <Card key={i} data={child} depth={depth + 1}
                        onChange={(u) => handleChildChange(i, u)}
                        onDelete={() => handleChildDelete(i)}
                        sslLabels={sslLabels} />
                ))}
                <div className="relative">
                    {adding ? (
                        <>
                            <input ref={inputRef} type="text" value={search}
                                onChange={e => setSearch(e.target.value)}
                                onBlur={() => { setAdding(false); setSearch(''); }}
                                onKeyDown={e => {
                                    if (e.key === 'Escape') { setAdding(false); setSearch(''); }
                                    if (e.key === 'Enter' && filtered.length > 0) handleAdd(filtered[0].key);
                                }}
                                placeholder="Search directive…"
                                className="w-full text-sm px-2 py-1.5" />
                            {filtered.length > 0 && (
                                <div className="absolute top-full left-0 right-0 z-10 mt-1 max-h-48 overflow-auto rounded-md border border-zinc-200 bg-white shadow-lg">
                                    {filtered.map(d => (
                                        <button key={d.key} onMouseDown={() => handleAdd(d.key)}
                                            className="w-full text-left px-3 py-1.5 text-sm font-mono hover:bg-zinc-50 text-zinc-700">
                                            {d.key}
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
    sslLabels?: string[];
}

export default function Block({ data, context, onChange, sslLabels }: IBlockProps): JSX.Element {
    const [adding, setAdding] = useState(false);
    const [search, setSearch] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { if (adding) inputRef.current?.focus(); }, [adding]);

    const filtered = EdgeDirectives.filter(d =>
        (d.context & context) !== 0 &&
        d.key.toLowerCase().includes(search.toLowerCase())
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
                    sslLabels={sslLabels}
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
                                if (e.key === 'Enter' && filtered.length > 0) handleAdd(filtered[0].key);
                            }}
                            placeholder="Search directive…"
                            className="w-full text-sm px-2 py-1.5"
                        />
                        {filtered.length > 0 && (
                            <div className="absolute top-full left-0 right-0 z-10 mt-1 max-h-48 overflow-auto rounded-md border border-zinc-200 bg-white shadow-lg">
                                {filtered.map(d => (
                                    <button key={d.key} onMouseDown={() => handleAdd(d.key)}
                                        className="w-full text-left px-3 py-1.5 text-sm font-mono hover:bg-zinc-50 text-zinc-700">
                                        {d.key}
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
