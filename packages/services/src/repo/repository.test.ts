import type { Entity, PageRequest } from "@esp/types";
import { describe, expect, it } from "vitest";
import { getPath, matchesRequest } from "./repository";

interface Row extends Entity {
  name: string;
  code: string;
  amount: number;
  active: boolean;
  meta: { total: number };
}

const rows: Row[] = [
  { id: "1", name: "Ahmed Corp", code: "C-1", amount: 100, active: true, meta: { total: 500 }, createdAt: "", updatedAt: "", revision: 1 },
  { id: "2", name: "Sara Store", code: "C-2", amount: 300, active: false, meta: { total: 700 }, createdAt: "", updatedAt: "", revision: 1 },
  { id: "3", name: "ahmed trading", code: "C-3", amount: 200, active: true, meta: { total: 200 }, createdAt: "", updatedAt: "", revision: 1 },
];

const projector = (r: Row) => `${r.name} ${r.code}`;
const path = (r: Row, p: string) => getPath(r, p);

describe("matchesRequest", () => {
  it("filters by case-insensitive search", () => {
    const res = matchesRequest(rows, { search: "ahmed" }, projector, path);
    expect(res.map((r) => r.id)).toEqual(["1", "3"]);
  });

  it("filters by exact value", () => {
    const res = matchesRequest(rows, { filters: { active: true } }, projector, path);
    expect(res.map((r) => r.id)).toEqual(["1", "3"]);
  });

  it("supports dotted paths in filters and sort", () => {
    const res = matchesRequest(
      rows,
      { filters: { "meta.total": 700 } },
      projector,
      path,
    );
    expect(res.map((r) => r.id)).toEqual(["2"]);
  });

  it("sorts by field", () => {
    const res = matchesRequest(rows, { sortBy: "amount", sortDir: "desc" }, projector, path);
    expect(res.map((r) => r.amount)).toEqual([300, 200, 100]);
  });

  it("returns a copy when no request", () => {
    const res = matchesRequest(rows, undefined, projector, path);
    expect(res).toHaveLength(3);
    expect(res).not.toBe(rows);
  });
});

describe("getPath", () => {
  it("resolves nested object paths", () => {
    expect(getPath(rows[0], "meta.total")).toBe(500);
  });
  it("returns undefined for missing paths", () => {
    expect(getPath(rows[0], "nope.deep")).toBeUndefined();
  });
});

describe("request default paging shape", () => {
  it("compiles a page request", () => {
    const req: PageRequest = { page: 1, pageSize: 25, sortBy: "amount", sortDir: "asc" };
    expect(req.sortDir).toBe("asc");
  });
});
