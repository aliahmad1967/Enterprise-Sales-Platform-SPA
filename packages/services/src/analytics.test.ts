import type { Invoice, Payment, SalesOrder } from "@esp/types";
import { describe, expect, it } from "vitest";
import { computeDashboard } from "../src/analytics";
import { buildTotals } from "../src/documents";

const now = new Date();
const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
const iso = (d: Date) => d.toISOString();

function line(qty: number, unitPrice: number, cost: number, discountPct = 0) {
  return { id: `l${unitPrice}`, productId: "p1", sku: "P1", name: "Prod", qty, unitPrice, discountPct, taxRate: 15, cost };
}

function invoice(overrides: Partial<Invoice> & { issueDate: string; status: Invoice["status"] }): Invoice {
  const lines = overrides.lines ?? [line(1, 100, 60)];
  const totals = overrides.totals ?? buildTotals(lines, 0);
  return {
    id: overrides.id ?? "i",
    code: "INV-1",
    customerId: "c",
    customerName: "Cust",
    branchId: "b1",
    status: overrides.status,
    issueDate: overrides.issueDate,
    dueDate: overrides.issueDate,
    lines,
    totals,
    paymentMethod: "cash",
    installmentCount: 0,
    installments: [],
    paidAmount: 0,
    createdAt: overrides.issueDate,
    updatedAt: overrides.issueDate,
    revision: 1,
  };
}

function base() {
  const payments: Payment[] = [];
  const orders: SalesOrder[] = [];
  return {
    invoices: [] as Invoice[],
    payments,
    orders,
    customers: [
      { id: "c1", code: "C1", name: "A", tier: "gold" as const, creditLimit: { amount: 0, currency: "IQD" }, balance: { amount: 0, currency: "IQD" }, totalRevenue: { amount: 0, currency: "IQD" }, totalInvoices: 0, since: iso(new Date()), createdAt: iso(monthStart), updatedAt: iso(monthStart), revision: 1, tags: [], addresses: [] },
    ],
    leads: [
      { id: "l1", code: "L1", name: "Lead", stage: "negotiation" as const, source: "referral" as const, value: { amount: 0, currency: "IQD" }, probability: 50, ownerId: "u1", tags: [], createdAt: iso(monthStart), updatedAt: iso(monthStart), revision: 1 },
    ],
    products: [
      { id: "p1", sku: "P1", name: "Prod", category: "Electronics", kind: "product" as const, unit: "pc", cost: { amount: 60, currency: "IQD" }, price: { amount: 100, currency: "IQD" }, taxRate: 15, sellable: true, purchasable: true, trackStock: true, stock: 50, stockMin: 10, reorderPoint: 5, createdAt: iso(monthStart), updatedAt: iso(monthStart), revision: 1 },
    ],
    stockItems: [
      { id: "s1", productId: "p1", warehouseId: "w", qty: 10, createdAt: "", updatedAt: "", revision: 1 },
    ],
    branches: [{ id: "b1", code: "B1", name: "Riyadh", active: true, currency: "IQD", createdAt: "", updatedAt: "", revision: 1 }],
    users: [{ id: "u1", username: "u", name: "Sara", email: "s@x.com", roleId: "r", roleName: "Sales", branchIds: [], active: true, createdAt: "", updatedAt: "", revision: 1 }],
    creditNotes: [],
  };
}

describe("computeDashboard", () => {
  it("computes monthly revenue, profit, invoices and change pct", () => {
    const input = base();
    const d1 = iso(monthStart);
    input.invoices.push(invoice({ id: "i1", issueDate: d1, status: "paid" }));
    input.invoices.push(invoice({ id: "i2", issueDate: d1, status: "paid" }));
    const data = computeDashboard(input);
    expect(data.kpis.invoicesThisMonth).toBe(2);
    // 2 x total(100 + 15% tax) = 230
    expect(data.kpis.revenueThisMonth.amount).toBe(230);
    // 2 x profit(100 - 60) = 80
    expect(data.kpis.profitThisMonth.amount).toBe(80);
  });

  it("excludes draft and cancelled from revenue", () => {
    const input = base();
    const d1 = iso(monthStart);
    input.invoices.push(invoice({ id: "i1", issueDate: d1, status: "draft" }));
    input.invoices.push(invoice({ id: "i2", issueDate: d1, status: "cancelled" }));
    const data = computeDashboard(input);
    expect(data.kpis.revenueThisMonth.amount).toBe(0);
  });

  it("computes overdue outstanding", () => {
    const input = base();
    const inv = invoice({ id: "i1", issueDate: iso(monthStart), status: "overdue" });
    inv.paidAmount = 40;
    input.invoices.push(inv);
    const data = computeDashboard(input);
    expect(data.kpis.overduePayments.amount).toBe(75);
  });

  it("builds 6-month trend and current month is last", () => {
    const input = base();
    input.invoices.push(invoice({ id: "i1", issueDate: iso(monthStart), status: "paid" }));
    const data = computeDashboard(input);
    expect(data.trend).toHaveLength(6);
    const last = data.trend[data.trend.length - 1]!;
    expect(last.month).toBe(now.getUTCMonth());
    expect(last.revenue).toBe(115);
  });

  it("aggregates by category and top products", () => {
    const input = base();
    const d1 = iso(monthStart);
    input.invoices.push(invoice({ id: "i1", issueDate: d1, status: "paid" }));
    input.invoices.push(invoice({ id: "i2", issueDate: d1, status: "paid", lines: [line(2, 50, 20)], totals: buildTotals([line(2, 50, 20)]) }));
    const data = computeDashboard(input);
    expect(data.byCategory[0]?.category).toBe("Electronics");
    expect(data.byCategory[0]?.revenue).toBe(230);
    expect(data.topProducts[0]?.units).toBe(3);
  });

  it("computes branch performance and goals", () => {
    const input = base();
    input.invoices.push(invoice({ id: "i1", issueDate: iso(monthStart), status: "paid" }));
    const data = computeDashboard(input);
    expect(data.branchPerformance[0]?.name).toBe("Riyadh");
    expect(data.branchPerformance[0]?.invoices).toBe(1);
    expect(data.goalProgress.find((g) => g.label === "revenue")?.current).toBe(115);
    expect(data.goalProgress.find((g) => g.label === "customers")?.current).toBe(1);
  });
});

describe("buildTotals", () => {
  it("computes subtotal, tax, total with discount", () => {
    const totals = buildTotals([{ qty: 2, unitPrice: 100, discountPct: 10, taxRate: 15 }]);
    expect(totals.subtotal).toBe(180);
    expect(totals.tax).toBe(27);
    expect(totals.total).toBe(207);
  });
});
