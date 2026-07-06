import Link from "next/link";
import EmptyState from "@/components/ui/EmptyState";

export type Column<T> = {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  rowHref?: (row: T) => string;
  getRowId: (row: T) => string | number;
  emptyTitle?: string;
  emptyMessage?: string;
};

export default function DataTable<T extends object>({
  columns,
  rows,
  rowHref,
  getRowId,
  emptyTitle = "No records found",
  emptyMessage,
}: DataTableProps<T>) {
  if (rows.length === 0) {
    return <EmptyState title={emptyTitle} message={emptyMessage} />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-warm-deep text-left">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 font-medium uppercase tracking-wide text-xs text-ink-soft"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-warm-deep">
          {rows.map((row) => (
            <tr key={getRowId(row)} className={rowHref ? "hover:bg-warm/50 transition-colors" : undefined}>
              {columns.map((col, i) => {
                const cellContent = col.render
                  ? col.render(row)
                  : String((row as Record<string, unknown>)[col.key] ?? "—");
                return (
                  <td key={col.key} className="px-4 py-3 text-ink">
                    {rowHref && i === 0 ? (
                      <Link href={rowHref(row)} className="hover:text-primary">
                        {cellContent}
                      </Link>
                    ) : (
                      cellContent
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
