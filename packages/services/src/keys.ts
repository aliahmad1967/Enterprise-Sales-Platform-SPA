import type { PageRequest } from "@esp/types";

/** TanStack Query key factory (collocation with the service layer). */
export const keys = {
  root: ["esp"] as const,
  collection: (name: string, params?: PageRequest) =>
    ["esp", name, "list", params ?? {}] as const,
  one: (name: string, id?: string) => ["esp", name, "one", id ?? ""] as const,
  dashboard: ["esp", "dashboard"] as const,
  analytics: (kind: string) => ["esp", "analytics", kind] as const,
  search: (query: string) => ["esp", "search", query] as const,
  notifications: (userId: string) => ["esp", "notifications", userId] as const,
  activitiesFor: (kind: string, id?: string) => ["esp", "activities", kind, id ?? ""] as const,
};

export type EntityName =
  | "branches"
  | "users"
  | "roles"
  | "customers"
  | "contacts"
  | "leads"
  | "activities"
  | "products"
  | "priceLists"
  | "warehouses"
  | "locations"
  | "stockItems"
  | "stockMoves"
  | "quotations"
  | "orders"
  | "invoices"
  | "payments"
  | "creditNotes"
  | "suppliers"
  | "purchaseOrders"
  | "bills"
  | "journalEntries"
  | "workflows"
  | "auditLogs";
