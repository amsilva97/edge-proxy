interface ToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    disabled?: boolean;
}

export default function Toggle({ checked, onChange, label, disabled }: ToggleProps) {
    return (
        <label className={`inline-flex items-center gap-2 select-none ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
            <button
                role="switch"
                aria-checked={checked}
                disabled={disabled}
                onClick={() => onChange(!checked)}
                className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 cursor-pointer disabled:cursor-not-allowed ${
                    checked ? 'bg-brand' : 'bg-zinc-300'
                }`}
            >
                <span
                    className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                        checked ? 'translate-x-4' : 'translate-x-0'
                    }`}
                />
            </button>
            {label && <span className="text-xs text-zinc-600">{label}</span>}
        </label>
    );
}
