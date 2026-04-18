interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'danger' | 'ghost';
    size?: 'sm' | 'md';
}

export default function Button({ variant = 'ghost', size = 'sm', className = '', ...props }: ButtonProps) {
    const base = 'inline-flex items-center justify-center font-medium rounded transition-colors disabled:opacity-50';

    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
    };

    const variants = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700',
        danger:  'border border-red-400 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20',
        ghost:   'border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800',
    };

    return (
        <button
            className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
            {...props}
        />
    );
}
