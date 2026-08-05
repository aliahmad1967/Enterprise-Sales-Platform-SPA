import { getDatabase } from "@esp/services";
import { computeDashboard } from "@esp/services";
import { formatMoney } from "@esp/utils";

export interface AiMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function detectIntent(query: string):
  | "analyze"
  | "forecast"
  | "reorder"
  | "summary"
  | "customers"
  | "help" {
  const q = query.toLowerCase();
  if (/(reorder|low stock|مخزون|إعادة|تزويد)/.test(q)) return "reorder";
  if (/(forecast|predict|توقع|مستقبل)/.test(q)) return "forecast";
  if (/(customer|عملاء|العميل)/.test(q)) return "customers";
  if (/(summary|ملخص|لخص)/.test(q)) return "summary";
  if (/(analy|analyse|sales|مبيعات|تحليل|إيراد)/.test(q)) return "analyze";
  return "help";
}

async function loadDashboard() {
  const db = getDatabase();
  const [invoices, payments, orders, customers, leads, products, stockItems, branches, users, creditNotes] =
    await Promise.all([
      db.invoices.toArray(),
      db.payments.toArray(),
      db.orders.toArray(),
      db.customers.toArray(),
      db.leads.toArray(),
      db.products.toArray(),
      db.stockItems.toArray(),
      db.branches.toArray(),
      db.users.toArray(),
      db.creditNotes.toArray(),
    ]);
  return computeDashboard({ invoices, payments, orders, customers, leads, products, stockItems, branches, users, creditNotes });
}

export async function answerQuery(query: string): Promise<string> {
  const intent = detectIntent(query);
  const dash = await loadDashboard();

  switch (intent) {
    case "analyze": {
      const { kpis } = dash;
      return [
        "Sales analysis (this month):",
        `• Revenue: ${formatMoney(kpis.revenueThisMonth.amount)} (${kpis.revenueChangePct >= 0 ? "+" : ""}${kpis.revenueChangePct}% vs last month)`,
        `• Profit: ${formatMoney(kpis.profitThisMonth.amount)}`,
        `• Invoices: ${kpis.invoicesThisMonth}`,
        `• Average order: ${formatMoney(kpis.avgOrderValue.amount)}`,
        `• Best category: ${dash.byCategory[0]?.category ?? "—"} (${formatMoney(dash.byCategory[0]?.revenue ?? 0)})`,
        `• Top salesperson: ${dash.topSalespeople[0]?.name ?? "—"} (${formatMoney(dash.topSalespeople[0]?.revenue ?? 0)})`,
      ].join("\n");
    }
    case "forecast": {
      const recent = dash.trend.slice(-3);
      const avg =
        recent.reduce((a, p) => a + p.revenue, 0) / Math.max(1, recent.length);
      const growth =
        dash.kpis.revenueChangePct > 0 ? `+${dash.kpis.revenueChangePct}%` : `${dash.kpis.revenueChangePct}%`;
      return [
        `Sales forecast:`,
        `• Current monthly run-rate: ${formatMoney(Math.round(avg))}`,
        `• Month-over-month growth: ${growth}`,
        `• Projected next month: ${formatMoney(Math.round(avg * (1 + dash.kpis.revenueChangePct / 100)))}`,
        `• Confidence: ${Math.min(92, 55 + Math.abs(dash.kpis.revenueChangePct))}% (simple linear trend)`,
      ].join("\n");
    }
    case "reorder": {
      const db = getDatabase();
      const products = await db.products.toArray();
      const low = products
        .filter((p) => p.trackStock && p.stock <= p.reorderPoint)
        .sort((a, b) => a.stock - b.stock)
        .slice(0, 8);
      if (low.length === 0) return "No products below their reorder point. Inventory is healthy. ";
      return [
        `Reorder suggestions (${low.length} SKUs below reorder point):`,
        ...low.map(
          (p) =>
            `• ${p.name} — ${p.stock} in stock, reorder point ${p.reorderPoint}. Suggested qty: ${Math.max(p.reorderPoint * 2 - p.stock, p.stockMin)}`,
        ),
      ].join("\n");
    }
    case "customers": {
      const db = getDatabase();
      const customers = await db.customers.toArray();
      const top = [...customers].sort((a, b) => b.totalRevenue.amount - a.totalRevenue.amount).slice(0, 5);
      return [
        "Customer analysis:",
        `• Total customers: ${customers.length}`,
        `• Platinum/Gold: ${customers.filter((c) => c.tier === "platinum" || c.tier === "gold").length}`,
        ...top.map((c) => `• ${c.name} — ${formatMoney(c.totalRevenue.amount)} revenue, ${c.totalInvoices} invoices`),
      ].join("\n");
    }
    case "summary": {
      const { kpis } = dash;
      return [
        `Executive summary — ${new Date().toLocaleDateString()}`,
        `Revenue ${formatMoney(kpis.revenueThisMonth.amount)} this month (${kpis.revenueChangePct >= 0 ? "+" : ""}${kpis.revenueChangePct}%), profit ${formatMoney(kpis.profitThisMonth.amount)}.`,
        `${kpis.invoicesThisMonth} invoices issued, ${kpis.ordersPending} orders still pending fulfillment.`,
        `${formatMoney(kpis.overduePayments.amount)} overdue across ${dash.activity.filter((a) => a.kind === "invoice").length} open invoices.`,
        `Inventory value ${formatMoney(kpis.inventoryValue.amount)} with ${kpis.lowStockCount} low-stock alerts.`,
        `${kpis.leadsOpen} open leads in the pipeline.`,
      ].join("\n");
    }
    default: {
      return [
        "I can help with:",
        "• Analyze sales — revenue, profit, top products and salespeople",
        "• Forecast — projected next-month revenue from the trend",
        "• Reorder — low-stock SKUs with suggested quantities",
        "• Customers — top customers by revenue and tier mix",
        "• Summary — an executive summary of current performance",
        "Try asking in Arabic or English.",
      ].join("\n");
    }
  }
}
