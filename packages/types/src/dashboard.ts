import type { CurrencyCode, Money } from "./core";

/** Dashboard aggregates returned by the analytics service. */

export interface KpiSummary {
  revenueToday: Money;
  revenueThisMonth: Money;
  revenueChangePct: number;
  profitThisMonth: Money;
  profitChangePct: number;
  invoicesThisMonth: number;
  invoicesChangePct: number;
  ordersPending: number;
  customersTotal: number;
  customersNewThisMonth: number;
  leadsOpen: number;
  inventoryValue: Money;
  lowStockCount: number;
  overduePayments: Money;
  avgOrderValue: Money;
}

export interface TrendPoint {
  month: number;
  year: number;
  revenue: number;
  profit: number;
  invoices: number;
}

export interface RevenueByCategory {
  category: string;
  revenue: number;
}

export interface TopProduct {
  productId: string;
  name: string;
  sku: string;
  revenue: number;
  units: number;
}

export interface TopSalesperson {
  userId: string;
  name: string;
  revenue: number;
  target: number;
}

export interface BranchPerformance {
  branchId: string;
  name: string;
  revenue: number;
  invoices: number;
  target: number;
}

export interface DashboardData {
  kpis: KpiSummary;
  trend: TrendPoint[];
  byCategory: RevenueByCategory[];
  topProducts: TopProduct[];
  topSalespeople: TopSalesperson[];
  branchPerformance: BranchPerformance[];
  salesByHour: Array<{ hour: number; value: number }>;
  activity: Array<{
    id: string;
    kind: "invoice" | "order" | "customer" | "payment" | "lead" | "stock";
    title: string;
    time: string;
    meta?: string;
  }>;
  goalProgress: Array<{ label: string; current: number; target: number }>;
}
