import type { DocumentLine, DocumentTotals } from "@esp/types";

export function buildTotals(
  lines: Array<Pick<DocumentLine, "qty" | "unitPrice" | "discountPct" | "taxRate">>,
  discountPct = 0,
  currency = "IQD",
): DocumentTotals {
  const subtotal = lines.reduce(
    (acc, l) => acc + l.qty * l.unitPrice * (1 - l.discountPct / 100),
    0,
  );
  const discount = subtotal * (discountPct / 100);
  const afterDiscount = subtotal - discount;
  const tax = lines.reduce(
    (acc, l) => acc + l.qty * l.unitPrice * (1 - l.discountPct / 100) * (l.taxRate / 100),
    0,
  );
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    total: Math.round((afterDiscount + tax) * 100) / 100,
    currency,
  };
}

/** Next sequential document code for a collection (e.g. INV-2026-0005). */
export async function nextCode(
  collection: Array<{ code: string }>,
  prefix: string,
): Promise<string> {
  const year = new Date().getFullYear();
  const regex = new RegExp(`^${prefix}-${year}-(\\d+)$`);
  let max = 0;
  for (const item of collection) {
    const match = item.code.match(regex);
    if (match) max = Math.max(max, Number(match[1]));
  }
  return `${prefix}-${year}-${String(max + 1).padStart(4, "0")}`;
}
