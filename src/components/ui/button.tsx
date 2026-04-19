interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'solid' | 'outline';
    color?: 'brand' | 'danger';
    size?: 'sm' | 'md';
}

export default function Button({ variant = 'solid', color = 'brand', size = 'md', className = '', ...props }: ButtonProps) {
    const base = 'inline-flex items-center justify-center font-medium rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed';

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-4 py-1.5 text-sm',
    };

    const styles = {
        solid: {
            brand:  'bg-brand hover:bg-brand-dark text-white',
            danger: 'bg-red-600 hover:bg-red-700 text-white',
        },
        outline: {
            brand:  'border border-brand text-brand hover:bg-brand/10',
            danger: 'border border-red-500 text-red-500 hover:bg-red-50',
        },
    };

    return (
        <button
            className={`${base} ${sizes[size]} ${styles[variant][color]} ${className}`}
            {...props}
        />
    );
}
