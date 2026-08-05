import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FilePlus2, Search } from "lucide-react";
import { cn } from "@esp/utils";
import type { Invoice } from "@esp/types";
import { buildTotals, invoiceHooks } from "@esp/services";
import { Badge, Button, Dialog, DialogContent, DialogHeader, DialogTitle, Input } from "@esp/ui";
import { useI18n } from "@/i18n";
import { useAuthStore } from "@/state/auth";
import { useFormat } from "@/lib/format";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { PageLoader } from "@/components/PageHeader";
import { DocumentForm } from "./components/DocumentForm";
import { buildInvoiceInput, invoiceStatusTone } from "./lib";

export function InvoicesPage() {
  const { t } = useI18n();
  const { money } = useFormat();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const { data, isLoading } = invoiceHooks.useList({ pageSize: 1000 });
  const create = invoiceHooks.useCreate();
  const [open, setOpen] = useState(params.get("new") === "1");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");

  useEffect(() => {
    if (params.get("new") === "1") {
      setOpen(true);
      params.delete("new");
      setParams(params, { replace: true });
    }
  }, [params, setParams]);

  const filtered = useMemo(() => {
    const rows = data?.items ?? [];
    const ql = q.trim().toLowerCase();
    return rows
      .filter((i) => {
        if (status !== "all" && i.status !== status) return false;
        if (!ql) return true;
        return i.code.toLowerCase().includes(ql) || i.customerName.toLowerCase().includes(ql);
      })
      .sort((a, b) => b.issueDate.localeCompare(a.issueDate));
  }, [data, q, status]);

  const columns = useMemo(
    () => [
      {
        id: "code",
        header: t("invoice.code"),
        cell: ({ row }: { row: { original: Invoice } }) => (
          <span className="text-sm font-semibold text-primary" dir="ltr">{row.original.code}</span>
        ),
      },
      {
        id: "customerName",
        header: t("customer.customer"),
        cell: ({ row }: { row: { original: Invoice } }) => (
          <span className="text-sm font-medium text-foreground">{row.original.customerName}</span>
        ),
      },
      {
        id: "issueDate",
        header: t("invoice.issueDate"),
        cell: ({ row }: { row: { original: Invoice } }) => (
          <span className="text-sm text-muted-foreground">
            {new Date(row.original.issueDate).toLocaleDateString()}
          </span>
        ),
      },
      {
        id: "status",
        header: t("invoice.status"),
        cell: ({ row }: { row: { original: Invoice } }) => (
          <Badge variant={invoiceStatusTone[row.original.status]}>{t(`invoice.status.${row.original.status}`)}</Badge>
        ),
      },
      {
        id: "total",
        header: t("invoice.total"),
        cell: ({ row }: { row: { original: Invoice } }) => (
          <span className="text-sm font-semibold tabular-nums text-foreground">{money(row.original.totals.total)}</span>
        ),
      },
      {
        id: "paid",
        header: t("invoice.paid"),
        cell: ({ row }: { row: { original: Invoice } }) => (
          <span className={cn("text-sm tabular-nums", row.original.paidAmount > 0 ? "text-success" : "text-muted-foreground")}>
            {money(row.original.paidAmount)}
          </span>
        ),
      },
    ],
    [t, money],
  );

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <PageHeader
        title={t("nav.invoices")}
        description={t("sales.invoicesDesc")}
        actions={
          <Button onClick={() => setOpen(true)}>
            <FilePlus2 className="size-4" />
            {t("sales.newInvoice")}
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("common.search")} className="ps-9" />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-9 w-full appearance-none rounded-lg border border-border bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring sm:w-48"
        >
          <option value="all">{t("invoice.allStatuses")}</option>
          {(["draft", "pending", "partially_paid", "paid", "overdue", "cancelled"] as const).map((s) => (
            <option key={s} value={s}>
              {t(`invoice.status.${s}`)}
            </option>
          ))}
        </select>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        onRowClick={(row) => navigate(`/sales/invoices/${row.id}`)}
        empty={<p className="text-center text-sm text-muted-foreground">{t("common.noResults")}</p>}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{t("sales.newInvoice")}</DialogTitle>
          </DialogHeader>
          <DocumentForm
            mode="invoice"
            submitLabel={t("invoice.create")}
            busy={create.isPending}
            onSubmit={async (v) => {
              await create.mutateAsync(
                await buildInvoiceInput({
                  ...v,
                  ownerId: user?.id,
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
