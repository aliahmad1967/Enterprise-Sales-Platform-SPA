import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { DocumentStatus } from "@esp/types";
import { Badge, Input } from "@esp/ui";
import { useI18n } from "@/i18n";
import { useFormat } from "@/lib/format";
import { DataTable } from "@/components/DataTable";

export interface DocumentListRow {
  id: string;
  code: string;
  customerName: string;
  status: DocumentStatus;
  total: number;
  date: string;
}

export function DocumentList({
  rows,
  statusLabel,
  toneFor,
  onOpen,
  empty,
}: {
  rows: DocumentListRow[];
  statusLabel: (status: DocumentStatus) => string;
  toneFor: (status: DocumentStatus) => "neutral" | "success" | "warning" | "danger" | "info" | "outline" | undefined;
  onOpen: (id: string) => void;
  empty?: React.ReactNode;
}) {
  const { t } = useI18n();
  const { money } = useFormat();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    if (!ql) return rows;
    return rows.filter(
      (r) => r.code.toLowerCase().includes(ql) || r.customerName.toLowerCase().includes(ql),
    );
  }, [rows, q]);

  const columns = useMemo(
    () => [
      {
        id: "code",
        header: t("invoice.code"),
        cell: ({ row }: { row: { original: DocumentListRow } }) => (
          <span className="text-sm font-semibold text-primary" dir="ltr">{row.original.code}</span>
        ),
      },
      {
        id: "customerName",
        header: t("customer.customer"),
        cell: ({ row }: { row: { original: DocumentListRow } }) => (
          <span className="text-sm font-medium text-foreground">{row.original.customerName}</span>
        ),
      },
      {
        id: "date",
        header: t("invoice.issueDate"),
        cell: ({ row }: { row: { original: DocumentListRow } }) => (
          <span className="text-sm text-muted-foreground">{new Date(row.original.date).toLocaleDateString()}</span>
        ),
      },
      {
        id: "status",
        header: t("invoice.status"),
        cell: ({ row }: { row: { original: DocumentListRow } }) => (
          <Badge variant={toneFor(row.original.status)}>{statusLabel(row.original.status)}</Badge>
        ),
      },
      {
        id: "total",
        header: t("invoice.total"),
        cell: ({ row }: { row: { original: DocumentListRow } }) => (
          <span className="text-sm font-semibold tabular-nums text-foreground">{money(row.original.total)}</span>
        ),
      },
    ],
    [t, money, statusLabel, toneFor],
  );

  return (
    <div>
      <div className="relative mb-4 max-w-md">
        <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("common.search")} className="ps-9" />
      </div>
      <DataTable
        columns={columns}
        data={filtered}
        onRowClick={(row) => onOpen(row.id)}
        empty={empty ?? <p className="text-center text-sm text-muted-foreground">{t("common.noResults")}</p>}
      />
    </div>
  );
}
