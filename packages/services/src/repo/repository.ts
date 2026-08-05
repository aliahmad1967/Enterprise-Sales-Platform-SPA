import type { Entity, ID, Page, PageRequest } from "@esp/types";
import { uid } from "@esp/utils";
import type { Table } from "dexie";

/** Contract implemented by both the offline repo and the future API adapter. */
export interface Repository<T extends Entity> {
  list(request?: PageRequest): Promise<Page<T>>;
  getAll(): Promise<T[]>;
  getById(id: ID): Promise<T | undefined>;
  create(input: Omit<T, "id" | "createdAt" | "updatedAt" | "revision">): Promise<T>;
  update(id: ID, patch: Partial<Omit<T, "id" | "createdAt">>): Promise<T>;
  remove(id: ID): Promise<void>;
}

/** Case-insensitive substring search over a projection of the entity. */
export type SearchProjector<T> = (item: T) => string;

export function matchesRequest<T extends Entity>(
  items: readonly T[],
  request: PageRequest | undefined,
  searchProjector: SearchProjector<T>,
  filterPath: (item: T, path: string) => unknown,
): T[] {
  if (!request) return [...items];
  let result = [...items];

  const q = request.search?.trim().toLowerCase();
  if (q) {
    result = result.filter((item) => searchProjector(item).toLowerCase().includes(q));
  }

  const filters = request.filters;
  if (filters) {
    result = result.filter((item) =>
      Object.entries(filters).every(([path, expected]) => {
        if (expected === null || expected === "") return true;
        const value = filterPath(item, path);
        if (value === undefined) return false;
        return matchValue(value, expected);
      }),
    );
  }

  if (request.sortBy) {
    const dir = request.sortDir === "desc" ? -1 : 1;
    result.sort((a, b) => {
      const av = filterPath(a, request.sortBy!);
      const bv = filterPath(b, request.sortBy!);
      return compareValues(av, bv) * dir;
    });
  }

  return result;
}

function matchValue(actual: unknown, expected: string | number | boolean): boolean {
  if (typeof expected === "number") return actual === expected;
  if (typeof expected === "boolean") return actual === expected;
  return String(actual).toLowerCase().includes(expected.toLowerCase());
}

function compareValues(a: unknown, b: unknown): number {
  if (a === b) return 0;
  if (a === undefined || a === null) return -1;
  if (b === undefined || b === null) return 1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b));
}

export function getPath(value: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>((acc, key) => {
      if (acc === undefined || acc === null) return undefined;
      if (Array.isArray(acc)) {
        const idx = Number(key);
        return Number.isFinite(idx) ? acc[idx] : undefined;
      }
      if (typeof acc === "object") return (acc as Record<string, unknown>)[key];
      return undefined;
    }, value);
}

/** In-memory + IndexedDB repository (offline-first adapter). */
export class LocalRepository<T extends Entity> implements Repository<T> {
  constructor(
    private readonly table: Table<T, string>,
    private readonly searchProjector: SearchProjector<T>,
  ) {}

  private filterPath(item: T, path: string): unknown {
    return getPath(item, path);
  }

  async list(request?: PageRequest): Promise<Page<T>> {
    const all = await this.table.toArray();
    const matched = matchesRequest(all, request, this.searchProjector, this.filterPath);
    const page = request?.page ?? 1;
    const pageSize = request?.pageSize ?? 25;
    const total = matched.length;
    const start = (page - 1) * pageSize;
    return {
      items: matched.slice(start, start + pageSize),
      page,
      pageSize,
      total,
    };
  }

  async getAll(): Promise<T[]> {
    return this.table.toArray();
  }

  async getById(id: ID): Promise<T | undefined> {
    return this.table.get(id);
  }

  async create(input: Omit<T, "id" | "createdAt" | "updatedAt" | "revision">): Promise<T> {
    const now = new Date().toISOString();
    const row = {
      ...input,
      id: uid(),
      createdAt: now,
      updatedAt: now,
      revision: 1,
    } as T;
    await this.table.add(row);
    return row;
  }

  async update(id: ID, patch: Partial<Omit<T, "id" | "createdAt">>): Promise<T> {
    const prev = await this.table.get(id);
    if (!prev) throw new Error(`Record not found: ${id}`);
    const next = {
      ...prev,
      ...patch,
      id,
      updatedAt: new Date().toISOString(),
      revision: prev.revision + 1,
    } as T;
    await this.table.put(next);
    return next;
  }

  async remove(id: ID): Promise<void> {
    await this.table.delete(id);
  }
}
