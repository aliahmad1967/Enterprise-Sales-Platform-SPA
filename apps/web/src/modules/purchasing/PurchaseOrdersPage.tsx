import { useMemo } from "react";
import { Truck } from "lucide-react";
import type { PurchaseOrder } from "@esp/types";
import { purchaseOrderHooks } from "@esp/services";
import { useI18n } from "@/i18n";
import { PageHeader } from "@/components/PageHeader";
import { PageLoader } from "@/components/PageHeader";
import { DocumentList } from "@/modules/sales/components/DocumentList";

const tone: Record<string, "neutral" | "success" | "warning" | "danger" | "info" | "outline"> = {
  draft: "neutral",
  pending: "warning",
  approved: "info",
  confirmed: "info",
  in_transit: "warning",
  delivered: "success",
  cancelled: "neutral",
};

export function PurchaseOrdersPage() {
  const { t } = useI18n();
  const { data, isLoading } = purchaseOrderHooks.useList({ pageSize: 1000 });

  const rows = useMemo(
    () =>
      (data?.items ?? [])
        .map((po: PurchaseOrder) => ({
          id: po.id,
          code: po.code,
          customerName: po.supplierName,
          status: po.status,
          total: po.totals.total,
          date: (po.expectedDate ?? po.createdAt).slice(0, 10),
        }))
        .sort((a, b) => b.date.localeCompare(a.date)),
    [data],
  );

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <PageHeader
        title={t("nav.purchaseOrders")}
        description={t("purchasing.ordersDesc")}
        actions={<Truck className="size-5 text-muted-foreground" />}
      />
      <DocumentList
        rows={rows}
        statusLabel={(s) => t(`invoice.status.${s}`)}
        toneFor={(s) => tone[s]}
        onOpen={() => undefined}
        empty={
          <div className="flex flex-col items-center gap-2 py-10">
            <Truck className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{t("common.noResults")}</p>
          </div>
        }
      />
    </div>
  );
}
