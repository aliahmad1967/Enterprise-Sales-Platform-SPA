import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CornerDownLeft, FilePlus2, FileText, Package, Search, UserPlus } from "lucide-react";
import { useKeyDown } from "@esp/hooks";
import { useGlobalSearch } from "@esp/services";
import { cn } from "@esp/utils";
import { Kbd } from "@esp/ui";
import { useI18n } from "@/i18n";
import { useUiStore } from "@/state/ui";
import { allPaths } from "@/app/nav";

interface CommandItem {
  id: string;
  group: string;
  label: string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  run: () => void;
  keywords: string[];
}

export function CommandPalette() {
  const { t } = useI18n();
  const open = useUiStore((s) => s.commandOpen);
  const setOpen = useUiStore((s) => s.setCommandOpen);
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: searchResults } = useGlobalSearch(query, open);

  useKeyDown(["k"], (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      setOpen(!open);
    }
  });

  const go = (path: string) => {
    navigate(path);
    close();
  };
  const close = () => {
    setOpen(false);
    setQuery("");
    setHighlight(0);
  };

  const items = useMemo<CommandItem[]>(() => {
    const q = query.trim().toLowerCase();
    const list: CommandItem[] = [
      {
        id: "new-invoice",
        group: "create",
        label: t("sales.newInvoice"),
        icon: FilePlus2,
        run: () => go("/sales/invoices?new=1"),
        keywords: ["invoice", "فاتورة", "create"],
      },
      {
        id: "new-customer",
        group: "create",
        label: t("customer.add"),
        icon: UserPlus,
        run: () => go("/crm/customers?new=1"),
        keywords: ["customer", "عميل"],
      },
      {
        id: "new-product",
        group: "create",
        label: t("inventory.addProduct"),
        icon: Package,
        run: () => go("/inventory/products?new=1"),
        keywords: ["product", "منتج"],
      },
      ...allPaths.map((p) => ({
        id: `nav-${p.path}`,
        group: t("cmd.navigate"),
        label: t(p.label),
        icon: p.icon,
        run: () => go(p.path),
        keywords: [t(p.label)],
      })),
    ];

    if (q) {
      const filtered = list.filter(
        (i) =>
          i.label.toLowerCase().includes(q) ||
          i.keywords.some((k) => k.toLowerCase().includes(q)),
      );
      const search = (searchResults ?? []).map((r) => ({
        id: `res-${r.kind}-${r.id}`,
        group: t("cmd.search"),
        label: r.title,
        hint: r.code,
        icon: r.kind === "invoice" ? FileText : r.kind === "product" ? Package : Search,
        run: () => go(r.path),
        keywords: [r.title, r.code],
      }));
      return [...filtered, ...search];
    }
    return list.slice(0, 24);
  }, [query, searchResults, t]);

  const visible = open
    ? query
      ? items
      : items.filter((i) => i.group === t("cmd.create") || i.group === t("cmd.navigate"))
    : [];

  return (
    <div
      className={cn("fixed inset-0 z-[110] hidden items-start justify-center p-4 pt-[12vh] sm:flex", !open && "pointer-events-none")}
      role="dialog"
      aria-modal="true"
      aria-label={t("cmd.title")}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: open ? 1 : 0 }}
        transition={{ duration: 0.15 }}
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]"
      />
      <motion.div
        initial={{ opacity: 0, y: -12, scale: 0.98 }}
        animate={{ opacity: open ? 1 : 0, y: open ? 0 : -12, scale: open ? 1 : 0.98 }}
        transition={{ duration: 0.18 }}
        className={cn(
          "relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-surface shadow-xl",
          !open && "pointer-events-none",
        )}
      >
        <div className="flex items-center gap-2.5 border-b border-border px-4">
          <Search className="size-4 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setHighlight(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setHighlight((h) => Math.min(h + 1, visible.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setHighlight((h) => Math.max(h - 1, 0));
              } else if (e.key === "Enter") {
                const item = visible[highlight];
                if (item) item.run();
              } else if (e.key === "Escape") {
                close();
              }
            }}
            placeholder={t("cmd.placeholder")}
            className="h-14 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            autoFocus
          />
          <Kbd>Esc</Kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2" onMouseDown={(e) => e.stopPropagation()}>
          {visible.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">{t("common.noResults")}</p>
          ) : (
            visible.map((item, i) => (
              <button
                key={item.id}
                onClick={item.run}
                onMouseEnter={() => setHighlight(i)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-start text-sm text-foreground",
                  i === highlight && "bg-muted",
                )}
              >
                <item.icon className="size-4 shrink-0 text-muted-foreground" />
                <span className="flex-1 truncate">{item.label}</span>
                {item.hint ? <span className="text-xs text-muted-foreground">{item.hint}</span> : null}
                {i === highlight ? <ArrowRight className="size-3.5 rtl:rotate-180" /> : null}
              </button>
            ))
          )}
        </div>

        <div className="flex items-center gap-3 border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Kbd>↑↓</Kbd> {t("cmd.navigate")}
          </span>
          <span className="flex items-center gap-1">
            <CornerDownLeft className="size-3" /> {t("common.submit")}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
