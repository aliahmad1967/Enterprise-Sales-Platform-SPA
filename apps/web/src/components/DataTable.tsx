import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { cn } from "@esp/utils";
import { EmptyState, Pagination, Skeleton } from "@esp/ui";
import { useI18n } from "@/i18n";

export interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  loading?: boolean;
  total?: number;
  pageIndex?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onRowClick?: (row: TData) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  empty?: React.ReactNode;
  className?: string;
  rowKey?: (row: TData) => string;
}

export function DataTable<TData>({
  columns,
  data,
  loading = false,
  total,
  pageIndex = 1,
  pageSize = 25,
  onPageChange,
  onRowClick,
  emptyTitle,
  emptyDescription,
  emptyAction,
  empty,
  className,
  rowKey,
}: DataTableProps<TData>) {
  const { t } = useI18n();
  const [sorting, setSorting] = useState<SortingState>([]);

  const keyOf = rowKey ?? ((r: TData) => String((r as { id?: unknown }).id ?? ""));

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: Boolean(total),
    manualSorting: false,
  });

  const paginated = useMemo(() => {
    if (onPageChange) return true;
    return table.getRowModel().rows.length > pageSize;
  }, [onPageChange, pageSize, table]);

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-9 w-full" />
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    if (empty) {
      return (
        <div className={cn("overflow-hidden rounded-xl border border-border bg-surface", className)}>
          {empty}
        </div>
      );
    }
    return (
      <EmptyState
        title={emptyTitle ?? t("common.noResults")}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  return (
    <div className={cn("overflow-hidden rounded-xl border border-border bg-surface", className)}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-border bg-muted/50">
                {hg.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  return (
                    <th
                      key={header.id}
                      className="whitespace-nowrap px-4 py-2.5 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          className="flex items-center gap-1.5 hover:text-foreground"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getIsSorted() === "asc" ? (
                            <ArrowUp className="size-3.5 text-primary" />
                          ) : header.column.getIsSorted() === "desc" ? (
                            <ArrowDown className="size-3.5 text-primary" />
                          ) : (
                            <ChevronsUpDown className="size-3.5 opacity-50" />
                          )}
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={keyOf(row.original)}
                onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                className={cn(
                  "border-b border-border/60 transition-colors last:border-0",
                  onRowClick ? "cursor-pointer hover:bg-muted/40" : "hover:bg-muted/30",
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="whitespace-nowrap px-4 py-3 align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(onPageChange || paginated) && total !== undefined ? (
        <div className="border-t border-border px-4 py-3">
          <Pagination
            page={pageIndex}
            pageSize={pageSize}
            total={total}
            onPageChange={(p) => onPageChange?.(p)}
          />
        </div>
      ) : null}
    </div>
  );
}
