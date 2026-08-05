import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CircleCheck, CircleDot } from "lucide-react";
import { Badge } from "@esp/ui";
import { getDatabase } from "@esp/services";
import { useI18n } from "@/i18n";
import { useUiStore } from "@/state/ui";

interface Alert {
  label: string;
  value: string | number;
  ok: boolean;
  warn: boolean;
}

async function loadAlerts(): Promise<Alert[]> {
  const db = getDatabase();
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const [invoices, leads, products] = await Promise.all([
    db.invoices.toArray(),
    db.leads.toArray(),
    db.products.toArray(),
  ]);

  const overdue = invoices.filter((i) => i.status === "overdue").length;
  const monthRevenue = invoices
    .filter(
      (i) =>
        i.status !== "draft" &&
        i.status !== "cancelled" &&
        new Date(i.issueDate) >= monthStart,
    )
    .reduce((a, i) => a + i.totals.total, 0);
  const lowStock = products.filter(
    (p) => p.trackStock && p.stock <= p.reorderPoint,
  ).length;
  const openLeads = leads.filter((l) => l.stage !== "won" && l.stage !== "lost").length;

  return [
    { label: "Open leads", value: openLeads, ok: true, warn: false },
    { label: "Month revenue", value: monthRevenue.toLocaleString(), ok: true, warn: false },
    { label: "Overdue invoices", value: overdue, ok: overdue === 0, warn: overdue > 0 },
    { label: "Low stock SKUs", value: lowStock, ok: lowStock === 0, warn: lowStock > 0 },
  ];
}

export function useSidebarAccessory() {
  const { t } = useI18n();
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const { data } = useQuery({
    queryKey: ["esp", "sidebar-alerts"],
    queryFn: loadAlerts,
    staleTime: 30_000,
  });

  if (collapsed || !data) return null;

  return (
    <div className="mx-3 mb-2 space-y-1.5 rounded-xl border border-white/10 bg-navy-2/60 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-navy-muted">
        {t("dashboard.goals")}
      </p>
      {data.slice(0, 3).map((a) => (
        <div key={a.label} className="flex items-center gap-2 text-xs">
          {a.ok ? (
            <CircleCheck className="size-3.5 shrink-0 text-success" />
          ) : a.warn ? (
            <AlertTriangle className="size-3.5 shrink-0 text-warning" />
          ) : (
            <CircleDot className="size-3.5 shrink-0 text-navy-muted" />
          )}
          <span className="flex-1 truncate text-navy-foreground/80">{a.label}</span>
          <span className="font-semibold text-navy-foreground">{a.value}</span>
        </div>
      ))}
      <Badge variant="primary" size="sm" className="mt-1">
        {data.length} {t("common.items")}
      </Badge>
    </div>
  );
}
