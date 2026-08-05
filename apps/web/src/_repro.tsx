import { DataTable } from "@/components/DataTable";

type StockMove = { id: string; type: string };

function useMemo<T>(fn: () => T, deps: unknown[]): T {
  return (0 as unknown) as T;
}

export function VariantA() {
  const rows: StockMove[] = [];
  const columns = useMemo(
    () => [
      {
        id: "type",
        header: "type",
        cell: ({ row }: { row: { original: StockMove } }) => <span>{row.original.type}</span>,
      },
    ],
    [],
  );
  return <DataTable columns={columns} data={rows} empty={<p>empty</p>} />;
}
