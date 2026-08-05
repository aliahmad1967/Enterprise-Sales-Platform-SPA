import { useRef } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Product } from "@esp/types";
import { Button, FormField, Input, Select, Switch } from "@esp/ui";
import { useI18n } from "@/i18n";

const schema = z.object({
  sku: z.string().min(2),
  name: z.string().min(2),
  nameAr: z.string().optional(),
  category: z.string().optional(),
  kind: z.enum(["product", "service", "bundle"]),
  unit: z.string().min(1),
  cost: z.coerce.number().min(0).default(0),
  price: z.coerce.number().min(0).default(0),
  taxRate: z.coerce.number().min(0).max(100).default(15),
  stock: z.coerce.number().min(0).default(0),
  stockMin: z.coerce.number().min(0).default(0),
  reorderPoint: z.coerce.number().min(0).default(0),
  trackStock: z.boolean().default(true),
  sellable: z.boolean().default(true),
  purchasable: z.boolean().default(true),
  image: z.string().optional(),
});

export type ProductFormValues = z.infer<typeof schema>;

export function ProductForm({
  initial,
  onSubmit,
  busy,
}: {
  initial?: Product;
  onSubmit: (values: ProductFormValues) => Promise<void> | void;
  busy?: boolean;
}) {
  const { t } = useI18n();
  const fileRef = useRef<HTMLInputElement>(null);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<z.input<typeof schema>, any, ProductFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      sku: initial?.sku ?? "",
      name: initial?.name ?? "",
      nameAr: initial?.nameAr ?? "",
      category: initial?.category ?? "",
      kind: initial?.kind ?? "product",
      unit: initial?.unit ?? "pcs",
      cost: initial?.cost.amount ?? 0,
      price: initial?.price.amount ?? 0,
      taxRate: initial?.taxRate ?? 15,
      stock: initial?.stock ?? 0,
      stockMin: initial?.stockMin ?? 0,
      reorderPoint: initial?.reorderPoint ?? 0,
      trackStock: initial?.trackStock ?? true,
      sellable: initial?.sellable ?? true,
      purchasable: initial?.purchasable ?? true,
      image: initial?.image ?? "",
    },
  });

  const image = watch("image");

  function onPickFile(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setValue("image", String(reader.result ?? ""));
    reader.readAsDataURL(file);
  }

  return (
    <form onSubmit={handleSubmit((values) => void onSubmit(values))} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <FormField label={t("product.image")} className="sm:col-span-2">
        <div className="flex items-center gap-3">
          {image ? (
            <img src={image} alt={t("product.image")} className="size-20 rounded-lg border border-border bg-surface object-cover" />
          ) : (
            <span className="flex size-20 items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 text-muted-foreground">
              <ImagePlus className="size-6" />
            </span>
          )}
          <div className="space-y-2">
            <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
              <ImagePlus className="size-4" />
              {image ? t("product.imageChange") : t("product.imageUpload")}
            </Button>
            {image ? (
              <Button type="button" variant="ghost" size="sm" className="text-danger" onClick={() => setValue("image", "")}>
                <Trash2 className="size-4" />
                {t("product.imageRemove")}
              </Button>
            ) : null}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onPickFile(e.target.files?.[0])}
            />
          </div>
        </div>
      </FormField>
      <FormField label="SKU" required error={errors.sku?.message}>
        <Input dir="ltr" {...register("sku")} />
      </FormField>
      <FormField label={t("common.name")} required error={errors.name?.message}>
        <Input {...register("name")} autoFocus />
      </FormField>
      <FormField label={`${t("common.name")} (عربي)`}>
        <Input {...register("nameAr")} />
      </FormField>
      <FormField label="Category">
        <Input {...register("category")} placeholder="Retail / Wholesale…" />
      </FormField>
      <FormField label={t("product.kind")}>
        <Select {...register("kind")}>
          <option value="product">{t("product.kind.product")}</option>
          <option value="service">{t("product.kind.service")}</option>
          <option value="bundle">{t("product.kind.bundle")}</option>
        </Select>
      </FormField>
      <FormField label={t("product.unit")}>
        <Select {...register("unit")}>
          <option value="pcs">pcs</option>
          <option value="box">box</option>
          <option value="kg">kg</option>
          <option value="m">m</option>
          <option value="hr">hr</option>
        </Select>
      </FormField>
      <FormField label={`${t("product.cost")} (IQD)`}>
        <Input type="number" min={0} step="any" {...register("cost")} />
      </FormField>
      <FormField label={`${t("product.price")} (IQD)`}>
        <Input type="number" min={0} step="any" {...register("price")} />
      </FormField>
      <FormField label="VAT %">
        <Input type="number" min={0} max={100} {...register("taxRate")} />
      </FormField>
      <FormField label={t("product.stock")}>
        <Input type="number" min={0} {...register("stock")} disabled={!watch("trackStock")} />
      </FormField>
      <FormField label={t("product.stockMin")}>
        <Input type="number" min={0} {...register("stockMin")} disabled={!watch("trackStock")} />
      </FormField>
      <FormField label={t("product.reorderPoint")}>
        <Input type="number" min={0} {...register("reorderPoint")} disabled={!watch("trackStock")} />
      </FormField>
      <FormField label={t("product.trackStock")}>
        <Switch checked={watch("trackStock")} onCheckedChange={(v) => setValue("trackStock", v)} />
      </FormField>
      <FormField label={t("product.sellable")}>
        <Switch checked={watch("sellable")} onCheckedChange={(v) => setValue("sellable", v)} />
      </FormField>
      <FormField label={t("product.purchasable")}>
        <Switch checked={watch("purchasable")} onCheckedChange={(v) => setValue("purchasable", v)} />
      </FormField>
      <div className="sm:col-span-2 flex justify-end gap-2">
        <Button type="submit" disabled={busy}>
          {busy ? t("common.loading") : t("common.save")}
        </Button>
      </div>
    </form>
  );
}
