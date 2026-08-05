import { useMemo, useState } from "react";
import { Building2, Plus, Search, Star } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Supplier } from "@esp/types";
import { supplierHooks } from "@esp/services";
import { Badge, Button, Dialog, DialogContent, DialogHeader, DialogTitle, FormField, Input, Textarea } from "@esp/ui";
import { useI18n } from "@/i18n";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { PageLoader } from "@/components/PageHeader";

const schema = z.object({
  code: z.string().min(2),
  name: z.string().min(2),
  nameAr: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  taxNumber: z.string().optional(),
  paymentTerms: z.string().optional(),
  address: z.string().optional(),
  rating: z.coerce.number().min(0).max(5).default(3),
  active: z.boolean().default(true),
});

type Values = z.infer<typeof schema>;

function SupplierForm({ onSubmit, busy }: { onSubmit: (v: Values) => Promise<void> | void; busy?: boolean }) {
  const { t } = useI18n();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.input<typeof schema>, any, z.output<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { code: "", name: "", rating: 3, active: true, email: "", phone: "", taxNumber: "", paymentTerms: "net_30", address: "" },
  });

  return (
    <form onSubmit={handleSubmit((v) => void onSubmit(v))} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <FormField label="Code" required error={errors.code?.message}>
        <Input dir="ltr" {...register("code")} />
      </FormField>
      <FormField label={t("common.name")} required error={errors.name?.message}>
        <Input {...register("name")} autoFocus />
      </FormField>
      <FormField label={`${t("common.name")} (عربي)`}>
        <Input {...register("nameAr")} />
      </FormField>
      <FormField label={t("common.email")} error={errors.email?.message}>
        <Input type="email" dir="ltr" {...register("email")} />
      </FormField>
      <FormField label={t("common.phone")}>
        <Input dir="ltr" {...register("phone")} />
      </FormField>
      <FormField label="VAT">
        <Input dir="ltr" {...register("taxNumber")} />
      </FormField>
      <FormField label={t("supplier.paymentTerms")}>
        <Input {...register("paymentTerms")} />
      </FormField>
      <FormField label={t("supplier.rating")}>
        <Input type="number" min={0} max={5} step={0.5} {...register("rating")} />
      </FormField>
      <FormField label={t("common.address")} className="sm:col-span-2">
        <Textarea {...register("address")} />
      </FormField>
      <div className="sm:col-span-2 flex justify-end">
        <Button type="submit" disabled={busy}>
          {busy ? t("common.loading") : t("common.save")}
        </Button>
      </div>
    </form>
  );
}

export function SuppliersPage() {
  const { t } = useI18n();
  const { data, isLoading } = supplierHooks.useList({ pageSize: 500 });
  const create = supplierHooks.useCreate();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const all = data?.items ?? [];
    const ql = q.trim().toLowerCase();
    if (!ql) return all;
    return all.filter((s) => s.name.toLowerCase().includes(ql) || s.code.toLowerCase().includes(ql) || (s.email ?? "").includes(ql));
  }, [data, q]);

  const columns = useMemo(
    () => [
      {
        id: "name",
        header: t("common.name"),
        cell: ({ row }: { row: { original: Supplier } }) => (
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-info-soft text-info">
              <Building2 className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{row.original.name}</p>
              <p className="truncate text-xs text-muted-foreground">{row.original.nameAr || row.original.code}</p>
            </div>
          </div>
        ),
      },
      {
        id: "rating",
        header: t("supplier.rating"),
        cell: ({ row }: { row: { original: Supplier } }) => (
          <span className="flex items-center gap-1 text-sm">
            <Star className="size-3.5 fill-warning text-warning" />
            <span className="tabular-nums">{row.original.rating}</span>
          </span>
        ),
      },
      {
        id: "phone",
        header: t("common.phone"),
        cell: ({ row }: { row: { original: Supplier } }) => (
          <span className="text-sm text-muted-foreground" dir="ltr">{row.original.phone || "—"}</span>
        ),
      },
      {
        id: "terms",
        header: t("supplier.paymentTerms"),
        cell: ({ row }: { row: { original: Supplier } }) => (
          <Badge variant="outline">{row.original.paymentTerms || "—"}</Badge>
        ),
      },
      {
        id: "status",
        header: t("common.status"),
        cell: ({ row }: { row: { original: Supplier } }) => (
          <Badge variant={row.original.active ? "success" : "neutral"}>
            {row.original.active ? t("common.active") : t("common.inactive")}
          </Badge>
        ),
      },
    ],
    [t],
  );

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <PageHeader
        title={t("nav.suppliers")}
        description={t("purchasing.suppliersDesc")}
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            {t("supplier.new")}
          </Button>
        }
      />
      <div className="relative mb-4 max-w-md">
        <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("common.search")} className="ps-9" />
      </div>
      <DataTable columns={columns} data={filtered} empty={<p className="text-center text-sm text-muted-foreground">{t("common.noResults")}</p>} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("supplier.new")}</DialogTitle>
          </DialogHeader>
          <SupplierForm
            busy={create.isPending}
            onSubmit={async (v) => {
              await create.mutateAsync({
                ...v,
                nameAr: v.nameAr || undefined,
                email: v.email || undefined,
                phone: v.phone || undefined,
                taxNumber: v.taxNumber || undefined,
                paymentTerms: v.paymentTerms || undefined,
                address: v.address || undefined,
              });
              setOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
