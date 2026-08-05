import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, X } from "lucide-react";
import { cn } from "@esp/utils";
import { Badge, Tooltip } from "@esp/ui";
import { navGroups } from "@/app/nav";
import { useI18n } from "@/i18n";
import { useUiStore } from "@/state/ui";
import { AppLogo } from "./AppLogo";
import { useSidebarAccessory } from "./SidebarAccessory";

export function Sidebar() {
  const { t } = useI18n();
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const setCollapsed = useUiStore((s) => s.setSidebarCollapsed);
  const mobileOpen = useUiStore((s) => s.mobileSidebarOpen);
  const setMobileOpen = useUiStore((s) => s.setMobileSidebarOpen);
  const location = useLocation();
  const accessory = useSidebarAccessory();

  const link = (path: string) =>
    cn(
      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
      collapsed && !mobileOpen ? "justify-center px-2" : "",
      "text-navy-muted hover:bg-navy-2 hover:text-navy-foreground",
    );

  const active = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const nav = (
    <div className="flex h-full flex-col">
      <div className={cn("flex h-16 items-center border-b border-white/5 px-4", collapsed && !mobileOpen && "justify-center px-2")}>
        <AppLogo />
        {mobileOpen ? (
          <button onClick={() => setMobileOpen(false)} className="ms-auto text-navy-muted hover:text-navy-foreground" aria-label="Close menu">
            <X className="size-5" />
          </button>
        ) : null}
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4" aria-label="Main">
        {navGroups.map((group, gi) => (
          <div key={group.label ?? gi} className="space-y-1">
            {group.label ? (
              <p className={cn("px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-navy-muted/70", collapsed && !mobileOpen && "sr-only")}>
                {t(group.label)}
              </p>
            ) : null}
            {group.items.map((item) => {
              const isActive = active(item.path);
              return (
                <Tooltip key={item.path} content={t(item.title)} side="left" className={collapsed && !mobileOpen ? "" : "hidden"}>
                  <NavLink
                    to={item.path}
                    onClick={() => mobileOpen && setMobileOpen(false)}
                    className={link(item.path)}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <item.icon className="size-[18px] shrink-0" aria-hidden />
                    <span className={cn("flex-1 truncate", collapsed && !mobileOpen && "sr-only")}>
                      {t(item.title)}
                    </span>
                    {item.badge ? (
                      <Badge variant={item.badge.kind} size="sm" className={collapsed && !mobileOpen ? "hidden" : ""}>
                        {item.badge.value}
                      </Badge>
                    ) : null}
                    {isActive ? (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-0 -z-10 rounded-lg bg-navy-2"
                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                      />
                    ) : null}
                  </NavLink>
                </Tooltip>
              );
            })}
          </div>
        ))}
      </nav>

      {accessory}

      <div className={cn("border-t border-white/5 p-3", collapsed && !mobileOpen && "flex justify-center")}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-navy-muted transition-colors hover:bg-navy-2 hover:text-navy-foreground",
            collapsed && !mobileOpen && "w-auto",
          )}
        >
          <ChevronLeft className={cn("size-4 rtl:rotate-180", collapsed && !mobileOpen && "rotate-180 rtl:rotate-0")} />
          {!collapsed || mobileOpen ? <span>{collapsed ? "Expand" : "Collapse"}</span> : null}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside
        className={cn(
          "sticky top-0 z-[30] hidden h-screen shrink-0 bg-navy transition-[width] duration-200 lg:block",
          collapsed ? "w-16" : "w-64",
        )}
      >
        {nav}
      </aside>

      {/* Mobile */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-[30] lg:hidden">
          <div className="absolute inset-0 bg-slate-950/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 start-0 w-72 bg-navy shadow-xl">{nav}</aside>
        </div>
      ) : null}
    </>
  );
}
