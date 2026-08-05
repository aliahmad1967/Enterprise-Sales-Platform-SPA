import { useQuery } from "@tanstack/react-query";
import type {
  Activity,
  AuditLog,
  Bill,
  Branch,
  Contact,
  CreditNote,
  Customer,
  DashboardData,
  ID,
  Invoice,
  JournalEntry,
  Lead,
  Location as StockLocation,
  PageRequest,
  Payment,
  PriceList,
  Product,
  PurchaseOrder,
  Quotation,
  Role,
  SalesOrder,
  StockItem,
  StockMove,
  Supplier,
  User,
  Warehouse,
  WorkflowDef,
} from "@esp/types";
import { computeDashboard } from "./analytics";
import { getDatabase } from "./db/database";
import { createHooks } from "./hooks";
import { keys } from "./keys";
import { LocalRepository } from "./repo/repository";

const db = getDatabase();

export const repositories = {
  customers: new LocalRepository<Customer>(db.customers, (c) =>
    [c.code, c.name, c.nameAr ?? "", c.email ?? "", c.phone ?? ""].join(" "),
  ),
  contacts: new LocalRepository<Contact>(db.contacts, (c) =>
    [c.name, c.role ?? "", c.email ?? ""].join(" "),
  ),
  leads: new LocalRepository<Lead>(db.leads, (l) =>
    [l.code, l.name, l.company ?? "", l.email ?? "", l.phone ?? ""].join(" "),
  ),
  activities: new LocalRepository<Activity>(db.activities, (a) =>
    [a.title, a.type, a.description ?? ""].join(" "),
  ),
  products: new LocalRepository<Product>(db.products, (p) =>
    [p.sku, p.barcode ?? "", p.name, p.nameAr ?? "", p.category ?? ""].join(" "),
  ),
  priceLists: new LocalRepository<PriceList>(db.priceLists, (p) => p.name),
  warehouses: new LocalRepository<Warehouse>(db.warehouses, (w) =>
    [w.code, w.name, w.nameAr ?? ""].join(" "),
  ),
  locations: new LocalRepository<StockLocation>(db.locations, (l) =>
    [l.code, l.name].join(" "),
  ),
  stockItems: new LocalRepository<StockItem>(db.stockItems, (s) =>
    [s.productId, s.lotNumber ?? "", s.serialNumber ?? ""].join(" "),
  ),
  stockMoves: new LocalRepository<StockMove>(db.stockMoves, (m) =>
    [m.type, m.reason ?? "", m.refCode ?? ""].join(" "),
  ),
  quotations: new LocalRepository<Quotation>(db.quotations, (q) =>
    [q.code, q.customerName, q.status].join(" "),
  ),
  orders: new LocalRepository<SalesOrder>(db.orders, (o) =>
    [o.code, o.customerName, o.status].join(" "),
  ),
  invoices: new LocalRepository<Invoice>(db.invoices, (i) =>
    [i.code, i.customerName, i.status].join(" "),
  ),
  payments: new LocalRepository<Payment>(db.payments, (p) =>
    [p.code, p.customerName, p.reference ?? ""].join(" "),
  ),
  creditNotes: new LocalRepository<CreditNote>(db.creditNotes, (c) =>
    [c.code, c.customerName, c.reason].join(" "),
  ),
  suppliers: new LocalRepository<Supplier>(db.suppliers, (s) =>
    [s.code, s.name, s.nameAr ?? ""].join(" "),
  ),
  purchaseOrders: new LocalRepository<PurchaseOrder>(db.purchaseOrders, (p) =>
    [p.code, p.supplierName, p.status].join(" "),
  ),
  bills: new LocalRepository<Bill>(db.bills, (b) => [b.code, b.supplierName].join(" ")),
  journalEntries: new LocalRepository<JournalEntry>(db.journalEntries, (j) =>
    [j.code, j.description ?? ""].join(" "),
  ),
  workflows: new LocalRepository<WorkflowDef>(db.workflows, (w) =>
    [w.code, w.name, w.nameAr ?? ""].join(" "),
  ),
  auditLogs: new LocalRepository<AuditLog>(db.auditLogs, (a) =>
    [a.actorName, a.action, a.resource].join(" "),
  ),
  branches: new LocalRepository<Branch>(db.branches, (b) =>
    [b.code, b.name, b.nameAr ?? ""].join(" "),
  ),
  users: new LocalRepository<User>(db.users, (u) =>
    [u.name, u.nameAr ?? "", u.email, u.username].join(" "),
  ),
  roles: new LocalRepository<Role>(db.roles, (r) => [r.name, r.nameAr ?? ""].join(" ")),
};

export const customerHooks = createHooks("customers", repositories.customers);
export const contactHooks = createHooks("contacts", repositories.contacts);
export const leadHooks = createHooks("leads", repositories.leads);
export const activityHooks = createHooks("activities", repositories.activities);
export const productHooks = createHooks("products", repositories.products);
export const warehouseHooks = createHooks("warehouses", repositories.warehouses);
export const stockItemHooks = createHooks("stockItems", repositories.stockItems);
export const stockMoveHooks = createHooks("stockMoves", repositories.stockMoves);
export const quotationHooks = createHooks("quotations", repositories.quotations);
export const orderHooks = createHooks("orders", repositories.orders);
export const invoiceHooks = createHooks("invoices", repositories.invoices);
export const paymentHooks = createHooks("payments", repositories.payments);
export const creditNoteHooks = createHooks("creditNotes", repositories.creditNotes);
export const supplierHooks = createHooks("suppliers", repositories.suppliers);
export const purchaseOrderHooks = createHooks("purchaseOrders", repositories.purchaseOrders);
export const billHooks = createHooks("bills", repositories.bills);
export const branchHooks = createHooks("branches", repositories.branches);
export const userHooks = createHooks("users", repositories.users);
export const roleHooks = createHooks("roles", repositories.roles);
export const journalHooks = createHooks("journalEntries", repositories.journalEntries);
export const workflowHooks = createHooks("workflows", repositories.workflows);
export const auditHooks = createHooks("auditLogs", repositories.auditLogs);

