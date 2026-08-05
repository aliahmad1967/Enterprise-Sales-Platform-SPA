/** Utility guards and small pure helpers (no deps). */

export function isNil(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function sum(values: readonly number[]): number {
  return values.reduce((acc, v) => acc + (Number.isFinite(v) ? v : 0), 0);
}

export function sumBy<T>(values: readonly T[], pick: (item: T) => number): number {
  return values.reduce((acc, v) => acc + (Number.isFinite(pick(v)) ? pick(v) : 0), 0);
}

export function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1).trimEnd()}…`;
}

/** Convert an Arabic/Latin mixed string to a URL/ID safe slug. */
export function slugify(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0]?.charAt(0) ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? "") : "";
  return (first + last).toUpperCase();
}

export function uid(prefix = ""): string {
  const raw =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return prefix ? `${prefix}_${raw}` : raw;
}

export function groupBy<T, K extends string | number>(
  values: readonly T[],
  keyOf: (item: T) => K,
): Map<K, T[]> {
  const map = new Map<K, T[]>();
  for (const v of values) {
    const key = keyOf(v);
    const bucket = map.get(key);
    if (bucket) bucket.push(v);
    else map.set(key, [v]);
  }
  return map;
}

export function toPct(part: number, total: number): number {
  if (total <= 0) return 0;
  return (part / total) * 100;
}

export function debounce<A extends unknown[]>(
  fn: (...args: A) => void,
  wait = 250,
): ((...args: A) => void) & { cancel: () => void } {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const debounced = (...args: A) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
  debounced.cancel = () => {
    if (timer) clearTimeout(timer);
    timer = undefined;
  };
  return debounced;
}

/** Deep-freeze helper used to keep seeded "reference" data immutable. */
export function asConst<T>(value: T): T {
  return value;
}
