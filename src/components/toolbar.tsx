interface ToolbarProps {
    children: React.ReactNode;
}

export default function Toolbar({ children }: ToolbarProps) {
    return (
        <div className="flex items-center h-14 border-b border-zinc-200 dark:border-zinc-800 px-3">
            {children}
        </div>
    );
}