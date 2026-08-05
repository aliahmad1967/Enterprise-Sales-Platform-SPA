import type {
  Branch,
  Customer,
  CreditNote,
  DashboardData,
  Invoice,
  Lead,
  Payment,
  Product,
  SalesOrder,
  StockItem,
  User,
} from "@esp/types";
import { sumBy } from "@esp/utils";

export interface AnalyticsInput {
  invoices: Invoice[];
  payments: Payment[];
  orders: SalesOrder[];
  customers: Customer[];
  leads: Lead[];
  products: Product[];
  stockItems: StockItem[];
  branches: Branch[];
  users: User[];
  creditNotes: CreditNote[];
}

export const MONTHLY_REVENUE_TARGET = 2_400_000;

const ACTIVE_STATUSES = new Set(["draft", "pending", "approved", "in_transit", "partially_paid"]);
const VOIDED_STATUSES = new Set(["draft", "cancelled"]);

function validInvoice(inv: Invoice): boolean {
  return !VOIDED_STATUSES.has(inv.status);
}

function invoiceProfit(inv: Invoice): number {
  if (!validInvoice(inv)) return 0;
  return inv.lines.reduce((acc, l) => {
    const gross = l.qty * l.unitPrice * (1 - l.discountPct / 100);
    return acc + (gross - l.qty * (l.cost ?? 0));
  }, 0);
}

