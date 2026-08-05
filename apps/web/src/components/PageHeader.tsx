import { Skeleton } from "@esp/ui";
import { cn, relativeTime } from "@esp/utils";
import { useFormat } from "@/lib/format";
import { useI18n } from "@/i18n";

export function Money({ amount, currency = "IQD", className }: { amount: number; currency?: string; className?: string }) {
  const { money } = useFormat();
  return <span className={cn("tabular-nums", className)}>{money(amount, currency)}</span>;
}

export function PageHeader({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">{title}</h1>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        {children}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function PageLoader({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-4" data-testid="page-loader">
      <Skeleton className="h-9 w-56" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <Skeleton className="h-72" />
      {Array.from({ length: Math.max(1, rows - 4) }, (_, i) => (
        <Skeleton key={`r${i}`} className="h-12" />
      ))}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-surface p-12 text-center">
      <p className="text-sm font-medium text-danger">{message}</p>
      {onRetry ? (
        <button onClick={onRetry} className="text-sm font-semibold text-primary hover:underline">
          Retry
        </button>
      ) : null}
    </div>
  );
}

export function ActivityFeed({ items, empty }: { items: { id: string; title: string; meta?: string; kind: string; time: number }[]; empty?: string }) {
  const { locale } = useI18n();
  if (!items.length)
    return <p className="py-6 text-center text-sm text-muted-foreground">{empty ?? "—"}</p>;
  return (
    <div className="space-y-1">
      {items.map((a) => (
        <div key={a.id} className="flex items-start justify-between gap-3 rounded-lg p-2.5 text-sm transition-colors hover:bg-muted/50">
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{a.title}</p>
            {a.meta ? <p className="truncate text-xs text-muted-foreground">{a.meta}</p> : null}
          </div>
          <time className="shrink-0 text-xs text-muted-foreground">
            {relativeTime(a.time, locale === "ar" ? "ar" : "en")}
          </time>
        </div>
      ))}
    </div>
  );
}
