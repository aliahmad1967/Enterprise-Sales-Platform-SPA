/** Core primitives shared across the SPA and the future API. */

export type ID = string;
export type CurrencyCode = string;

/** Money as a Value Object — decimal semantics, no float drift. */
export interface Money {
  amount: number;
  currency: CurrencyCode;
}

/** Base for every persisted entity (sync-ready). */
export interface Entity {
  id: ID;
  createdAt: string;
  updatedAt: string;
  /** Monotonic revision counter for offline conflict resolution. */
  revision: number;
  /** Client that last wrote this row (used by the sync queue). */
  clientId?: string;
}

export interface Page<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface PageRequest {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  filters?: Record<string, string | number | boolean | null>;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  country: string;
  postalCode?: string;
}

export interface TaxSummary {
  code: string;
  name: string;
  rate: number;
  amount: number;
}
