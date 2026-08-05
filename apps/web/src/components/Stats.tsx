import { type LucideIcon } from "lucide-react";
import { cn } from "@esp/utils";

export interface StatsItem {
  label: string;
  value: string;
  icon?: LucideIcon;
  tone?: "primary" | "success" | "danger" | "warning" | "info";
}

const tones: Record<string, string> = {
  primary: "bg-primary-soft text-primary",
  success: "bg-success-soft text-success",
  danger: "bg-danger-soft text-danger",
  warning: "bg-warning-soft text-warning",
  info: "bg-info-soft text-info",
};

export function Stats({ items }: { items: StatsItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.label} className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4">
            {Icon ? (
              <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", tones[item.tone ?? "primary"])}>
                <Icon className="size-5" />
              </span>
            ) : (
              <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold", tones[item.tone ?? "primary"])}>
                {item.value.charAt(0)}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-xs text-muted-foreground">{item.label}</p>
              <p className="truncate text-lg font-bold tabular-nums text-foreground">{item.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
