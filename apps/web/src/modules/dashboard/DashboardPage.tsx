import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
import {
  AlertTriangle,
  ArrowUpRight,
  CircleDollarSign,
  FileText,
  Handshake,
  Package,
  Receipt,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";
import { chartColor, chartPalette } from "@esp/design-system";
import { useDashboard } from "@esp/services";
import { cn, monthName, relativeTime } from "@esp/utils";
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Progress, Separator, Skeleton } from "@esp/ui";
import { useI18n } from "@/i18n";
import { useAuthStore } from "@/state/auth";
import { useFormat } from "@/lib/format";
import { PageHeader, Money } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";

const goalMeta = [
  { label: "dashboard.revenueGoal" as const, tone: "bg-primary" as const, key: "revenue" as const },
  { label: "dashboard.invoicesGoal" as const, tone: "bg-info" as const, key: "invoices" as const },
  { label: "dashboard.customersGoal" as const, tone: "bg-success" as const, key: "customers" as const },
  { label: "dashboard.leadsGoal" as const, tone: "bg-warning" as const, key: "leads" as const },
];

const activityIcon = {
  invoice: { icon: Receipt, tone: "text-primary bg-primary-soft" },
  order: { icon: ShoppingCart, tone: "text-info bg-info-soft" },
  customer: { icon: Users, tone: "text-success bg-success-soft" },
  payment: { icon: CircleDollarSign, tone: "text-warning bg-warning-soft" },
  lead: { icon: Handshake, tone: "text-secondary bg-secondary-soft" },
  stock: { icon: Package, tone: "text-danger bg-danger-soft" },
};

