import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical } from 'lucide-react';

export interface RowMenuItem {
    label: string;
    icon?: React.ReactNode;
    variant?: 'default' | 'danger';
    onClick: () => void;
}

export default function RowMenu({ items }: { items: RowMenuItem[] }) {
    const [open, setOpen] = useState(false);
    const [pos, setPos] = useState({ top: 0, left: 0 });
    const btnRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        function handleClickOutside(e: MouseEvent) {
            const target = e.target as Node;
            if (
                btnRef.current?.contains(target) ||
                dropdownRef.current?.contains(target)
            ) return;
            setOpen(false);
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open]);

    function handleOpen(e: React.MouseEvent) {
        e.stopPropagation();
        const rect = btnRef.current!.getBoundingClientRect();
        setPos({ top: rect.bottom + window.scrollY + 4, left: rect.right + window.scrollX });
        setOpen(v => !v);
    }

    const itemColor = {
        default: 'text-zinc-700 hover:bg-zinc-50',
        danger: 'text-red-600 hover:bg-red-50',
    };

    return (
        <>
            <button
                ref={btnRef}
                type="button"
                onClick={handleOpen}
                className="flex items-center justify-center w-6 h-6 rounded text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
            >
                <MoreVertical size={14} strokeWidth={1.75} />
            </button>

            {open && createPortal(
                <div
                    ref={dropdownRef}
                    style={{ top: pos.top, left: pos.left }}
                    className="absolute z-50 -translate-x-full min-w-[140px] bg-white border border-zinc-200 rounded-lg shadow-md py-1"
                >
                    {items.map((item, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={e => { e.stopPropagation(); item.onClick(); setOpen(false); }}
                            className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm ${itemColor[item.variant ?? 'default']}`}
                        >
                            {item.icon && <span className="w-4 h-4 flex items-center justify-center">{item.icon}</span>}
                            {item.label}
                        </button>
                    ))}
                </div>,
                document.body
            )}
        </>
    );
}
