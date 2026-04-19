interface ToolbarProps {
    title?: string;
    children?: React.ReactNode;
}

export default function Toolbar({ title, children }: ToolbarProps) {
    return (
        <div className="shrink-0 flex items-center justify-between gap-4 px-5 h-12 bg-white border-b border-zinc-200">
            {title && <span className="text-sm font-semibold text-zinc-900">{title}</span>}
            {children && <div className="flex items-center gap-2">{children}</div>}
        </div>
    );
}
