import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { cn } from "@esp/utils";
import type { Product } from "@esp/types";
import { productHooks } from "@esp/services";
import { Badge, Button, Dialog, DialogContent, DialogHeader, DialogTitle, Input } from "@esp/ui";
import { useI18n } from "@/i18n";
import { useFormat } from "@/lib/format";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { PageLoader } from "@/components/PageHeader";
import { ProductForm } from "./components/ProductForm";
import { ProductImage } from "./components/ProductImage";
import { toProductInput } from "./lib";

export function ProductsPage() {
  const { t } = useI18n();
  const { money } = useFormat();
  const navigate = useNavigate();
  const { data, isLoading } = productHooks.useList({ pageSize: 1000 });
  const create = productHooks.useCreate();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<string>("all");

  const filtered = useMemo(() => {
    const rows = data?.items ?? [];
    const ql = q.trim().toLowerCase();
    return rows.filter((p) => {
      if (kind !== "all" && p.kind !== kind) return false;
      if (!ql) return true;
      return (
        p.name.toLowerCase().includes(ql) ||
        (p.nameAr ?? "").includes(ql) ||
        p.sku.toLowerCase().includes(ql) ||
        (p.barcode ?? "").includes(ql) ||
        (p.category ?? "").toLowerCase().includes(ql)
      );
    });
  }, [data, q, kind]);

  const columns = useMemo(
    () => [
      {
        id: "product",
        header: t("common.product"),
        cell: ({ row }: { row: { original: Product } }) => (
          <div className="flex items-center gap-3">
            <ProductImage src={row.original.image} alt={row.original.name} className="size-9" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{row.original.name}</p>
              <p className="truncate text-xs text-muted-foreground" dir="ltr">
                {row.original.sku} · {row.original.category || "—"}
              </p>
            </div>
          </div>
        ),
      },
      {
        id: "kind",
        header: t("product.kind"),
        cell: ({ row }: { row: { original: Product } }) => (
          <Badge variant={row.original.kind === "service" ? "info" : "neutral"}>
            {t(`product.kind.${row.original.kind}`)}
          </Badge>
        ),
      },
      {
        id: "price",
        header: t("product.price"),
        cell: ({ row }: { row: { original: Product } }) => (
          <span className="text-sm font-semibold tabular-nums">{money(row.original.price.amount)}</span>
        ),
      },
      {
        id: "stock",
        header: t("product.stock"),
        cell: ({ row }: { row: { original: Product } }) => {
          const p = row.original;
          const low = p.trackStock && p.stock <= p.stockMin;
          return (
            <span
              className={cn(
                "text-sm font-medium tabular-nums",
                !p.trackStock ? "text-muted-foreground" : low ? "text-danger" : "text-success",
              )}
            >
              {p.trackStock ? `${p.stock} ${p.unit}` : "—"}
            </span>
          );
        },
      },
      {
        id: "status",
        header: t("invoice.status"),
        cell: ({ row }: { row: { original: Product } }) => {
          const p = row.original;
          if (!p.trackStock) return <Badge variant="neutral">—</Badge>;
          if (p.stock <= p.stockMin) return <Badge variant="danger">{t("product.outOfStock")}</Badge>;
          if (p.stock <= p.reorderPoint) return <Badge variant="warning">{t("product.lowStock")}</Badge>;
          return <Badge variant="success">{t("product.inStock")}</Badge>;
        },
      },
    ],
    [t, money],
  );

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <PageHeader
        title={t("nav.products")}
        description={t("inventory.productsDesc")}
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            {t("product.new")}
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("common.search")} className="ps-9" />
        </div>
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value)}
          className="h-9 w-full appearance-none rounded-lg border border-border bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring sm:w-44"
        >
          <option value="all">{t("product.allKinds")}</option>
          <option value="product">{t("product.kind.product")}</option>
          <option value="service">{t("product.kind.service")}</option>
          <option value="bundle">{t("product.kind.bundle")}</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        onRowClick={(row) => navigate(`/inventory/products/${row.id}`)}
        empty={<p className="text-center text-sm text-muted-foreground">{t("common.noResults")}</p>}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("product.new")}</DialogTitle>
          </DialogHeader>
          <ProductForm
            busy={create.isPending}
            onSubmit={async (v) => {
              await create.mutateAsync(toProductInput(v));
              setOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
