import type { Product } from "@esp/types";
import type { ProductFormValues } from "./components/ProductForm";

export function toProductInput(values: ProductFormValues): Omit<Product, "id" | "createdAt" | "updatedAt" | "revision"> {
  return {
    sku: values.sku,
    name: values.name,
    nameAr: values.nameAr || undefined,
    category: values.category || undefined,
    kind: values.kind,
    unit: values.unit,
    cost: { amount: values.cost, currency: "IQD" },
    price: { amount: values.price, currency: "IQD" },
    taxRate: values.taxRate,
    sellable: values.sellable,
    purchasable: values.purchasable,
    trackStock: values.trackStock,
    stock: values.trackStock ? values.stock : 0,
    stockMin: values.trackStock ? values.stockMin : 0,
    reorderPoint: values.trackStock ? values.reorderPoint : 0,
    image: values.image || undefined,
  };
}

export function toProductPatch(values: ProductFormValues): Partial<Product> {
  return {
    sku: values.sku,
    name: values.name,
    nameAr: values.nameAr || undefined,
    category: values.category || undefined,
    kind: values.kind,
    unit: values.unit,
    cost: { amount: values.cost, currency: "IQD" },
    price: { amount: values.price, currency: "IQD" },
    taxRate: values.taxRate,
    sellable: values.sellable,
    purchasable: values.purchasable,
    trackStock: values.trackStock,
    stock: values.trackStock ? values.stock : 0,
    stockMin: values.trackStock ? values.stockMin : 0,
    reorderPoint: values.trackStock ? values.reorderPoint : 0,
    image: values.image || undefined,
  };
}
