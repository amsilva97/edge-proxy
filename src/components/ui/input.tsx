interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    size?: 'normal' | 'small' | 'xs';
}

export default function Input({ size = 'normal', className = '', ...props }: InputProps) {
    const sizes = {
        normal: 'px-3 py-1.5 text-sm rounded-md',
        small:  'px-2 py-1 text-xs rounded',
        xs:     'px-1.5 py-0.5 text-[11px] leading-4 rounded',
    };

    return (
        <input
            className={`border border-zinc-300 bg-white text-zinc-900 placeholder:text-zinc-400 outline-none transition-[border-color,box-shadow] focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:opacity-50 disabled:cursor-not-allowed ${sizes[size]} ${className}`}
            {...props}
        />
    );
}
