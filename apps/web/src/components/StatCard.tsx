import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";
import { cn } from "@esp/utils";
import { Card, CardContent } from "@esp/ui";

export interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon: LucideIcon;
  delta?: number;
  hint?: string;
  tone?: "primary" | "success" | "danger" | "warning" | "info";
}

const tones = {
  primary: "bg-primary-soft text-primary",
  success: "bg-success-soft text-success",
  danger: "bg-danger-soft text-danger",
  warning: "bg-warning-soft text-warning",
  info: "bg-info-soft text-info",
};

export function StatCard({ label, value, icon: Icon, delta, hint, tone = "primary" }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Card>
        <CardContent className="flex items-start justify-between gap-3 p-5">
          <div className="min-w-0">
            <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {label}
            </p>
            <p className="mt-1.5 truncate text-2xl font-bold tabular-nums text-foreground">{value}</p>
            {delta !== undefined || hint ? (
              <div className="mt-1 flex items-center gap-1.5 text-xs">
                {delta !== undefined ? (
                  <span
                    className={cn(
                      "font-semibold",
                      delta >= 0 ? "text-success" : "text-danger",
                    )}
                  >
                    {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}%
                  </span>
                ) : null}
                {hint ? <span className="truncate text-muted-foreground">{hint}</span> : null}
              </div>
            ) : null}
          </div>
          <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", tones[tone])}>
            <Icon className="size-5" />
          </span>
        </CardContent>
      </Card>
    </motion.div>
  );
}
