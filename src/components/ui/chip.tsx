const solid = {
    brand: 'bg-brand/15 text-brand',
    zinc: 'bg-zinc-100 text-zinc-500',
    red: 'bg-red-100 text-red-700',
    blue: 'bg-blue-100 text-blue-700',
} as const;

const outline = {
    brand: 'border border-brand text-brand',
    zinc: 'border border-zinc-300 text-zinc-500',
    red: 'border border-red-400 text-red-700',
    blue: 'border border-blue-400 text-blue-700',
} as const;

export default function Chip({
    label,
    color = 'zinc',
    variant = 'solid',
}: {
    label: string;
    color?: keyof typeof solid;
    variant?: 'solid' | 'outline';
}) {
    const styles = variant === 'outline' ? outline : solid;
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[color]}`}>
            {label}
        </span>
    );
}
