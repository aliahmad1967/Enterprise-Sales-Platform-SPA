import type { Entity, ID, Money } from "./core";

/** Status enums shared across documents. */
export const DocumentStatus = {
  Draft: "draft",
  Pending: "pending",
  Approved: "approved",
  Confirmed: "confirmed",
  InTransit: "in_transit",
  Delivered: "delivered",
  PartiallyPaid: "partially_paid",
  Paid: "paid",
  Overdue: "overdue",
  Cancelled: "cancelled",
  Returned: "returned",
  Rejected: "rejected",
} as const;
export type DocumentStatus = (typeof DocumentStatus)[keyof typeof DocumentStatus];

export const PaymentMethod = {
  Cash: "cash",
  Card: "card",
  BankTransfer: "bank_transfer",
  Cheque: "cheque",
  Installment: "installment",
  CreditLine: "credit_line",
  DigitalWallet: "digital_wallet",
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

/* ------------------------------------------------------------------ */
/* CRM                                                                 */
/* ------------------------------------------------------------------ */

export type CustomerTier = "bronze" | "silver" | "gold" | "platinum";

export interface Customer extends Entity {
  code: string;
  name: string;
  nameAr?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  taxNumber?: string;
  tier: CustomerTier;
  segment?: string;
  tags: string[];
  addresses: Array<{ label: string; address: string }>;
  creditLimit: Money;
  balance: Money;
  totalRevenue: Money;
  totalInvoices: number;
  since: string;
  notes?: string;
}

export interface Contact extends Entity {
  customerId: ID;
  name: string;
  role?: string;
  email?: string;
  phone?: string;
  isPrimary: boolean;
}

export interface Company extends Entity {
  name: string;
  nameAr?: string;
  industry?: string;
  employees?: number;
  website?: string;
  phone?: string;
  city?: string;
  segment?: string;
}

export interface Lead extends Entity {
  code: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  source: "walk_in" | "website" | "referral" | "campaign" | "social" | "other";
  stage: "new" | "qualified" | "proposal" | "negotiation" | "won" | "lost";
  value: Money;
  probability: number;
  ownerId: ID;
  assignee?: string;
  tags: string[];
  notes?: string;
}

export const ActivityType = {
  Call: "call",
  Meeting: "meeting",
  Visit: "visit",
  Email: "email",
  Note: "note",
  Task: "task",
  WhatsApp: "whatsapp",
  FollowUp: "follow_up",
} as const;
export type ActivityType = (typeof ActivityType)[keyof typeof ActivityType];

export interface Activity extends Entity {
  customerId?: ID;
  leadId?: ID;
  type: ActivityType;
  title: string;
  description?: string;
  dueAt?: string;
  done: boolean;
  doneAt?: string;
  ownerId: ID;
  relatedEntity?: { kind: "invoice" | "order" | "quotation"; id: ID; code: string };
}

export const PipelineStage = {
  New: "new",
  Contacted: "contacted",
  Qualified: "qualified",
  Proposal: "proposal",
  Negotiation: "negotiation",
  Won: "won",
  Lost: "lost",
} as const;
export type PipelineStage = (typeof PipelineStage)[keyof typeof PipelineStage];

/* ------------------------------------------------------------------ */
/* Catalog                                                             */
/* ------------------------------------------------------------------ */

export const ProductKind = {
  Product: "product",
  Service: "service",
  Bundle: "bundle",
} as const;
export type ProductKind = (typeof ProductKind)[keyof typeof ProductKind];

export const CostingMethod = {
  FIFO: "fifo",
  LIFO: "lifo",
  Average: "average",
} as const;
export type CostingMethod = (typeof CostingMethod)[keyof typeof CostingMethod];

export interface Product extends Entity {
  sku: string;
  barcode?: string;
  name: string;
  nameAr?: string;
  category?: string;
  kind: ProductKind;
  unit: string;
  cost: Money;
  price: Money;
  taxRate: number;
  sellable: boolean;
  purchasable: boolean;
  trackStock: boolean;
  stock: number;
  stockMin: number;
  reorderPoint: number;
  image?: string;
  description?: string;
}

export interface PriceList extends Entity {
  name: string;
  currency: string;
  isDefault: boolean;
  rows: Array<{ productId: ID; price: number; minQty?: number }>;
}

/* ------------------------------------------------------------------ */
/* Inventory                                                           */
/* ------------------------------------------------------------------ */

export const StockMoveType = {
  Receive: "receive",
  Issue: "issue",
  Transfer: "transfer",
  Adjustment: "adjustment",
  CycleCount: "cycle_count",
  Return: "return",
  Sold: "sold",
} as const;
export type StockMoveType = (typeof StockMoveType)[keyof typeof StockMoveType];

export interface Warehouse extends Entity {
  code: string;
  name: string;
  nameAr?: string;
  address?: string;
  active: boolean;
}

export interface Location extends Entity {
  warehouseId: ID;
  code: string;
  name: string;
}

export interface StockItem extends Entity {
  productId: ID;
  warehouseId: ID;
  locationId?: ID;
  qty: number;
  /** For lot/batch/serial/expiry tracking. */
  lotNumber?: string;
  batchNumber?: string;
  serialNumber?: string;
  expiryDate?: string;
}

export interface StockMove extends Entity {
  type: StockMoveType;
  productId: ID;
  warehouseId: ID;
  locationId?: ID;
  qty: number;
  unitCost: Money;
  reason?: string;
  refType?: "purchase" | "sale" | "transfer" | "adjustment" | "count";
  refId?: ID;
  refCode?: string;
  createdById: ID;
}

/* ------------------------------------------------------------------ */
/* Sales documents                                                     */
/* ------------------------------------------------------------------ */

export interface DocumentLine {
  id: ID;
  productId: ID;
  sku: string;
  name: string;
  nameAr?: string;
  qty: number;
  unitPrice: number;
  discountPct: number;
  taxRate: number;
  /** Cost snapshot (for profit analytics). */
  cost?: number;
}

export interface DocumentTotals {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  currency: string;
}

export interface Quotation extends Entity {
  code: string;
  customerId: ID;
  customerName: string;
  status: DocumentStatus;
  lines: DocumentLine[];
  totals: DocumentTotals;
  validUntil?: string;
  approvedById?: ID;
  notes?: string;
}

export interface SalesOrder extends Entity {
  code: string;
  quotationId?: ID;
  customerId: ID;
  customerName: string;
  branchId: ID;
  status: DocumentStatus;
  lines: DocumentLine[];
  totals: DocumentTotals;
  paymentMethod: PaymentMethod;
  discountPct: number;
  committedAt?: string;
  deliveryDate?: string;
  notes?: string;
}

export interface Installment extends Entity {
  invoiceId: ID;
  index: number;
  dueDate: string;
  amount: number;
  paid: boolean;
  paidAt?: string;
}

export interface Invoice extends Entity {
  code: string;
  orderId?: ID;
  customerId: ID;
  customerName: string;
  branchId: ID;
  status: DocumentStatus;
  issueDate: string;
  dueDate: string;
  lines: DocumentLine[];
  totals: DocumentTotals;
  paymentMethod: PaymentMethod;
  installmentCount: number;
  installments: Installment[];
  paidAmount: number;
  ownerId?: ID;
  voidedAt?: string;
  recurringId?: ID;
  notes?: string;
}

export interface Payment extends Entity {
  code: string;
  invoiceId?: ID;
  customerId: ID;
  customerName: string;
  method: PaymentMethod;
  amount: Money;
  paidAt: string;
  reference?: string;
  cashierId?: ID;
  pos?: boolean;
}

export interface CreditNote extends Entity {
  code: string;
  invoiceId: ID;
  customerId: ID;
  customerName: string;
  reason: string;
  lines: DocumentLine[];
  totals: DocumentTotals;
  status: DocumentStatus;
  applied: boolean;
}

/* ------------------------------------------------------------------ */
/* Purchasing                                                          */
/* ------------------------------------------------------------------ */

export interface Supplier extends Entity {
  code: string;
  name: string;
  nameAr?: string;
  email?: string;
  phone?: string;
  taxNumber?: string;
  paymentTerms?: string;
  rating: number;
  active: boolean;
  address?: string;
}

export interface PurchaseOrder extends Entity {
  code: string;
  supplierId: ID;
  supplierName: string;
  status: DocumentStatus;
  expectedDate?: string;
  lines: DocumentLine[];
  totals: DocumentTotals;
  received: boolean;
  notes?: string;
}

export interface Bill extends Entity {
  code: string;
  poId?: ID;
  supplierId: ID;
  supplierName: string;
  status: DocumentStatus;
  dueDate: string;
  totals: DocumentTotals;
  paidAmount: number;
  notes?: string;
}

/* ------------------------------------------------------------------ */
/* Accounting                                                          */
/* ------------------------------------------------------------------ */

export interface Account extends Entity {
  code: string;
  name: string;
  nameAr?: string;
  type: "asset" | "liability" | "equity" | "revenue" | "expense";
  parentId?: ID;
  openingBalance: number;
  currency: string;
}

export interface JournalEntry extends Entity {
  code: string;
  date: string;
  description?: string;
  lines: Array<{
    accountId: ID;
    accountName: string;
    debit: number;
    credit: number;
  }>;
  posted: boolean;
  postedAt?: string;
  createdById: ID;
}

/* ------------------------------------------------------------------ */
/* Workflow & audit                                                    */
/* ------------------------------------------------------------------ */

export interface ApprovalRequest extends Entity {
  workflowId: ID;
  entityType: string;
  entityId: ID;
  entityCode: string;
  submittedById: ID;
  status: "pending" | "approved" | "rejected";
  reviewedById?: ID;
  reviewedAt?: string;
  comment?: string;
}

export interface WorkflowDef extends Entity {
  code: string;
  name: string;
  nameAr?: string;
  enabled: boolean;
  trigger: string;
  conditions: Array<{ field: string; op: "eq" | "ne" | "gte" | "lte" | "contains"; value: number | string }>;
  actions: string[];
}

export interface AuditLog extends Entity {
  actorId: ID;
  actorName: string;
  action: string;
  resource: string;
  resourceId?: ID;
  before?: unknown;
  after?: unknown;
  ip?: string;
  device?: string;
  location?: string;
}

export interface AppNotification extends Entity {
  userId: ID;
  title: string;
  body?: string;
  kind: "info" | "success" | "warning" | "danger";
  read: boolean;
  link?: string;
  icon?: string;
}

/* ------------------------------------------------------------------ */
/* Users & auth                                                        */
/* ------------------------------------------------------------------ */

export interface Permission {
  resource: string;
  action: "create" | "read" | "update" | "delete" | "approve" | "*";
}

export interface Role extends Entity {
  name: string;
  nameAr?: string;
  permissions: Permission[];
}

export interface User extends Entity {
  username: string;
  name: string;
  nameAr?: string;
  email: string;
  roleId: ID;
  roleName: string;
  branchIds: ID[];
  active: boolean;
  lastLoginAt?: string;
  avatarColor?: string;
}

export interface Branch extends Entity {
  code: string;
  name: string;
  nameAr?: string;
  active: boolean;
  currency: string;
  address?: string;
}
