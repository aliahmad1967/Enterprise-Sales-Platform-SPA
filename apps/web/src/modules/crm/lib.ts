import type { Customer, Lead } from "@esp/types";
import { uid } from "@esp/utils";
import type { CustomerFormValues } from "./components/CustomerForm";
import type { LeadFormValues } from "./components/LeadForm";

const code = (prefix: string) =>
  `${prefix}-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;

export function toCustomerInput(values: CustomerFormValues): Omit<Customer, "id" | "createdAt" | "updatedAt" | "revision"> {
  return {
    code: code("CUS"),
    name: values.name,
    nameAr: values.nameAr || undefined,
    email: values.email || undefined,
    phone: values.phone || undefined,
    taxNumber: values.taxNumber || undefined,
    tier: values.tier,
    segment: values.segment || undefined,
    tags: [],
    addresses: [],
    creditLimit: { amount: values.creditLimit, currency: "IQD" },
    balance: { amount: 0, currency: "IQD" },
    totalRevenue: { amount: 0, currency: "IQD" },
    totalInvoices: 0,
    since: new Date().toISOString(),
    notes: values.notes || undefined,
  };
}

export function toCustomerPatch(values: CustomerFormValues): Partial<Customer> {
  return {
    name: values.name,
    nameAr: values.nameAr || undefined,
    email: values.email || undefined,
    phone: values.phone || undefined,
    taxNumber: values.taxNumber || undefined,
    tier: values.tier,
    segment: values.segment || undefined,
    creditLimit: { amount: values.creditLimit, currency: "IQD" },
    notes: values.notes || undefined,
  };
}

export function toLeadInput(
  values: LeadFormValues,
  ownerId: string,
): Omit<Lead, "id" | "createdAt" | "updatedAt" | "revision"> {
  return {
    code: code("LD"),
    name: values.name,
    company: values.company || undefined,
    email: values.email || undefined,
    phone: values.phone || undefined,
    source: values.source,
    stage: values.stage,
    value: { amount: values.value, currency: "IQD" },
    probability: values.probability,
    ownerId,
    assignee: undefined,
    tags: [],
    notes: values.notes || undefined,
  };
}

export function toLeadPatch(values: LeadFormValues): Partial<Lead> {
  return {
    name: values.name,
    company: values.company || undefined,
    email: values.email || undefined,
    phone: values.phone || undefined,
    source: values.source,
    stage: values.stage,
    value: { amount: values.value, currency: "IQD" },
    probability: values.probability,
    notes: values.notes || undefined,
  };
}

export const newTempId = () => uid();
