import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PackagePlus } from "lucide-react";
import type { SalesOrder } from "@esp/types";
import { buildTotals, orderHooks } from "@esp/services";
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle } from "@esp/ui";
import { useI18n } from "@/i18n";
import { PageHeader } from "@/components/PageHeader";
import { PageLoader } from "@/components/PageHeader";
import { DocumentForm } from "./components/DocumentForm";
import { DocumentList } from "./components/DocumentList";
import { buildOrderInput } from "./lib";

const tone: Record<string, "neutral" | "success" | "warning" | "danger" | "info" | "outline"> = {
  draft: "neutral",
  pending: "warning",
  confirmed: "info",
  in_transit: "info",
  delivered: "success",
  cancelled: "neutral",
  returned: "danger",
};

export function OrdersPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { data, isLoading } = orderHooks.useList({ pageSize: 1000 });
  const create = orderHooks.useCreate();
  const [open, setOpen] = useState(false);

  const rows = useMemo(
    () =>
      (data?.items ?? [])
        .map((o: SalesOrder) => ({
          id: o.id,
          code: o.code,
          customerName: o.customerName,
          status: o.status,
          total: o.totals.total,
          date: o.createdAt.slice(0, 10),
        }))
        .sort((a, b) => b.date.localeCompare(a.date)),
    [data],
  );

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <PageHeader
        title={t("nav.orders")}
        description={t("sales.ordersDesc")}
        actions={
          <Button onClick={() => setOpen(true)}>
            <PackagePlus className="size-4" />
            {t("order.new")}
          </Button>
        }
      />
      <DocumentList
        rows={rows}
        statusLabel={(s) => t(`invoice.status.${s}`)}
        toneFor={(s) => tone[s]}
        onOpen={(id) => navigate(`/sales/orders/${id}`)}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{t("order.new")}</DialogTitle>
          </DialogHeader>
          <DocumentForm
            mode="order"
            submitLabel={t("order.create")}
            busy={create.isPending}
            onSubmit={async (v) => {
              await create.mutateAsync(
                await buildOrderInput({
                  ...v,
                  existing: data?.items ?? [],
                  discountPct: 0,
                  totals: buildTotals(v.lines, 0, "IQD"),
                }),
              );
              setOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
