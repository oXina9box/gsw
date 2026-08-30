import { type ReactNode } from 'react';

export interface TableColumn<T> {
  key: string;
  header: ReactNode;
  render: (row: T, index: number) => ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

interface PrelineTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string;
  emptyState?: ReactNode;
  className?: string;
}

export function PrelineTable<T>({
  columns,
  data,
  keyExtractor,
  emptyState,
  className = '',
}: PrelineTableProps<T>) {
  if (data.length === 0 && emptyState) {
    return <div className="p-8 text-center">{emptyState}</div>;
  }

  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <div className={`w-full overflow-x-auto border border-border bg-surface rounded-md ${className}`}>
      <table className="w-full text-left text-sm font-body border-collapse">
        <thead className="border-b border-border bg-surface-2">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width }}
                className={`p-3 sm:p-4 font-mono text-xs uppercase tracking-wider text-text-faint font-semibold ${
                  alignClass[col.align ?? 'left']
                }`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-2">
          {data.map((row, index) => (
            <tr
              key={keyExtractor(row, index)}
              className="transition-colors duration-100 hover:bg-surface-3"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`p-3 sm:p-4 text-text ${
                    alignClass[col.align ?? 'left']
                  }`}
                >
                  {col.render(row, index)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
