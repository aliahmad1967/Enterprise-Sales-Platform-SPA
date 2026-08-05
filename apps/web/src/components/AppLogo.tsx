import { cn } from "@esp/utils";

export function AppLogo({ className, dark = true }: { className?: string; dark?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-primary"
        aria-hidden
      >
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 17l6-6 4 4 8-8" />
          <path d="M14 7h7v7" />
        </svg>
      </div>
      <div className="leading-tight">
        <p className={cn("text-sm font-bold", dark ? "text-navy-foreground" : "text-foreground")}>
          ESP
        </p>
        <p className={cn("text-[10px] font-medium", dark ? "text-navy-muted" : "text-muted-foreground")}>
          Enterprise Sales
        </p>
      </div>
    </div>
  );
}
