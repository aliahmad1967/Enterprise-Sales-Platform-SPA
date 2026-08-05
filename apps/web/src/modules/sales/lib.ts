import type { DocumentLine, Invoice, PaymentMethod, Quotation, SalesOrder } from "@esp/types";
import { nextCode } from "@esp/services";
import { uid } from "@esp/utils";

export const invoiceStatusTone: Record<Invoice["status"], "neutral" | "success" | "warning" | "danger" | "info" | "outline"> = {
  draft: "neutral",
  pending: "warning",
  approved: "success",
  confirmed: "info",
  in_transit: "info",
  delivered: "success",
  partially_paid: "info",
  paid: "success",
  overdue: "danger",
  cancelled: "neutral",
  returned: "warning",
  rejected: "danger",
};

export async function buildInvoiceInput(form: {
  customerId: string;
  customerName: string;
  branchId: string;
  paymentMethod: PaymentMethod;
  issueDate: string;
  dueDate: string;
  notes?: string;
  lines: DocumentLine[];
  totals: ReturnType<typeof import("@esp/services").buildTotals>;
  ownerId?: string;
  existing?: Invoice[];
}): Promise<Omit<Invoice, "id" | "createdAt" | "updatedAt" | "revision">> {
  return {
    code: await nextCode(form.existing ?? [], "INV"),
    orderId: undefined,
    customerId: form.customerId,
    customerName: form.customerName,
    branchId: form.branchId,
    status: "pending",
    issueDate: form.issueDate,
    dueDate: form.dueDate,
    lines: form.lines,
    totals: form.totals,
    paymentMethod: form.paymentMethod,
    installmentCount: 0,
    installments: [],
    paidAmount: 0,
    ownerId: form.ownerId,
    notes: form.notes,
  };
}

export function buildOrderInput(form: {
  customerId: string;
  customerName: string;
  branchId: string;
  paymentMethod: PaymentMethod;
  discountPct: number;
  deliveryDate?: string;
  notes?: string;
  lines: DocumentLine[];
  totals: ReturnType<typeof import("@esp/services").buildTotals>;
  existing?: SalesOrder[];
}): Promise<Omit<SalesOrder, "id" | "createdAt" | "updatedAt" | "revision">> {
  return nextCode(form.existing ?? [], "SO").then((code) => ({
    code,
    customerId: form.customerId,
    customerName: form.customerName,
    branchId: form.branchId,
    status: "confirmed",
    lines: form.lines,
    totals: form.totals,
    paymentMethod: form.paymentMethod,
    discountPct: form.discountPct,
    deliveryDate: form.deliveryDate,
    notes: form.notes,
  }));
}

export function buildQuotationInput(form: {
  customerId: string;
  customerName: string;
  branchId: string;
  paymentMethod: PaymentMethod;
  validUntil?: string;
  notes?: string;
  lines: DocumentLine[];
  totals: ReturnType<typeof import("@esp/services").buildTotals>;
  existing?: Quotation[];
}): Promise<Omit<Quotation, "id" | "createdAt" | "updatedAt" | "revision">> {
  return nextCode(form.existing ?? [], "QT").then((code) => ({
    code,
    customerId: form.customerId,
    customerName: form.customerName,
    status: "draft",
    lines: form.lines,
    totals: form.totals,
    validUntil: form.validUntil,
    notes: form.notes,
  }));
}

export const linePlaceholder = (): DocumentLine => ({
  id: uid(),
  productId: "",
  sku: "",
  name: "",
  qty: 1,
  unitPrice: 0,
  discountPct: 0,
  taxRate: 0,
});
