import { useMemo } from "react";
import { FileClock } from "lucide-react";
import type { Bill } from "@esp/types";
import { billHooks } from "@esp/services";
import { Badge } from "@esp/ui";
import { useI18n } from "@/i18n";
import { PageHeader } from "@/components/PageHeader";
import { PageLoader } from "@/components/PageHeader";
import { DocumentList } from "@/modules/sales/components/DocumentList";

const tone: Record<string, "neutral" | "success" | "warning" | "danger" | "info" | "outline"> = {
  draft: "neutral",
  pending: "warning",
  partially_paid: "info",
  paid: "success",
  overdue: "danger",
  cancelled: "neutral",
};

export function BillsPage() {
  const { t } = useI18n();
  const { data, isLoading } = billHooks.useList({ pageSize: 1000 });

  const rows = useMemo(
    () =>
      (data?.items ?? [])
        .map((b: Bill) => ({
          id: b.id,
          code: b.code,
          customerName: b.supplierName,
          status: b.status,
          total: b.totals.total,
          date: b.dueDate.slice(0, 10),
        }))
        .sort((a, b) => b.date.localeCompare(a.date)),
    [data],
  );

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <PageHeader
        title={t("nav.bills")}
        description={t("purchasing.billsDesc")}
        actions={<FileClock className="size-5 text-muted-foreground" />}
      />
      <DocumentList
        rows={rows}
        statusLabel={(s) => t(`invoice.status.${s}`)}
        toneFor={(s) => tone[s]}
        onOpen={() => undefined}
        empty={<p className="text-center text-sm text-muted-foreground">{t("common.noResults")}</p>}
      />
      {rows.filter((r) => r.status === "overdue" || r.status === "pending").length > 0 ? (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-warning/30 bg-warning-soft/50 px-4 py-3 text-sm text-warning">
          <Badge variant="warning">{rows.filter((r) => r.status === "overdue").length}</Badge>
          {t("bills.overdueNotice")}
        </div>
      ) : null}
    </div>
  );
}
