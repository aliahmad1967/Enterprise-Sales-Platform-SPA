import { useMemo, useState } from "react";
import { Minus, Plus, Search, ShoppingCart, Trash2 } from "lucide-react";
import { buildTotals, customerHooks, invoiceHooks, productHooks } from "@esp/services";
import type { DocumentLine, PaymentMethod } from "@esp/types";
import { useI18n } from "@/i18n";
import { useAuthStore } from "@/state/auth";
import { useFormat } from "@/lib/format";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Select, Separator } from "@esp/ui";
import { PageLoader } from "@/components/PageHeader";
import { ProductImage } from "@/modules/inventory/components/ProductImage";
import { buildInvoiceInput } from "@/modules/sales/lib";

export function PosPage() {
  const { t } = useI18n();
  const { money } = useFormat();
  const user = useAuthStore((s) => s.user);
  const products = productHooks.useList({ pageSize: 1000 });
  const customers = customerHooks.useList({ pageSize: 500 });
  const invoices = invoiceHooks.useList({ pageSize: 1000 });
  const create = invoiceHooks.useCreate();
  const [q, setQ] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [cart, setCart] = useState<DocumentLine[]>([]);

  const productList = useMemo(() => {
    const all = products.data?.items ?? [];
    const ql = q.trim().toLowerCase();
    return all.filter(
      (p) =>
        p.sellable &&
        (!ql || p.name.toLowerCase().includes(ql) || p.sku.toLowerCase().includes(ql) || (p.barcode ?? "").includes(ql)),
    );
  }, [products.data, q]);

  const addToCart = (productId: string) => {
    const p = products.data?.items.find((x) => x.id === productId);
    if (!p) return;
    setCart((prev) => {
      const existing = prev.find((l) => l.productId === productId);
      if (existing)
        return prev.map((l) =>
          l.productId === productId ? { ...l, qty: Math.min(p.trackStock ? p.stock : 9999, l.qty + 1) } : l,
        );
      return [
        ...prev,
        {
          id: crypto.randomUUID(),
          productId: p.id,
          sku: p.sku,
          name: p.name,
          nameAr: p.nameAr,
          qty: 1,
          unitPrice: p.price.amount,
          discountPct: 0,
          taxRate: p.taxRate,
        },
      ];
    });
  };

  const setQty = (id: string, qty: number) =>
    setCart((prev) => prev.map((l) => (l.id === id ? { ...l, qty: Math.max(0, qty) } : l)).filter((l) => l.qty > 0));

  const totals = useMemo(() => buildTotals(cart, 0, "IQD"), [cart]);
  const customer = customers.data?.items.find((c) => c.id === customerId);
  const subtotal = cart.reduce((a, l) => a + l.qty * l.unitPrice * (1 - l.discountPct / 100), 0);

  if (products.isLoading) return <PageLoader />;

  return (
    <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-[1fr_380px]">
      <div className="flex min-h-0 flex-col gap-3">
        <div className="relative">
          <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`${t("common.search")} (${productList.length})`} className="ps-9" />
        </div>
        <div className="grid flex-1 grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3 xl:grid-cols-4">
          {productList.map((p) => (
            <button
              key={p.id}
              onClick={() => addToCart(p.id)}
              disabled={p.trackStock && p.stock <= 0}
              className="flex flex-col items-start gap-1 rounded-xl border border-border bg-surface p-3 text-start transition-colors hover:border-primary hover:shadow-sm disabled:opacity-40"
            >
              <ProductImage src={p.image} alt={p.name} className="size-14" />
              <span className="line-clamp-2 min-h-10 w-full text-sm font-medium text-foreground">{p.name}</span>
              <span className="w-full text-end text-xs text-muted-foreground">
                {p.trackStock ? `${p.stock} ${p.unit}` : "—"}
              </span>
            </button>
          ))}
        </div>
      </div>

      <Card className="flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="size-5 text-primary" />
            {t("pos.cart")} ({cart.reduce((a, l) => a + l.qty, 0)})
          </CardTitle>
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 flex-col">
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="mb-3 h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">{t("pos.selectCustomer")}</option>
            {(customers.data?.items ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <div className="flex-1 space-y-2 overflow-y-auto">
            {cart.map((l) => (
              <div key={l.id} className="flex items-center gap-2 rounded-lg border border-border p-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{l.name}</p>
                  <p className="text-xs text-muted-foreground">{money(l.unitPrice)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setQty(l.id, l.qty - 1)} className="rounded-md border border-border p-1 text-muted-foreground hover:text-foreground">
                    <Minus className="size-3.5" />
                  </button>
                  <input
                    type="number"
                    value={l.qty}
                    onChange={(e) => setQty(l.id, Number(e.target.value))}
                    className="h-8 w-12 rounded-md border border-border bg-surface text-center text-sm tabular-nums"
                  />
                  <button onClick={() => setQty(l.id, l.qty + 1)} className="rounded-md border border-border p-1 text-muted-foreground hover:text-foreground">
                    <Plus className="size-3.5" />
                  </button>
                </div>
                <button onClick={() => setQty(l.id, 0)} className="text-muted-foreground hover:text-danger">
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
            {cart.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">{t("pos.empty")}</p>
            ) : null}
          </div>

          <Separator className="my-3" />

          <Select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
            {(["cash", "card", "bank_transfer", "cheque", "digital_wallet"] as const).map((m) => (
              <option key={m} value={m}>
                {t(`invoice.method.${m}`)}
              </option>
            ))}
          </Select>

          <dl className="mt-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{t("invoice.subtotal")}</dt>
              <dd className="tabular-nums">{money(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{t("invoice.vat")}</dt>
              <dd className="tabular-nums">{money(totals.tax)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-1 text-base">
              <dt className="font-semibold text-foreground">{t("invoice.total")}</dt>
              <dd className="font-bold tabular-nums text-primary">{money(totals.total)}</dd>
            </div>
          </dl>

          <Button
            className="mt-3 w-full"
            size="lg"
            disabled={cart.length === 0 || !customerId || create.isPending}
            onClick={async () => {
              if (!customer || !user) return;
              await create.mutateAsync(
                await buildInvoiceInput({
                  customerId: customer.id,
                  customerName: customer.name,
                  branchId: user.branchIds[0] ?? "",
                  paymentMethod: method,
                  issueDate: new Date().toISOString().slice(0, 10),
                  dueDate: new Date().toISOString().slice(0, 10),
                  lines: cart,
                  totals,
                  ownerId: user.id,
                  existing: invoices.data?.items ?? [],
                }),
              );
              setCart([]);
            }}
          >
            {t("pos.checkout")} · {money(totals.total)}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
