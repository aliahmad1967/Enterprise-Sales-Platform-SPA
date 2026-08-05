import Dexie, { type Table } from "dexie";
import type {
  Activity,
  AuditLog,
  Bill,
  Branch,
  Contact,
  CreditNote,
  Customer,
  Invoice,
  JournalEntry,
  Lead,
  Location,
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
import { seedDatabase } from "./seed";

export interface EspDatabase extends Dexie {
  branches: Table<Branch, string>;
  users: Table<User, string>;
  roles: Table<Role, string>;
  customers: Table<Customer, string>;
  contacts: Table<Contact, string>;
  leads: Table<Lead, string>;
  activities: Table<Activity, string>;
  products: Table<Product, string>;
  priceLists: Table<PriceList, string>;
  warehouses: Table<Warehouse, string>;
  locations: Table<Location, string>;
  stockItems: Table<StockItem, string>;
  stockMoves: Table<StockMove, string>;
  quotations: Table<Quotation, string>;
  orders: Table<SalesOrder, string>;
  invoices: Table<Invoice, string>;
  payments: Table<Payment, string>;
  creditNotes: Table<CreditNote, string>;
  suppliers: Table<Supplier, string>;
  purchaseOrders: Table<PurchaseOrder, string>;
  bills: Table<Bill, string>;
  journalEntries: Table<JournalEntry, string>;
  workflows: Table<WorkflowDef, string>;
  auditLogs: Table<AuditLog, string>;
}

let db: EspDatabase | undefined;

/** Bump this whenever seed data changes so existing installs reseed on next open. */
const SEED_VERSION = 2;
const SEED_VERSION_KEY = "esp.seedVersion";

function createDb(): EspDatabase {
  const database = new Dexie("esp") as EspDatabase;
  database.version(1).stores({
    branches: "id, code, updatedAt",
    users: "id, roleId, active, updatedAt",
    roles: "id, name, updatedAt",
    customers: "id, code, name, tier, phone, updatedAt",
    contacts: "id, customerId, updatedAt",
    leads: "id, code, stage, ownerId, updatedAt",
    activities: "id, customerId, leadId, type, done, updatedAt",
    products: "id, sku, barcode, category, name, updatedAt",
    priceLists: "id, name, updatedAt",
    warehouses: "id, code, updatedAt",
    locations: "id, warehouseId, updatedAt",
    stockItems: "id, productId, warehouseId, updatedAt",
    stockMoves: "id, productId, warehouseId, type, updatedAt",
    quotations: "id, code, customerId, status, updatedAt",
    orders: "id, code, customerId, branchId, status, updatedAt",
    invoices: "id, code, customerId, branchId, status, issueDate, updatedAt",
    payments: "id, code, invoiceId, customerId, paidAt, updatedAt",
    creditNotes: "id, code, invoiceId, updatedAt",
    suppliers: "id, code, name, updatedAt",
    purchaseOrders: "id, code, supplierId, status, updatedAt",
    bills: "id, code, supplierId, status, updatedAt",
    journalEntries: "id, code, date, updatedAt",
    workflows: "id, code, updatedAt",
    auditLogs: "id, actorId, resource, action, updatedAt",
  });
  database.on("populate", function () {
    void seedDatabase(database);
  });
  database.on("ready", async function () {
    const stored = Number(localStorage.getItem(SEED_VERSION_KEY) ?? 0);
    if (stored === SEED_VERSION) return;
    await Promise.all(Object.values(database.tables).map((t) => t.clear()));
    await seedDatabase(database);
    localStorage.setItem(SEED_VERSION_KEY, String(SEED_VERSION));
  });
  return database;
}

/** Synchronous handle to the offline database (lazily created). */
export function getDatabase(): EspDatabase {
  db ??= createDb();
  return db;
}

/** Get (and lazily open) the offline database. */
export async function getDb(): Promise<EspDatabase> {
  const database = getDatabase();
  await database.open();
  return database;
}

export async function resetDb(): Promise<void> {
  if (db) {
    db.close();
    db = undefined;
  }
  await Dexie.delete("esp");
}
