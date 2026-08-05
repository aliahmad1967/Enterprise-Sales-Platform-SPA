import { useMemo, useState } from "react";
import { ArrowDownToLine, ArrowUpFromLine, Package, Search } from "lucide-react";
import type { StockMove } from "@esp/types";
import { stockMoveHooks } from "@esp/services";
import { Badge, Input } from "@esp/ui";
import { useI18n } from "@/i18n";
import { useFormat } from "@/lib/format";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { PageLoader } from "@/components/PageHeader";

const moveTone: Record<StockMove["type"], "neutral" | "success" | "warning" | "danger" | "info" | "outline"> = {
  receive: "success",
  issue: "info",
  transfer: "warning",
  adjustment: "warning",
  cycle_count: "neutral",
  return: "warning",
  sold: "danger",
};

export function StockMovesPage() {
  const { t } = useI18n();
  const { money } = useFormat();
  const { data, isLoading } = stockMoveHooks.useList({ pageSize: 1000 });
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const all = data?.items ?? [];
    const ql = q.trim().toLowerCase();
    return [...all]
      .filter((m) => !ql || (m.refCode ?? "").toLowerCase().includes(ql) || m.productId.includes(ql))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [data, q]);

  const columns = useMemo(
    () => [
      {
        id: "type",
        header: t("stock.type"),
        cell: ({ row }: { row: { original: StockMove } }) => (
          <Badge variant={moveTone[row.original.type]}>
            <span className="flex items-center gap-1">
              {row.original.type === "sold" || row.original.type === "issue" ? (
                <ArrowUpFromLine className="size-3" />
              ) : (
                <ArrowDownToLine className="size-3" />
              )}
              {t(`stock.type.${row.original.type}`)}
            </span>
          </Badge>
        ),
      },
      {
        id: "productId",
        header: t("common.product"),
        cell: ({ row }: { row: { original: StockMove } }) => (
          <span className="text-sm font-medium text-foreground" dir="ltr">{row.original.productId.slice(0, 10)}…</span>
        ),
      },
      {
        id: "qty",
        header: t("common.qty"),
        cell: ({ row }: { row: { original: StockMove } }) => (
          <span className={row.original.type === "sold" || row.original.type === "issue" ? "text-danger tabular-nums" : "text-success tabular-nums"}>
            {row.original.type === "sold" || row.original.type === "issue" ? "−" : "+"}{row.original.qty}
          </span>
        ),
      },
      {
        id: "unitCost",
        header: t("product.cost"),
        cell: ({ row }: { row: { original: StockMove } }) => (
          <span className="tabular-nums">{money(row.original.unitCost.amount)}</span>
        ),
      },
      {
        id: "ref",
        header: t("stock.reference"),
        cell: ({ row }: { row: { original: StockMove } }) => (
          <span className="text-xs text-muted-foreground" dir="ltr">{row.original.refCode || "—"}</span>
        ),
      },
      {
        id: "date",
        header: t("invoice.issueDate"),
        cell: ({ row }: { row: { original: StockMove } }) => (
          <span className="text-xs text-muted-foreground">{new Date(row.original.createdAt).toLocaleDateString()}</span>
        ),
      },
    ],
    [t, money],
  );

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <PageHeader
        title={t("nav.stockMoves")}
        description={t("inventory.stockMovesDesc")}
        actions={<Package className="size-5 text-muted-foreground" />}
      />
      <div className="relative mb-4 max-w-md">
        <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("common.search")} className="ps-9" />
      </div>
      <DataTable columns={columns} data={rows} empty={<p className="text-center text-sm text-muted-foreground">{t("common.noResults")}</p>} />
    </div>
  );
}