function monthKey(d: Date): number {
  return d.getUTCFullYear() * 12 + d.getUTCMonth();
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function changePct(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

/** Pure analytics — the single source for dashboard aggregates. */
export function computeDashboard(input: AnalyticsInput): DashboardData {
  const now = new Date();
  const thisMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const prevMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const nextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

  const inWindow = (inv: Invoice, start: Date, end: Date) => {
    const d = new Date(inv.issueDate);
    return d >= start && d < end;
  };

  const revenueIn = (start: Date, end: Date) =>
    round2(
      sumBy(input.invoices.filter((i) => validInvoice(i) && inWindow(i, start, end)), (i) => i.totals.total),
    );
  const profitIn = (start: Date, end: Date) =>
    round2(
      sumBy(input.invoices.filter((i) => inWindow(i, start, end)), invoiceProfit),
    );
  const countIn = (start: Date, end: Date) =>
    input.invoices.filter((i) => validInvoice(i) && inWindow(i, start, end)).length;

  const revenueThisMonth = revenueIn(thisMonth, nextMonth);
  const revenuePrevMonth = revenueIn(prevMonth, thisMonth);
  const profitThisMonth = profitIn(thisMonth, nextMonth);
  const invoicesThisMonth = countIn(thisMonth, nextMonth);
  const invoicesPrevMonth = countIn(prevMonth, thisMonth);

  const revenueToday = round2(
    sumBy(
      input.invoices.filter((i) => validInvoice(i) && sameDay(new Date(i.issueDate), now)),
      (i) => i.totals.total,
    ),
  );

  const ordersPending = input.orders.filter((o) => ACTIVE_STATUSES.has(o.status)).length;

  const allTimeRevenue = round2(sumBy(input.invoices.filter(validInvoice), (i) => i.totals.total));
  const allTimeCount = input.invoices.filter(validInvoice).length;

  const newCustomers = input.customers.filter((c) => new Date(c.createdAt) >= thisMonth).length;
  const leadsOpen = input.leads.filter((l) => l.stage !== "won" && l.stage !== "lost").length;

  const inventoryValue = round2(
    input.stockItems.reduce((acc, si) => {
      const product = input.products.find((p) => p.id === si.productId);
      return acc + si.qty * (product?.cost.amount ?? 0);
    }, 0),
  );
  const lowStockCount = input.products.filter(
    (p) => p.trackStock && p.stock <= p.reorderPoint,
  ).length;

  const overduePayments = round2(
    sumBy(
      input.invoices.filter((i) => i.status === "overdue"),
      (i) => i.totals.total - i.paidAmount,
    ),
  );

  /* ---------- 6-month trend ---------- */
  const trend: DashboardData["trend"] = [];
  for (let i = 5; i >= 0; i--) {
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i + 1, 1));
    trend.push({
      month: start.getUTCMonth(),
      year: start.getUTCFullYear(),
      revenue: revenueIn(start, end),
      profit: profitIn(start, end),
      invoices: countIn(start, end),
    });
  }

  /* ---------- Category breakdown ---------- */
  const productById = new Map(input.products.map((p) => [p.id, p]));
  const catMap = new Map<string, number>();
  for (const inv of input.invoices.filter(validInvoice)) {
    for (const l of inv.lines) {
      const cat = productById.get(l.productId)?.category ?? "Other";
      const value = l.qty * l.unitPrice * (1 - l.discountPct / 100) * (1 + l.taxRate / 100);
      catMap.set(cat, (catMap.get(cat) ?? 0) + value);
    }
  }
  const byCategory = [...catMap.entries()]
    .map(([category, revenue]) => ({ category, revenue: round2(revenue) }))
    .sort((a, b) => b.revenue - a.revenue);

  /* ---------- Top products ---------- */
  const prodMap = new Map<string, { revenue: number; units: number }>();
  for (const inv of input.invoices.filter(validInvoice)) {
    for (const l of inv.lines) {
      const cur = prodMap.get(l.productId) ?? { revenue: 0, units: 0 };
      cur.revenue += l.qty * l.unitPrice * (1 - l.discountPct / 100) * (1 + l.taxRate / 100);
      cur.units += l.qty;
      prodMap.set(l.productId, cur);
    }
  }
  const topProducts = [...prodMap.entries()]
    .map(([productId, v]) => {
      const p = productById.get(productId);
      return {
        productId,
        name: p?.name ?? "Unknown",
        sku: p?.sku ?? "",
        revenue: round2(v.revenue),
        units: v.units,
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);

  /* ---------- Top salespeople ---------- */
  const userById = new Map(input.users.map((u) => [u.id, u]));
  const salesMap = new Map<string, { revenue: number; target: number }>();
  for (const inv of input.invoices.filter(validInvoice)) {
    if (!inv.ownerId) continue;
    const cur = salesMap.get(inv.ownerId) ?? { revenue: 0, target: 0 };
    cur.revenue += inv.totals.total;
    salesMap.set(inv.ownerId, cur);
  }
  const topSalespeople = [...salesMap.entries()]
    .map(([userId, v]) => ({
      userId,
      name: userById.get(userId)?.name ?? "—",
      revenue: round2(v.revenue),
      target: round2(v.revenue * 1.12),
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);

  /* ---------- Branch performance ---------- */
  const branchById = new Map(input.branches.map((b) => [b.id, b]));
  const branchMap = new Map<string, { revenue: number; invoices: number }>();
  for (const inv of input.invoices.filter(validInvoice)) {
    const cur = branchMap.get(inv.branchId) ?? { revenue: 0, invoices: 0 };
    cur.revenue += inv.totals.total;
    cur.invoices += 1;
    branchMap.set(inv.branchId, cur);
  }
  const branchPerformance = [...branchMap.entries()]
    .map(([branchId, v]) => ({
      branchId,
      name: branchById.get(branchId)?.name ?? "Branch",
      revenue: round2(v.revenue),
      invoices: v.invoices,
      target: round2(v.revenue * 1.12),
    }))
    .sort((a, b) => b.revenue - a.revenue);

  /* ---------- Sales by hour (8:00–22:00, 2h buckets) ---------- */
  const buckets = [8, 10, 12, 14, 16, 18, 20];
  const salesByHour = buckets.map((h) => {
    const value = round2(
      sumBy(
        input.invoices.filter((i) => {
          if (!validInvoice(i)) return false;
          const hour = new Date(i.issueDate).getUTCHours();
          return hour >= h && hour < h + 2;
        }),
        (i) => i.totals.total,
      ),
    );
    return { hour: h, value };
  });

  /* ---------- Activity feed ---------- */
  type ActivityItem = DashboardData["activity"][number];
  const activity: ActivityItem[] = [
    ...input.payments.map((p) => ({
      id: `act-${p.paidAt}-${p.amount.amount}`,
      kind: "payment" as const,
      title: `Payment received — ${p.customerName}`,
      time: p.paidAt,
      meta: `+${round2(p.amount.amount).toFixed(2)}`,
    })),
    ...input.invoices
      .filter((i) => validInvoice(i))
      .map((i) => ({
        id: `act-${i.id}`,
        kind: "invoice" as const,
        title: `Invoice ${i.code} — ${i.customerName}`,
        time: i.issueDate,
        meta: i.totals.total.toFixed(2),
      })),
    ...input.customers.map((c) => ({
      id: `act-${c.id}`,
      kind: "customer" as const,
      title: `New customer — ${c.name}`,
      time: c.createdAt,
      meta: c.code,
    })),
    ...input.leads.map((l) => ({
      id: `act-${l.id}`,
      kind: "lead" as const,
      title: `Lead ${l.code} — ${l.name}`,
      time: l.createdAt,
      meta: l.stage,
    })),
  ]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 12)
    .map((a) => ({ ...a, id: `act-${a.id}` }));

  /* ---------- Goals ---------- */
  const goalProgress: DashboardData["goalProgress"] = [
    { label: "revenue", current: revenueThisMonth, target: MONTHLY_REVENUE_TARGET },
    { label: "invoices", current: invoicesThisMonth, target: 34 },
    { label: "customers", current: newCustomers, target: 12 },
    { label: "leads", current: leadsOpen, target: 40 },
  ];

  return {
    kpis: {
      revenueToday: { amount: revenueToday, currency: "IQD" },
      revenueThisMonth: { amount: revenueThisMonth, currency: "IQD" },
      revenueChangePct: changePct(revenueThisMonth, revenuePrevMonth),
      profitThisMonth: { amount: profitThisMonth, currency: "IQD" },
      profitChangePct: changePct(profitThisMonth, profitIn(prevMonth, thisMonth)),
      invoicesThisMonth,
      invoicesChangePct: changePct(invoicesThisMonth, invoicesPrevMonth),
      ordersPending,
      customersTotal: input.customers.length,
      customersNewThisMonth: newCustomers,
      leadsOpen,
      inventoryValue: { amount: inventoryValue, currency: "IQD" },
      lowStockCount,
      overduePayments: { amount: overduePayments, currency: "IQD" },
      avgOrderValue: {
        amount: allTimeCount > 0 ? round2(allTimeRevenue / allTimeCount) : 0,
        currency: "IQD",
      },
    },
    trend,
    byCategory,
    topProducts,
    topSalespeople,
    branchPerformance,
    salesByHour,
    activity,
    goalProgress,
  };
}
