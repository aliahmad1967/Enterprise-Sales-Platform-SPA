import { describe, expect, it } from "vitest";
import {
  formatDate,
  formatMoney,
  formatMoneyCompact,
  formatNumber,
  formatNumberFixed,
  relativeTime,
} from "./format";

describe("format", () => {
  it("formatMoney renders currency with 2 decimals", () => {
    expect(formatMoney(1234.5, "SAR", "en")).toBe("SAR 1,234.50");
    expect(formatMoney(0, "SAR", "ar")).toContain("0");
  });

  it("formatMoney renders IQD with no decimals", () => {
    expect(formatMoney(1234, "IQD", "en")).toBe("IQD\u00A01,234");
    expect(formatMoney(0, "IQD", "ar")).toContain("0");
  });

  it("formatMoneyCompact scales big values", () => {
    expect(formatMoneyCompact(2_400_000, "IQD", "en")).toBe("2.4M IQD");
    expect(formatMoneyCompact(1500, "IQD", "en")).toBe("1.5K IQD");
  });

  it("formatNumber uses latin digits in Arabic for consistency", () => {
    expect(formatNumber(1234, "ar")).toBe("1,234");
    expect(formatNumber(1234, "en")).toBe("1,234");
  });

  it("formatNumberFixed rounds to given digits", () => {
    expect(formatNumberFixed(1.005, 2, "en")).toBe("1.01");
  });

  it("formatDate renders a date", () => {
    const d = new Date(2026, 0, 5);
    expect(formatDate(d, "en")).toContain("Jan");
  });

  it("relativeTime handles minutes and days", () => {
    const now = Date.now();
    expect(relativeTime(now - 5 * 60 * 1000, "en")).toContain("minute");
    expect(relativeTime(now - 2 * 86400000, "en")).toContain("days");
  });
});
