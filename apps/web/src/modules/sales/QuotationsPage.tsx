import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Plus } from "lucide-react";
import type { Quotation } from "@esp/types";
import { buildTotals, quotationHooks } from "@esp/services";
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle } from "@esp/ui";
import { useI18n } from "@/i18n";
import { PageHeader } from "@/components/PageHeader";
import { PageLoader } from "@/components/PageHeader";
import { DocumentForm } from "./components/DocumentForm";
import { DocumentList } from "./components/DocumentList";
import { buildQuotationInput } from "./lib";

const tone: Record<string, "neutral" | "success" | "warning" | "danger" | "info" | "outline"> = {
  draft: "neutral",
  pending: "warning",
  approved: "success",
  rejected: "danger",
  cancelled: "neutral",
};

export function QuotationsPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { data, isLoading } = quotationHooks.useList({ pageSize: 1000 });
  const create = quotationHooks.useCreate();
  const [open, setOpen] = useState(false);

  const rows = useMemo(
    () =>
      (data?.items ?? [])
        .map((qt: Quotation) => ({
          id: qt.id,
          code: qt.code,
          customerName: qt.customerName,
          status: qt.status,
          total: qt.totals.total,
          date: qt.createdAt.slice(0, 10),
        }))
        .sort((a, b) => b.date.localeCompare(a.date)),
    [data],
  );

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <PageHeader
        title={t("nav.quotations")}
        description={t("sales.quotationsDesc")}
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            {t("quotation.new")}
          </Button>
        }
      />
      <DocumentList
        rows={rows}
        statusLabel={(s) => t(`invoice.status.${s}`)}
        toneFor={(s) => tone[s]}
        onOpen={(id) => navigate(`/sales/quotations/${id}`)}
        empty={
          <div className="flex flex-col items-center gap-2 py-10">
            <FileText className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{t("quotation.empty")}</p>
          </div>
        }
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{t("quotation.new")}</DialogTitle>
          </DialogHeader>
          <DocumentForm
            mode="quotation"
            submitLabel={t("quotation.create")}
            busy={create.isPending}
            onSubmit={async (v) => {
              await create.mutateAsync(
                await buildQuotationInput({
                  ...v,
                  existing: data?.items ?? [],
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
