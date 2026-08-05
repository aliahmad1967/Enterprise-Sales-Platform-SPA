import { describe, expect, it } from "vitest";
import { clamp, debounce, groupBy, initials, slugify, sumBy, truncate, uid } from "./guards";
import { cn } from "./cn";

describe("guards", () => {
  it("cn merges and de-duplicates tailwind classes", () => {
    expect(cn("px-2", "px-3", "bg-white")).toBe("px-3 bg-white");
    expect(cn(false, null, undefined, "block")).toBe("block");
  });

  it("clamp bounds values", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-3, 0, 10)).toBe(0);
    expect(clamp(42, 0, 10)).toBe(10);
  });

  it("sumBy sums a picked field", () => {
    expect(sumBy([{ n: 1 }, { n: 2 }, { n: 3 }], (x) => x.n)).toBe(6);
  });

  it("slugify normalizes mixed input", () => {
    expect(slugify("أحمد Al-Saud")).toBe("أحمد-al-saud");
    expect(slugify("  Hello, World!  ")).toBe("hello-world");
  });

  it("initials from first and last word", () => {
    expect(initials("Ahmed Al-Malki")).toBe("AA");
    expect(initials("سارة")).toBe("س");
  });

  it("truncate respects max length", () => {
    expect(truncate("abcdef", 3)).toBe("ab…");
    expect(truncate("ab", 3)).toBe("ab");
  });

  it("groupBy buckets by key", () => {
    const items = [{ k: "a" }, { k: "b" }, { k: "a" }];
    const groups = groupBy(items, (x) => x.k);
    expect(groups.get("a")?.length).toBe(2);
    expect(groups.get("b")?.length).toBe(1);
  });

  it("uid produces unique, prefixed ids", () => {
    const a = uid("ln");
    const b = uid("ln");
    expect(a).toMatch(/^ln_/);
    expect(a).not.toBe(b);
  });

  it("debounce coalesces calls", async () => {
    let calls = 0;
    const fn = debounce(() => {
      calls += 1;
    }, 30);
    fn();
    fn();
    fn();
    await new Promise((r) => setTimeout(r, 60));
    expect(calls).toBe(1);
    fn.cancel();
  });
});
