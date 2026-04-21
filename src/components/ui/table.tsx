export interface Column<T = any> {
    key: string;
    label: string;
    width?: string;
    align?: 'left' | 'center' | 'right';
    render?: (value: any, row: T) => React.ReactNode;
}

interface TableProps<T = any> {
    columns: Column<T>[];
    data: T[];
    onRowClick?: (row: T) => void;
    rowKey?: (row: T) => string;
    actions?: (row: T) => React.ReactNode;
}

export default function Table<T = any>({ columns, data, onRowClick, rowKey, actions }: TableProps<T>) {
    const align = { left: 'text-left', center: 'text-center', right: 'text-right' };

    return (
        <div className="rounded-lg overflow-hidden bg-white border border-zinc-200 shadow-sm">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="border-b border-zinc-200 bg-zinc-50">
                        {columns.map(col => (
                            <th
                                key={col.key}
                                style={col.width ? { width: col.width } : undefined}
                                className={`px-5 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide ${align[col.align ?? 'left']}`}
                            >
                                {col.label}
                            </th>
                        ))}
                        {actions && <th className="px-5 py-2.5" />}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, i) => (
                        <tr
                            key={rowKey ? rowKey(row) : i}
                            onClick={() => onRowClick?.(row)}
                            className={`group border-b border-zinc-100 last:border-0 transition-colors hover:bg-brand/5 ${onRowClick ? 'cursor-pointer' : ''}`}
                        >
                            {columns.map(col => (
                                <td
                                    key={col.key}
                                    className={`px-5 py-3 text-sm ${align[col.align ?? 'left']} text-zinc-900 transition-colors`}
                                >
                                    {col.render ? col.render((row as any)[col.key], row) : (row as any)[col.key]}
                                </td>
                            ))}
                            {actions && (
                                <td className="px-5 py-3 text-right" onClick={e => e.stopPropagation()}>
                                    {actions(row)}
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