export function DashboardPage() {
  const { t, locale } = useI18n();
  const { money, moneyCompact } = useFormat();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, isError } = useDashboard();

  const trendData = useMemo(
    () =>
      (data?.trend ?? []).map((p) => ({
        name: monthName(p.month, locale === "ar" ? "ar" : "en").slice(0, 4),
        revenue: p.revenue,
        profit: p.profit,
      })),
    [data, locale],
  );

  const hourData = useMemo(
    () =>
      (data?.salesByHour ?? []).map((h) => ({
        name: `${h.hour}:00`,
        value: h.value,
      })),
    [data],
  );

  const pieData = useMemo(() => (data?.byCategory ?? []).slice(0, 6), [data]);

  const chartTooltipStyle = {
    borderRadius: 12,
    border: "1px solid var(--border)",
    background: "var(--surface)",
    color: "var(--foreground)",
    boxShadow: "var(--shadow-md)",
  };

  if (isLoading) return <DashboardSkeleton />;

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-surface p-16">
        <AlertTriangle className="size-8 text-danger" />
        <p className="text-sm text-muted-foreground">{t("toast.error")}</p>
      </div>
    );
  }

  const k = data.kpis;

  return (
    <div>
      <PageHeader
        title={t("dashboard.greeting", { name: user?.name ?? "" })}
        description={`${t("dashboard.date")}: ${new Date().toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US")}`}
        actions={
          <>
            <Button variant="outline" onClick={() => navigate("/reports")}>
              <TrendingUp className="size-4" />
              {t("nav.reports")}
            </Button>
            <Button onClick={() => navigate("/sales/invoices?new=1")}>
              <FileText className="size-4" />
              {t("sales.newInvoice")}
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t("dashboard.revenueToday")}
          value={money(k.revenueToday.amount)}
          icon={CircleDollarSign}
          tone="primary"
          hint={t("common.items")}
        />
        <StatCard
          label={t("dashboard.revenueThisMonth")}
          value={money(k.revenueThisMonth.amount)}
          icon={TrendingUp}
          delta={k.revenueChangePct}
          tone="success"
        />
        <StatCard
          label={t("dashboard.profit")}
          value={money(k.profitThisMonth.amount)}
          icon={ArrowUpRight}
          delta={k.profitChangePct}
          tone="info"
        />
        <StatCard
          label={t("dashboard.ordersPending")}
          value={k.ordersPending}
          icon={ShoppingCart}
          tone="warning"
          hint={`${k.invoicesThisMonth} ${t("dashboard.invoicesThisMonth").toLowerCase()}`}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>{t("dashboard.salesTrend")}</CardTitle>
              <CardDescription>{t("reports.lastMonth")}</CardDescription>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-chart-1" /> Revenue
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-chart-4" /> Profit
              </span>
            </div>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColor("chart-1")} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={chartColor("chart-1")} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" tickFormatter={(v) => moneyCompact(v)} width={70} />
                <ChartTooltip contentStyle={chartTooltipStyle} formatter={(value) => money(Number(value))} />
                <Area type="monotone" dataKey="revenue" stroke={chartColor("chart-1")} strokeWidth={2.5} fill="url(#rev)" />
                <Area type="monotone" dataKey="profit" stroke={chartColor("chart-4")} strokeWidth={2.5} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.goals")}</CardTitle>
            <CardDescription>{t("reports.lastMonth")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {goalMeta.map((g) => {
              const goal = data.goalProgress.find((x) => x.label === g.key);
              const pct = goal ? Math.min(100, Math.round((goal.current / goal.target) * 100)) : 0;
              return (
                <div key={g.key}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t(g.label)}</span>
                    <span className="font-semibold tabular-nums">
                      {g.key === "revenue"
                        ? moneyCompact(goal?.current ?? 0)
                        : `${goal?.current ?? 0} / ${goal?.target ?? 0}`}
                    </span>
                  </div>
                  <Progress value={pct} className="h-2" />
                  <span className="mt-1 block text-end text-xs font-medium text-primary">{pct}%</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("dashboard.topProducts")}</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pb-2">
            <div className="space-y-1">
              {data.topProducts.slice(0, 6).map((p, i) => (
                <div key={p.productId} className="flex items-center gap-3 px-5 py-2">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-bold text-muted-foreground">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.sku} · {p.units} units</p>
                  </div>
                  <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.max(6, (p.revenue / data.topProducts[0]!.revenue) * 100)}%` }}
                    />
                  </div>
                  <span className="w-20 text-end text-sm font-semibold tabular-nums">{moneyCompact(p.revenue)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.byCategory")}</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="revenue" nameKey="category" innerRadius="55%" outerRadius="85%" paddingAngle={2}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={chartColor(chartPalette[i % chartPalette.length] ?? "chart-1")} />
                  ))}
                </Pie>
                <Legend
                  formatter={(value) => <span style={{ color: "var(--muted-foreground)", fontSize: 12 }}>{value}</span>}
                />
                <ChartTooltip contentStyle={chartTooltipStyle} formatter={(value) => money(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.topSalespeople")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.topSalespeople.map((sp, i) => {
              const pct = Math.min(100, (sp.revenue / sp.target) * 100);
              return (
                <div key={sp.userId} className="flex items-center gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="truncate font-medium">{sp.name}</span>
                      <span className="text-xs text-muted-foreground">{moneyCompact(sp.revenue)}</span>
                    </div>
                    <Progress value={pct} className="mt-1 h-1.5" />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.branchPerformance")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.branchPerformance.slice(0, 6).map((b) => (
                <div key={b.branchId} className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-sm">
                    <span className="size-2 rounded-full" style={{ background: chartColor(chartPalette[data.branchPerformance.indexOf(b) % chartPalette.length] ?? "chart-1") }} />
                    <span className="truncate font-medium">{b.name}</span>
                  </span>
                  <span className="text-sm font-semibold tabular-nums">{moneyCompact(b.revenue)}</span>
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <p className="text-xs text-muted-foreground">
              {k.inventoryValue.amount > 0 ? (
                <>
                  <span className="font-semibold text-foreground">{t("dashboard.inventoryValue")}:</span>{" "}
                  {money(k.inventoryValue.amount)}
                </>
              ) : null}
              {k.lowStockCount > 0 ? (
                <Badge variant="warning" className="ms-2">{k.lowStockCount} {t("dashboard.lowStock")}</Badge>
              ) : null}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.salesByHour")}</CardTitle>
          </CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={11} stroke="var(--muted-foreground)" />
                <YAxis hide />
                <ChartTooltip contentStyle={chartTooltipStyle} formatter={(value) => money(Number(value))} cursor={{ fill: "var(--muted)", opacity: 0.4 }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} fill={chartColor("chart-2")} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>{t("dashboard.activity")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-1 p-2 sm:grid-cols-2">
          {data.activity.slice(0, 10).map((a) => {
            const cfg = activityIcon[a.kind] ?? activityIcon.stock;
            return (
              <div key={a.id} className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50">
                <span className={cn("mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg", cfg.tone)}>
                  <cfg.icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{a.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.meta} · {relativeTime(a.time, locale === "ar" ? "ar" : "en")}
                  </p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-9 w-72" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Skeleton className="h-80 xl:col-span-2" />
        <Skeleton className="h-80" />
      </div>
      <Skeleton className="h-80" />
    </div>
  );
}
