import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil } from "lucide-react";
import { cn } from "@esp/utils";
import { productHooks, stockItemHooks } from "@esp/services";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Dialog, DialogContent, DialogHeader, DialogTitle, Progress, Separator } from "@esp/ui";
import { useI18n } from "@/i18n";
import { useFormat } from "@/lib/format";
import { PageHeader } from "@/components/PageHeader";
import { ErrorState, PageLoader } from "@/components/PageHeader";
import { Stats } from "@/components/Stats";
import { ProductForm } from "./components/ProductForm";
import { ProductImage } from "./components/ProductImage";
import { toProductPatch } from "./lib";

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useI18n();
  const { money } = useFormat();
  const navigate = useNavigate();
  const { data, isLoading, isError } = productHooks.useGet(id ?? "");
  const update = productHooks.useUpdate();
  const stock = stockItemHooks.useList();
  const [editing, setEditing] = useState(false);

  const stockByWarehouse = useMemo(() => stock.data?.items ?? [], [stock.data]);

  if (isLoading) return <PageLoader />;
  if (isError || !data) return <ErrorState message={t("toast.error")} onRetry={() => navigate("/inventory/products")} />;

  const margin = data.price.amount > 0 ? Math.round(((data.price.amount - data.cost.amount) / data.price.amount) * 100) : 0;
  const status =
    !data.trackStock ? { label: "—", tone: "neutral" as const } :
    data.stock <= data.stockMin ? { label: t("product.outOfStock"), tone: "danger" as const } :
    data.stock <= data.reorderPoint ? { label: t("product.lowStock"), tone: "warning" as const } :
    { label: t("product.inStock"), tone: "success" as const };

  const stats = [
    { label: t("product.price"), value: money(data.price.amount), tone: "primary" as const },
    { label: t("product.cost"), value: money(data.cost.amount), tone: "info" as const },
    { label: `${t("product.margin")}`, value: `${margin}%`, tone: margin >= 30 ? ("success" as const) : ("warning" as const) },
    { label: t("product.stock"), value: data.trackStock ? `${data.stock} ${data.unit}` : "—", tone: "warning" as const },
  ];

  return (
    <div>
      <PageHeader
        title={data.name}
        description={`${data.sku} · ${data.category ?? ""}`}
        actions={
          <>
            <Button variant="outline" onClick={() => setEditing(true)}>
              <Pencil className="size-4" />
              {t("common.edit")}
            </Button>
            <Button variant="ghost" onClick={() => navigate("/inventory/products")}>
              <ArrowLeft className="size-4" />
              {t("common.back")}
            </Button>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {data.image ? (
          <ProductImage src={data.image} alt={data.name} className="size-24" />
        ) : null}
        <Badge variant={status.tone}>{status.label}</Badge>
        <Badge variant="outline">{t(`product.kind.${data.kind}`)}</Badge>
        {data.barcode ? <Badge variant="outline" dir="ltr">{data.barcode}</Badge> : null}
        <Badge variant="outline">VAT {data.taxRate}%</Badge>
      </div>

      <Stats items={stats} />

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("inventory.stockByWarehouse")}</CardTitle>
          </CardHeader>
          <CardContent>
            {data.trackStock ? (
              <div className="space-y-4">
                {stockByWarehouse.length ? (
                  stockByWarehouse.map((s) => (
                    <div key={s.id}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">{s.warehouseId.slice(0, 8)}</span>
                        <span className="tabular-nums text-muted-foreground">{s.qty} {data.unit}</span>
                      </div>
                      <Progress value={Math.min(100, data.stock > 0 ? (s.qty / data.stock) * 100 : 0)} className="h-2" />
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">{t("inventory.noStock")}</p>
                )}
                <div className="flex items-center justify-between rounded-lg bg-muted/40 p-3 text-sm">
                  <span className="font-medium text-foreground">{t("inventory.totalStock")}</span>
                  <span className={cn("font-bold tabular-nums", data.stock <= data.stockMin ? "text-danger" : "text-success")}>
                    {data.stock} {data.unit}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t("inventory.notTracked")}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("common.details")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{t("product.stockMin")}</dt>
                <dd className="tabular-nums">{data.stockMin} {data.unit}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{t("product.reorderPoint")}</dt>
                <dd className="tabular-nums">{data.reorderPoint} {data.unit}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{t("product.sellable")}</dt>
                <dd>{data.sellable ? "✓" : "✕"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{t("product.purchasable")}</dt>
                <dd>{data.purchasable ? "✓" : "✕"}</dd>
              </div>
            </dl>
            <Separator />
            {data.description ? <p className="text-muted-foreground">{data.description}</p> : null}
          </CardContent>
        </Card>
      </div>

      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("common.edit")}</DialogTitle>
          </DialogHeader>
          <ProductForm
            initial={data}
            busy={update.isPending}
            onSubmit={async (v) => {
              await update.mutateAsync({ id: data.id, patch: toProductPatch(v) });
              setEditing(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
