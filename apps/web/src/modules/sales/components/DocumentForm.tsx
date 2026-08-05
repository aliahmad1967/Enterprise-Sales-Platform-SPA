import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { buildTotals, customerHooks, branchHooks, productHooks } from "@esp/services";
import type { DocumentLine, PaymentMethod, Product } from "@esp/types";
import { Button, FormField, Input, Select } from "@esp/ui";
import { useI18n } from "@/i18n";
import { useFormat } from "@/lib/format";
import { linePlaceholder } from "../lib";

export type DocumentMode = "invoice" | "order" | "quotation";

export interface DocumentFormValues {
  customerId: string;
  customerName: string;
  branchId: string;
  paymentMethod: PaymentMethod;
  issueDate: string;
  dueDate: string;
  deliveryDate?: string;
  validUntil?: string;
  notes?: string;
  lines: DocumentLine[];
}

export function DocumentForm({
  mode,
  onSubmit,
  busy,
  submitLabel,
}: {
  mode: DocumentMode;
  onSubmit: (values: DocumentFormValues) => Promise<void> | void;
  busy?: boolean;
  submitLabel?: string;
}) {
  const { t } = useI18n();
  const { money } = useFormat();
  const customers = customerHooks.useList({ pageSize: 500 });
  const branches = branchHooks.useList({ pageSize: 50 });
  const products = productHooks.useList({ pageSize: 500 });

  const [customerId, setCustomerId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bank_transfer");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 15 * 864e5).toISOString().slice(0, 10));
  const [deliveryDate, setDeliveryDate] = useState("");
  const [validUntil, setValidUntil] = useState(new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<DocumentLine[]>([linePlaceholder()]);

  const productMap = useMemo(() => {
    const map = new Map<string, Product>();
    for (const p of products.data?.items ?? []) map.set(p.id, p);
    return map;
  }, [products.data]);

  const customer = customers.data?.items.find((c) => c.id === customerId);
  const totals = useMemo(() => buildTotals(lines, 0, "IQD"), [lines]);

  useEffect(() => {
    if (!branchId && branches.data?.items.length) setBranchId(branches.data.items[0]!.id);
  }, [branchId, branches.data]);

  const patchLine = (id: string, patch: Partial<DocumentLine>) =>
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));

  const onPickProduct = (lineId: string, productId: string) => {
    const p = productMap.get(productId);
    if (!p) return;
    setLines((prev) =>
      prev.map((l) =>
        l.id === lineId
          ? { ...l, productId, sku: p.sku, name: p.name, nameAr: p.nameAr, unitPrice: p.price.amount, taxRate: p.taxRate }
          : l,
      ),
    );
  };

  const ready =
    customerId &&
    branchId &&
    lines.length > 0 &&
    lines.every((l) => l.productId && l.qty > 0 && l.unitPrice > 0);

  const dateFields = (() => {
    if (mode === "invoice")
      return (
        <>
          <FormField label={t("invoice.issueDate")}>
            <Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
          </FormField>
          <FormField label={t("invoice.dueDate")}>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </FormField>
        </>
      );
    if (mode === "order")
      return (
        <>
          <FormField label={t("order.issueDate")}>
            <Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
          </FormField>
          <FormField label={t("order.deliveryDate")}>
            <Input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} />
          </FormField>
        </>
      );
    return (
      <>
        <FormField label={t("quotation.issueDate")}>
          <Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
        </FormField>
        <FormField label={t("quotation.validUntil")}>
          <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
        </FormField>
      </>
    );
  })();

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!ready || !customer) return;
        void onSubmit({
          customerId,
          customerName: customer.name,
          branchId,
          paymentMethod,
          issueDate,
          dueDate,
          deliveryDate: deliveryDate || undefined,
          validUntil: validUntil || undefined,
          notes: notes || undefined,
          lines: lines.map((l) => ({ ...l })),
        });
      }}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label={t("customer.customer")} required>
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">{t("common.select")}</option>
            {(customers.data?.items ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label={t("common.branch")} required>
          <select
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            className="h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {(branches.data?.items ?? []).map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label={t("invoice.paymentMethod")}>
          <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}>
            {(["cash", "card", "bank_transfer", "cheque", "installment", "credit_line", "digital_wallet"] as const).map((m) => (
              <option key={m} value={m}>
                {t(`invoice.method.${m}`)}
              </option>
            ))}
          </Select>
        </FormField>
        <div className="grid grid-cols-2 gap-3">{dateFields}</div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-start font-medium">{t("common.product")}</th>
              <th className="w-20 px-2 py-2 text-center font-medium">{t("common.qty")}</th>
              <th className="w-28 px-2 py-2 text-end font-medium">{t("invoice.price")}</th>
              <th className="w-20 px-2 py-2 text-center font-medium">%</th>
              <th className="w-28 px-2 py-2 text-end font-medium">{t("invoice.amount")}</th>
              <th className="w-10 px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {lines.map((l) => (
              <tr key={l.id} className="border-t border-border">
                <td className="px-3 py-2">
                  <select
                    value={l.productId}
                    onChange={(e) => onPickProduct(l.id, e.target.value)}
                    className="h-8 w-full rounded-md border border-border bg-surface px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="">{t("common.select")}</option>
                    {(products.data?.items ?? []).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {p.sku}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-2 py-2">
                  <Input
                    type="number"
                    min={0.001}
                    step="any"
                    value={l.qty}
                    className="h-8 px-2 text-center"
                    onChange={(e) => patchLine(l.id, { qty: Number(e.target.value) })}
                  />
                </td>
                <td className="px-2 py-2">
                  <Input
                    type="number"
                    min={0}
                    step="any"
                    value={l.unitPrice}
                    className="h-8 px-2 text-end"
                    onChange={(e) => patchLine(l.id, { unitPrice: Number(e.target.value) })}
                  />
                </td>
                <td className="px-2 py-2">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={l.discountPct}
                    className="h-8 px-2 text-center"
                    onChange={(e) => patchLine(l.id, { discountPct: Number(e.target.value) })}
                  />
                </td>
                <td className="px-2 py-2 text-end font-semibold tabular-nums text-foreground">
                  {money(l.qty * l.unitPrice * (1 - l.discountPct / 100))}
                </td>
                <td className="px-2 py-2 text-center">
                  <button
                    type="button"
                    onClick={() => setLines((prev) => (prev.length > 1 ? prev.filter((x) => x.id !== l.id) : prev))}
                    className="text-muted-foreground transition-colors hover:text-danger"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t border-border bg-muted/30 p-2">
          <Button type="button" variant="ghost" size="sm" onClick={() => setLines((prev) => [...prev, linePlaceholder()])}>
            <Plus className="size-4" />
            {t("invoice.addLine")}
          </Button>
        </div>
      </div>

      <div className="flex items-start justify-between gap-4 rounded-lg border border-border bg-muted/30 p-4">
        <div className="text-xs text-muted-foreground">{t("invoice.lineTaxes")}</div>
        <dl className="space-y-1 text-sm">
          <div className="flex justify-between gap-8">
            <dt className="text-muted-foreground">{t("invoice.subtotal")}</dt>
            <dd className="tabular-nums">{money(totals.subtotal)}</dd>
          </div>
          <div className="flex justify-between gap-8">
            <dt className="text-muted-foreground">{t("invoice.vat")}</dt>
            <dd className="tabular-nums">{money(totals.tax)}</dd>
          </div>
          <div className="flex justify-between gap-8 border-t border-border pt-1">
            <dt className="font-semibold text-foreground">{t("invoice.total")}</dt>
            <dd className="font-bold tabular-nums text-primary">{money(totals.total)}</dd>
          </div>
        </dl>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={!ready || busy}>
          {busy ? t("common.loading") : submitLabel ?? t("common.save")}
        </Button>
      </div>
    </form>
  );
}
