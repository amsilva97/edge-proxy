import { useEffect } from 'react';

interface DialogProps {
    open: boolean;
    title?: string;
    onCancel?: () => void;
    children: React.ReactNode;
}

export default function Dialog({ open, title, onCancel, children }: DialogProps) {
    // close on Escape if cancellable
    useEffect(() => {
        if (!open || !onCancel) return;
        function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onCancel!(); }
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, onCancel]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* backdrop */}
            <div
                className="absolute inset-0 bg-black/30"
                onClick={onCancel}
            />

            {/* panel */}
            <div className="relative z-10 w-full max-w-md rounded-xl bg-white shadow-lg border border-zinc-200">
                {(title || onCancel) && (
                    <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
                        {title && <span className="text-sm font-semibold text-zinc-900">{title}</span>}
                        {onCancel && (
                            <button
                                onClick={onCancel}
                                className="ml-auto text-zinc-400 hover:text-zinc-600 transition-colors text-sm leading-none"
                                aria-label="Close"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                )}
                <div className="px-5 py-4">
                    {children}
                </div>
            </div>
        </div>
    );
}