/* ---------------- Dashboard ---------------- */

export async function loadDashboard(): Promise<DashboardData> {
  const [invoices, payments, orders, customers, leads, products, stockItems, branches, users, creditNotes] =
    await Promise.all([
      db.invoices.toArray(),
      db.payments.toArray(),
      db.orders.toArray(),
      db.customers.toArray(),
      db.leads.toArray(),
      db.products.toArray(),
      db.stockItems.toArray(),
      db.branches.toArray(),
      db.users.toArray(),
      db.creditNotes.toArray(),
    ]);
  return computeDashboard({
    invoices,
    payments,
    orders,
    customers,
    leads,
    products,
    stockItems,
    branches,
    users,
    creditNotes,
  });
}

export function useDashboard() {
  return useQuery({
    queryKey: keys.dashboard,
    queryFn: loadDashboard,
  });
}

/* ---------------- Global search ---------------- */

export interface GlobalSearchResult {
  kind: "customer" | "product" | "invoice" | "order" | "supplier" | "user" | "lead";
  id: string;
  code: string;
  title: string;
  subtitle?: string;
  path: string;
}

export async function searchAll(query: string, limit = 6): Promise<GlobalSearchResult[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const contains = (value: string | undefined) => value?.toLowerCase().includes(q) ?? false;

  const [customers, products, invoices, orders, suppliers, users, leads] = await Promise.all([
    db.customers.toArray(),
    db.products.toArray(),
    db.invoices.toArray(),
    db.orders.toArray(),
    db.suppliers.toArray(),
    db.users.toArray(),
    db.leads.toArray(),
  ]);

  const results: GlobalSearchResult[] = [];
  const push = (item: GlobalSearchResult) => {
    if (results.length < limit) results.push(item);
  };

  for (const c of customers) {
    if (contains(c.name) || contains(c.nameAr) || contains(c.code) || contains(c.phone))
      push({ kind: "customer", id: c.id, code: c.code, title: c.name, subtitle: c.phone, path: `/crm/customers/${c.id}` });
  }
  for (const p of products) {
    if (contains(p.name) || contains(p.nameAr) || contains(p.sku) || contains(p.barcode))
      push({ kind: "product", id: p.id, code: p.sku, title: p.name, subtitle: p.barcode, path: `/inventory/products/${p.id}` });
  }
  for (const i of invoices) {
    if (contains(i.code) || contains(i.customerName))
      push({ kind: "invoice", id: i.id, code: i.code, title: `${i.code} — ${i.customerName}`, subtitle: i.status, path: `/sales/invoices/${i.id}` });
  }
  for (const o of orders) {
    if (contains(o.code) || contains(o.customerName))
      push({ kind: "order", id: o.id, code: o.code, title: `${o.code} — ${o.customerName}`, subtitle: o.status, path: `/sales/orders/${o.id}` });
  }
  for (const s of suppliers) {
    if (contains(s.name) || contains(s.code))
      push({ kind: "supplier", id: s.id, code: s.code, title: s.name, path: `/purchasing/suppliers/${s.id}` });
  }
  for (const u of users) {
    if (contains(u.name) || contains(u.email) || contains(u.username))
      push({ kind: "user", id: u.id, code: u.username, title: u.name, path: `/admin/users/${u.id}` });
  }
  for (const l of leads) {
    if (contains(l.name) || contains(l.code) || contains(l.company))
      push({ kind: "lead", id: l.id, code: l.code, title: l.name, subtitle: l.company, path: `/crm/leads/${l.id}` });
  }

  return results;
}

export function useGlobalSearch(query: string, enabled = true) {
  return useQuery({
    queryKey: keys.search(query),
    queryFn: () => searchAll(query),
    enabled: enabled && query.trim().length > 0,
    placeholderData: (prev) => prev,
  });
}

/* ---------------- Activities ---------------- */

export function useActivityByEntity(kind: "customer" | "lead", id: ID | undefined) {
  return useQuery({
    queryKey: keys.activitiesFor(kind, id),
    queryFn: async () => {
      const all = await db.activities.toArray();
      return all
        .filter((a) =>
          kind === "customer" ? a.customerId === id : a.leadId === id,
        )
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
    enabled: Boolean(id),
  });
}

/* ---------------- Re-exports ---------------- */

export * from "./analytics";
export { buildTotals, nextCode } from "./documents";
export { getDb, getDatabase, resetDb } from "./db/database";
export type { EspDatabase } from "./db/database";
export { http, setAuthTokens, clearAuth, endpoints } from "./client/httpClient";
export { LocalRepository, matchesRequest, getPath } from "./repo/repository";
export type { Repository, SearchProjector } from "./repo/repository";
export { keys } from "./keys";
export type { EntityName } from "./keys";
export { createHooks } from "./hooks";
export type { EntityHooks } from "./hooks";

export type { PageRequest };
