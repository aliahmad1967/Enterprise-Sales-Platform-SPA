import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Filter, Mail, MapPin, Phone, Plus, Search, UserPlus } from "lucide-react";
import { cn } from "@esp/utils";
import type { Customer } from "@esp/types";
import { customerHooks, useGlobalSearch } from "@esp/services";
import { Badge, Button, Dialog, DialogContent, DialogHeader, DialogTitle, Input } from "@esp/ui";
import { useI18n } from "@/i18n";
import { useFormat } from "@/lib/format";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { PageLoader } from "@/components/PageHeader";
import { CustomerForm } from "./components/CustomerForm";
import { toCustomerInput } from "./lib";

export function CustomersPage() {
  const { t } = useI18n();
  const { money } = useFormat();
  const navigate = useNavigate();
  const { data, isLoading } = customerHooks.useList();
  const create = customerHooks.useCreate();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [tier, setTier] = useState<string>("all");

  const filtered = useMemo(() => {
    const rows = data?.items ?? [];
    const ql = q.trim().toLowerCase();
    return rows.filter((c) => {
      if (tier !== "all" && c.tier !== tier) return false;
      if (!ql) return true;
      return (
        c.name.toLowerCase().includes(ql) ||
        (c.nameAr ?? "").includes(ql) ||
        (c.email ?? "").toLowerCase().includes(ql) ||
        (c.phone ?? "").includes(ql)
      );
    });
  }, [data, q, tier]);

  const columns = useMemo(
    () => [
      {
        id: "name",
        header: t("common.name"),
        cell: ({ row }: { row: { original: Customer } }) => {
          const c = row.original;
          return (
            <div className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary">
                {c.name.charAt(0)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{c.name}</p>
                <p className="truncate text-xs text-muted-foreground">{c.nameAr || c.email || c.phone}</p>
              </div>
            </div>
          );
        },
      },
      {
        id: "tier",
        header: t("customer.tier"),
        cell: ({ row }: { row: { original: Customer } }) => (
          <Badge variant={row.original.tier === "gold" || row.original.tier === "platinum" ? "success" : "neutral"}>
            {t(`customer.tier.${row.original.tier}`)}
          </Badge>
        ),
      },
      {
        id: "contact",
        header: t("common.contact"),
        cell: ({ row }: { row: { original: Customer } }) => (
          <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Phone className="size-3" /> {row.original.phone || "—"}
            </span>
            <span className="flex items-center gap-1.5">
              <Mail className="size-3" /> {row.original.email || "—"}
            </span>
          </div>
        ),
      },
      {
        id: "creditLimit",
        header: t("customer.creditLimit"),
        cell: ({ row }: { row: { original: Customer } }) => (
          <span className="text-sm tabular-nums">{money(row.original.creditLimit.amount)}</span>
        ),
      },
      {
        id: "balance",
        header: t("customer.balance"),
        cell: ({ row }: { row: { original: Customer } }) => (
          <span className={cn("text-sm font-semibold tabular-nums", row.original.balance.amount > 0 ? "text-danger" : "text-success")}>
            {money(row.original.balance.amount)}
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
        title={t("nav.customers")}
        description={t("crm.customersDesc")}
        actions={
          <Button onClick={() => setOpen(true)}>
            <UserPlus className="size-4" />
            {t("customer.new")}
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("common.search")} className="ps-9" />
        </div>
        <div className="relative w-full sm:w-56">
          <Filter className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <select
            value={tier}
            onChange={(e) => setTier(e.target.value)}
            className="h-9 w-full appearance-none rounded-lg border border-border bg-surface px-9 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">{t("customer.allTiers")}</option>
            {(["bronze", "silver", "gold", "platinum"] as const).map((tr) => (
              <option key={tr} value={tr}>
                {t(`customer.tier.${tr}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        onRowClick={(row) => navigate(`/crm/customers/${row.id}`)}
        empty={<p className="text-center text-sm text-muted-foreground">{t("common.noResults")}</p>}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("customer.new")}</DialogTitle>
          </DialogHeader>
          <CustomerForm
            onSubmit={async (v) => {
              await create.mutateAsync(toCustomerInput(v));
              setOpen(false);
            }}
            busy={create.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
