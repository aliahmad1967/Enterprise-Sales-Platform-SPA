import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { chartColor, chartPalette } from "@esp/design-system";
import { useDashboard } from "@esp/services";
import { monthName } from "@esp/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@esp/ui";
import { useI18n } from "@/i18n";
import { useFormat } from "@/lib/format";
import { PageHeader } from "@/components/PageHeader";
import { PageLoader } from "@/components/PageHeader";
import { Stats } from "@/components/Stats";

export function ReportsPage() {
  const { t, locale } = useI18n();
  const { money, moneyCompact } = useFormat();
  const { data, isLoading } = useDashboard();

  const trendData = useMemo(
    () =>
      (data?.trend ?? []).map((p) => ({
        name: monthName(p.month, locale === "ar" ? "ar" : "en").slice(0, 4),
        revenue: p.revenue,
        profit: p.profit,
      })),
    [data, locale],
  );

  const pieData = useMemo(() => (data?.byCategory ?? []).slice(0, 6), [data]);

  const tooltipStyle = {
    borderRadius: 12,
    border: "1px solid var(--border)",
    background: "var(--surface)",
    color: "var(--foreground)",
    boxShadow: "var(--shadow-md)",
  };

  if (isLoading) return <PageLoader rows={8} />;
  if (!data) return null;

  const k = data.kpis;

  const stats = [
    { label: t("reports.annualRevenue"), value: money(data.trend.reduce((a, p) => a + p.revenue, 0)), tone: "primary" as const },
    { label: t("reports.totalProfit"), value: money(data.trend.reduce((a, p) => a + p.profit, 0)), tone: "success" as const },
    { label: t("dashboard.ordersPending"), value: `${k.ordersPending}`, tone: "warning" as const },
    { label: t("reports.totalCustomers"), value: `${k.customersTotal}`, tone: "info" as const },
  ];

  return (
    <div>
      <PageHeader title={t("nav.reports")} description={t("reports.desc")} />

      <Stats items={stats} />

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>{t("dashboard.salesTrend")}</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="repRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColor("chart-1")} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={chartColor("chart-1")} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" tickFormatter={(v) => moneyCompact(v)} width={70} />
                <ChartTooltip contentStyle={tooltipStyle} formatter={(value) => money(Number(value))} />
                <Area type="monotone" dataKey="revenue" stroke={chartColor("chart-1")} strokeWidth={2.5} fill="url(#repRev)" />
                <Area type="monotone" dataKey="profit" stroke={chartColor("chart-4")} strokeWidth={2.5} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.byCategory")}</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="revenue" nameKey="category" innerRadius="50%" outerRadius="80%" paddingAngle={2}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={chartColor(chartPalette[i % chartPalette.length] ?? "chart-1")} />
                  ))}
                </Pie>
                <Legend formatter={(value) => <span style={{ color: "var(--muted-foreground)", fontSize: 12 }}>{value}</span>} />
                <ChartTooltip contentStyle={tooltipStyle} formatter={(value) => money(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>{t("reports.monthlyBars")}</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
              <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" tickFormatter={(v) => moneyCompact(v)} width={70} />
              <ChartTooltip contentStyle={tooltipStyle} formatter={(value) => money(Number(value))} cursor={{ fill: "var(--muted)", opacity: 0.4 }} />
              <Bar dataKey="revenue" fill={chartColor("chart-2")} radius={[6, 6, 0, 0]} />
              <Bar dataKey="profit" fill={chartColor("chart-4")} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>{t("reports.topProducts")}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2 text-start font-medium">{t("common.product")}</th>
                <th className="px-3 py-2 text-end font-medium">{t("common.qty")}</th>
                <th className="px-3 py-2 text-end font-medium">{t("reports.grossRevenue")}</th>
                <th className="px-4 py-2 text-end font-medium">{t("reports.share")}</th>
              </tr>
            </thead>
            <tbody>
              {data.topProducts.map((p, i) => {
                const max = data.topProducts[0]?.revenue ?? 1;
                return (
                  <tr key={p.productId} className="border-t border-border">
                    <td className="px-4 py-2.5">
                      <p className="font-medium text-foreground">{p.name}</p>
                      <p className="text-xs text-muted-foreground" dir="ltr">{p.sku}</p>
                    </td>
                    <td className="px-3 py-2.5 text-end tabular-nums">{p.units}</td>
                    <td className="px-3 py-2.5 text-end font-semibold tabular-nums">{money(p.revenue)}</td>
                    <td className="px-4 py-2.5">
                      <div className="ms-auto flex items-center gap-2">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${(p.revenue / max) * 100}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{i + 1}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
