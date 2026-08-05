import { useQuery } from "@tanstack/react-query";
import { Bell, Menu, Moon, Search, Sparkles, Sun } from "lucide-react";
import { Avatar, Badge, Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, Kbd, Tooltip } from "@esp/ui";
import { useOnline } from "@esp/hooks";
import { useI18n } from "@/i18n";
import { useAuthStore } from "@/state/auth";
import { useThemeStore } from "@/state/theme";
import { useUiStore } from "@/state/ui";
import { getDatabase } from "@esp/services";

export function Navbar() {
  const { t, locale, setLocale } = useI18n();
  const mode = useThemeStore((s) => s.mode);
  const toggleTheme = useThemeStore((s) => s.toggle);
  const setCommandOpen = useUiStore((s) => s.setCommandOpen);
  const setNotificationsOpen = useUiStore((s) => s.setNotificationsOpen);
  const setAiOpen = useUiStore((s) => s.setAiOpen);
  const setMobileOpen = useUiStore((s) => s.setMobileSidebarOpen);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const online = useOnline();

  const { data: unread } = useQuery({
    queryKey: ["esp", "notification-count"],
    queryFn: loadNotificationCount,
    staleTime: 30_000,
  });

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md lg:px-6">
      <button
        onClick={() => setMobileOpen(true)}
        className="rounded-lg p-2 text-muted-foreground hover:bg-muted lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </button>

      <div className="hidden flex-1 items-center gap-3 sm:flex">
        <button
          onClick={() => setCommandOpen(true)}
          className="group flex h-9 w-full max-w-sm items-center gap-2.5 rounded-lg border border-border bg-surface px-3 text-sm text-muted-foreground shadow-xs transition-colors hover:border-border-strong"
          aria-label={t("nav.search")}
        >
          <Search className="size-4" />
          <span className="flex-1 text-start">{t("nav.search")}</span>
          <span className="hidden items-center gap-1 sm:flex">
            <Kbd>Ctrl</Kbd>
            <Kbd>K</Kbd>
          </span>
        </button>
      </div>

      <div className="flex flex-1 items-center justify-end gap-1.5 sm:flex-none">
        <BranchSwitcher />

        <Tooltip content={t("theme.dark")}>
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={t("theme.dark")}
          >
            {mode === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </button>
        </Tooltip>

        <Tooltip content={t("nav.aiAssistant")}>
          <button
            onClick={() => setAiOpen(true)}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={t("nav.aiAssistant")}
          >
            <Sparkles className="size-5" />
          </button>
        </Tooltip>

        <Tooltip content={t("nav.notifications")}>
          <button
            onClick={() => setNotificationsOpen(true)}
            className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={t("nav.notifications")}
          >
            <Bell className="size-5" />
            {unread ? (
              <Badge variant="danger" size="sm" dot className="absolute -end-0.5 -top-0.5 size-4 justify-center p-0 text-[10px]">
                {unread > 9 ? "9+" : unread}
              </Badge>
            ) : null}
          </button>
        </Tooltip>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ms-1 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Avatar name={user?.name ?? "?"} color={user?.avatarColor} size="sm" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="text-sm font-semibold text-foreground">{user?.name}</p>
              <p className="text-xs font-normal text-muted-foreground">{user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setLocale(locale === "ar" ? "en" : "ar")}>
              {locale === "ar" ? "English" : "العربية"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setCommandOpen(true)}>
              {t("cmd.title")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={logout}>{t("common.close")} / Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <span
          className="ms-1 hidden items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[11px] font-medium md:flex"
          aria-live="polite"
        >
          <span className={`size-1.5 rounded-full ${online ? "bg-success" : "bg-warning"}`} />
          {online ? t("common.online") : t("common.offline")}
        </span>
      </div>
    </header>
  );
}

export function BranchSwitcher() {
  const { t } = useI18n();
  const activeBranchId = useUiStore((s) => s.activeBranchId);
  const setActiveBranch = useUiStore((s) => s.setActiveBranch);
  const { data } = useQuery({
    queryKey: ["esp", "branches", "list", { pageSize: 100 }],
    queryFn: () => getDatabase().branches.toArray(),
  });
  const branches = data ?? [];
  const active = branches.find((b) => b.id === activeBranchId);

  if (branches.length === 0) {
    return (
      <Button variant="outline" size="sm" disabled>
        {t("common.branch")}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <span className="max-w-28 truncate">{active?.name ?? t("common.branch")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{t("common.branch")}</DropdownMenuLabel>
        {branches.map((b) => (
          <DropdownMenuItem key={b.id} onClick={() => setActiveBranch(b.id)}>
            <span className="size-1.5 rounded-full bg-primary" />
            {b.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

async function loadNotificationCount(): Promise<number> {
  const db = getDatabase();
  const [products, invoices, orders] = await Promise.all([
    db.products.toArray(),
    db.invoices.toArray(),
    db.orders.toArray(),
  ]);
  const lowStock = products.filter((p) => p.trackStock && p.stock <= p.reorderPoint).length;
  const overdue = invoices.filter((i) => i.status === "overdue").length;
  const pending = orders.filter((o) => o.status === "pending" || o.status === "approved").length;
  return lowStock + overdue + pending;
}
