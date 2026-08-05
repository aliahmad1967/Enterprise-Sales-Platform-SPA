import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ArrowDownToLine, Clock, PackageX, Receipt, RefreshCcw, UserRound } from "lucide-react";
import { Badge, Sheet, SheetBody, SheetContent, SheetHeader, SheetTitle, EmptyState } from "@esp/ui";
import { getDatabase } from "@esp/services";
import { relativeTime } from "@esp/utils";
import { useI18n } from "@/i18n";
import { useUiStore } from "@/state/ui";
import { useNavigate } from "react-router-dom";

interface Notification {
  id: string;
  kind: "danger" | "warning" | "info";
  title: string;
  body: string;
  time: string;
  link?: string;
}

async function loadNotifications(): Promise<Notification[]> {
  const db = getDatabase();
  const [products, invoices, orders, leads] = await Promise.all([
    db.products.toArray(),
    db.invoices.toArray(),
    db.orders.toArray(),
    db.leads.toArray(),
  ]);

  const list: Notification[] = [];

  for (const p of products) {
    if (p.trackStock && p.stock <= p.reorderPoint) {
      list.push({
        id: `low-${p.id}`,
        kind: "danger",
        title: `Low stock — ${p.name}`,
        body: `${p.stock} left, reorder at ${p.reorderPoint}.`,
        time: p.updatedAt,
        link: `/inventory/products/${p.id}`,
      });
    }
  }

  for (const i of invoices.filter((x) => x.status === "overdue")) {
    list.push({
      id: `overdue-${i.id}`,
      kind: "warning",
      title: `Overdue invoice ${i.code}`,
      body: `${i.customerName} · ${(i.totals.total - i.paidAmount).toLocaleString()} ${i.totals.currency}`,
      time: i.dueDate,
      link: `/sales/invoices/${i.id}`,
    });
  }

  for (const o of orders.filter((x) => x.status === "pending" || x.status === "approved")) {
    list.push({
      id: `ord-${o.id}`,
      kind: "info",
      title: `Order ${o.code} awaiting fulfillment`,
      body: o.customerName,
      time: o.createdAt,
      link: `/sales/orders/${o.id}`,
    });
  }

  for (const l of leads.filter((x) => x.stage === "qualified" || x.stage === "proposal")) {
    list.push({
      id: `lead-${l.id}`,
      kind: "info",
      title: `Follow up on lead ${l.name}`,
      body: `${l.company ?? ""} · ${l.value.amount.toLocaleString()} ${l.value.currency}`,
      time: l.updatedAt,
      link: `/crm/leads/${l.id}`,
    });
  }

  return list.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 30);
}

const kindIcon = {
  danger: PackageX,
  warning: Receipt,
  info: UserRound,
};

export function NotificationsPanel() {
  const { t, locale } = useI18n();
  const open = useUiStore((s) => s.notificationsOpen);
  const setOpen = useUiStore((s) => s.setNotificationsOpen);
  const navigate = useNavigate();
  const { data } = useQuery({
    queryKey: ["esp", "notifications"],
    queryFn: loadNotifications,
    staleTime: 30_000,
  });

  const unread = data?.length ?? 0;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="end">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {t("nav.notifications")}
            {unread ? <Badge variant="danger">{unread}</Badge> : null}
          </SheetTitle>
        </SheetHeader>
        <SheetBody className="space-y-2">
          {data && data.length === 0 ? (
            <EmptyState icon={RefreshCcw} title={t("notifications.empty")} />
          ) : (
            (data ?? []).map((n) => {
              const Icon = kindIcon[n.kind];
              return (
                <button
                  key={n.id}
                  onClick={() => {
                    if (n.link) navigate(n.link);
                    setOpen(false);
                  }}
                  className="flex w-full items-start gap-3 rounded-xl border border-border bg-surface p-3 text-start transition-colors hover:bg-muted/50"
                >
                  <span
                    className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ${
                      n.kind === "danger"
                        ? "bg-danger-soft text-danger"
                        : n.kind === "warning"
                          ? "bg-warning-soft text-warning"
                          : "bg-info-soft text-info"
                    }`}
                  >
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-foreground">{n.title}</span>
                    <span className="block truncate text-xs text-muted-foreground">{n.body}</span>
                    <span className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground/70">
                      <Clock className="size-3" />
                      {relativeTime(n.time, locale === "ar" ? "ar" : "en")}
                    </span>
                  </span>
                  {n.kind === "danger" ? <AlertTriangle className="size-4 text-danger" /> : n.kind === "warning" ? <ArrowDownToLine className="size-4 text-warning" /> : null}
                </button>
              );
            })
          )}
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}
