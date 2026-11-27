import type { ReactNode } from 'react';

export interface Column<T> {
  header: string;
  cell: (row: T) => ReactNode;
  /** Right-align numbers (prices, quantities). */
  align?: 'left' | 'right';
  className?: string;
}

interface Props<T> {
  items: readonly T[];
  getKey: (row: T) => string;
  columns: readonly Column<T>[];
  /** How one row looks on a phone. Each screen decides what matters most. */
  renderCard: (row: T) => ReactNode;
  /** Name of the list for screen readers. */
  label: string;
}

/**
 * One list, two layouts: stacked cards on a phone, a table from 768px up.
 * Screens give the table columns and the card; this keeps every list in the app looking the same.
 */
export function DataList<T>({ items, getKey, columns, renderCard, label }: Props<T>) {
  return (
    <>
      <ul aria-label={label} className="space-y-2.5 md:hidden">
        {items.map((row) => (
          <li key={getKey(row)} className="rounded-2xl border border-line bg-white p-4">
            {renderCard(row)}
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto rounded-2xl border border-line bg-white md:block">
        <table aria-label={label} className="w-full text-left text-sm">
          <thead className="border-b border-line bg-mist/60 text-muted">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.header}
                  scope="col"
                  className={`px-4 py-3 font-semibold ${column.align === 'right' ? 'text-right' : ''}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {items.map((row) => (
              <tr key={getKey(row)} className="align-middle hover:bg-mist/50">
                {columns.map((column) => (
                  <td
                    key={column.header}
                    className={`px-4 py-3 ${column.align === 'right' ? 'text-right tabular-nums' : ''} ${column.className ?? ''}`}
                  >
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
