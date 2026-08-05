import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Boxes,
  Building2,
  ClipboardList,
  FileText,
  Gauge,
  Handshake,
  Landmark,
  ListChecks,
  MessageSquareText,
  Package,
  Receipt,
  ScrollText,
  Settings2,
  ShieldCheck,
  ShoppingCart,
  Store,
  Truck,
  UserCog,
  Users,
  UsersRound,
  Wallet,
  Warehouse,
  Workflow,
  Database,
  Activity as ActivityIcon,
  LayoutGrid,
  FileSpreadsheet,
} from "lucide-react";
import type { ArKey } from "@/i18n";

export interface NavItem {
  title: ArKey;
  path: string;
  icon: LucideIcon;
  badge?: { kind: "danger" | "info"; value: string | number };
}

export interface NavGroup {
  label?: ArKey;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    items: [{ title: "nav.dashboard", path: "/", icon: Gauge }],
  },
  {
    label: "nav.crm",
    items: [
      { title: "nav.customers", path: "/crm/customers", icon: Users },
      { title: "nav.leads", path: "/crm/leads", icon: UsersRound },
      { title: "nav.contacts", path: "/crm/contacts", icon: Handshake },
    ],
  },
  {
    label: "nav.sales",
    items: [
      { title: "nav.quotations", path: "/sales/quotations", icon: FileText },
      { title: "nav.orders", path: "/sales/orders", icon: ClipboardList },
      { title: "nav.invoices", path: "/sales/invoices", icon: Receipt },
      { title: "nav.pos", path: "/pos", icon: Store },
    ],
  },
  {
    label: "nav.inventory",
    items: [
      { title: "nav.products", path: "/inventory/products", icon: Package },
      { title: "nav.warehouses", path: "/inventory/warehouses", icon: Warehouse },
      { title: "nav.stockMoves", path: "/inventory/stock-moves", icon: Boxes },
    ],
  },
  {
    label: "nav.purchasing",
    items: [
      { title: "nav.suppliers", path: "/purchasing/suppliers", icon: Truck },
      { title: "nav.purchaseOrders", path: "/purchasing/orders", icon: ShoppingCart },
      { title: "nav.bills", path: "/purchasing/bills", icon: Wallet },
    ],
  },
  {
    label: "nav.accounting",
    items: [
      { title: "nav.journal", path: "/accounting/journal", icon: ScrollText },
      { title: "nav.accounts", path: "/accounting/accounts", icon: Landmark },
    ],
  },
  {
    label: "nav.reports",
    items: [{ title: "nav.reports", path: "/reports", icon: BarChart3 }],
  },
  {
    label: "nav.admin",
    items: [
      { title: "nav.users", path: "/admin/users", icon: UserCog },
      { title: "nav.roles", path: "/admin/roles", icon: ShieldCheck },
      { title: "nav.audit", path: "/admin/audit", icon: ListChecks },
    ],
  },
  {
    label: "nav.settings",
    items: [
      { title: "nav.settings", path: "/settings", icon: Settings2 },
      { title: "nav.workflow", path: "/workflow", icon: Workflow },
      { title: "nav.apiCenter", path: "/api-center", icon: Database },
      { title: "nav.monitoring", path: "/monitoring", icon: ActivityIcon },
    ],
  },
];

/** All navigable paths (for the command palette + global search). */
export const allPaths: Array<{ label: ArKey; path: string; icon: LucideIcon }> = [
  { label: "nav.dashboard", path: "/", icon: LayoutGrid },
  ...navGroups.flatMap((g) => g.items.map((i) => ({ label: i.title, path: i.path, icon: i.icon }))),
];

export const dashboardModuleIcons = {
  FileSpreadsheet,
  MessageSquareText,
  Building2,
};
