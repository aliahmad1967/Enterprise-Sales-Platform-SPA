import type {
  Activity,
  Bill,
  Branch,
  Contact,
  CreditNote,
  Customer,
  DocumentLine,
  Invoice,
  Lead,
  Payment,
  Product,
  PurchaseOrder,
  Quotation,
  Role,
  SalesOrder,
  StockItem,
  StockMove,
  Supplier,
  User,
  Warehouse,
  WorkflowDef,
} from "@esp/types";
import { PaymentMethod } from "@esp/types";
import { uid } from "@esp/utils";
import type { EspDatabase } from "./database";

/* Deterministic PRNG so seeding is reproducible. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260805);
const between = (min: number, max: number) => min + rand() * (max - min);
const int = (min: number, max: number) => Math.round(between(min, max));
const round2 = (n: number) => Math.round(n * 100) / 100;
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)]!;
const chance = (p: number) => rand() < p;

const CURRENCY = "IQD";
const TAX_RATE = 0.15;

function daysAgo(days: number, hour?: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  if (hour !== undefined) {
    d.setHours(hour, int(0, 59), int(0, 59), 0);
  } else {
    d.setHours(int(8, 20), int(0, 59), 0, 0);
  }
  return d.toISOString();
}

function seqCounter(): () => string {
  let n = 0;
  return () => {
    n += 1;
    return n.toString().padStart(4, "0");
  };
}

function lineTotals(
  lines: Array<{ qty: number; unitPrice: number; discountPct: number; taxRate: number }>,
  discountPct = 0,
) {
  const subtotal = lines.reduce(
    (acc, l) => acc + l.qty * l.unitPrice * (1 - l.discountPct / 100),
    0,
  );
  const discount = round2(subtotal * (discountPct / 100));
  const afterDiscount = subtotal - discount;
  const tax = lines.reduce(
    (acc, l) => acc + l.qty * l.unitPrice * (1 - l.discountPct / 100) * (l.taxRate / 100),
    0,
  );
  return {
    subtotal: round2(subtotal),
    discount: round2(discount),
    tax: round2(tax),
    total: round2(afterDiscount + tax),
    currency: CURRENCY,
  };
}

export async function seedDatabase(db: EspDatabase): Promise<void> {
  /* ---------------- Branches ---------------- */
  const branches: Branch[] = [
    { id: "br-hq", code: "BR-001", name: "Baghdad HQ", nameAr: "بغداد - الرئيسي", active: true, currency: CURRENCY, address: "Karrada St, Baghdad", createdAt: daysAgo(400), updatedAt: daysAgo(1), revision: 1 },
    { id: "br-bsr", code: "BR-002", name: "Basra", nameAr: "البصرة", active: true, currency: CURRENCY, address: "Al-Ashar Rd, Basra", createdAt: daysAgo(400), updatedAt: daysAgo(1), revision: 1 },
    { id: "br-ebl", code: "BR-003", name: "Erbil", nameAr: "أربيل", active: true, currency: CURRENCY, address: "60m St, Erbil", createdAt: daysAgo(400), updatedAt: daysAgo(1), revision: 1 },
    { id: "br-msl", code: "BR-004", name: "Mosul", nameAr: "الموصل", active: true, currency: CURRENCY, address: "Al-Rashid St, Mosul", createdAt: daysAgo(400), updatedAt: daysAgo(1), revision: 1 },
    { id: "br-naj", code: "BR-005", name: "Najaf", nameAr: "النجف", active: true, currency: CURRENCY, createdAt: daysAgo(400), updatedAt: daysAgo(1), revision: 1 },
    { id: "br-krb", code: "BR-006", name: "Karbala", nameAr: "كربلاء", active: true, currency: CURRENCY, createdAt: daysAgo(400), updatedAt: daysAgo(1), revision: 1 },
  ];

  /* ---------------- Roles & users ---------------- */
  const roles: Role[] = [
    { id: "role-admin", name: "Administrator", nameAr: "مدير النظام", permissions: [{ resource: "*", action: "*" }], createdAt: daysAgo(400), updatedAt: daysAgo(1), revision: 1 },
    { id: "role-manager", name: "Sales Manager", nameAr: "مدير المبيعات", permissions: [{ resource: "report", action: "*" }, { resource: "approval", action: "approve" }, { resource: "invoice", action: "*" }, { resource: "order", action: "*" }], createdAt: daysAgo(400), updatedAt: daysAgo(1), revision: 1 },
    { id: "role-sales", name: "Sales Representative", nameAr: "مندوب مبيعات", permissions: [{ resource: "invoice", action: "create" }, { resource: "invoice", action: "read" }, { resource: "order", action: "create" }, { resource: "customer", action: "*" }], createdAt: daysAgo(400), updatedAt: daysAgo(1), revision: 1 },
    { id: "role-cashier", name: "Cashier", nameAr: "أمين صندوق", permissions: [{ resource: "payment", action: "create" }, { resource: "pos", action: "*" }], createdAt: daysAgo(400), updatedAt: daysAgo(1), revision: 1 },
    { id: "role-inventory", name: "Inventory", nameAr: "أمين مستودع", permissions: [{ resource: "inventory", action: "*" }], createdAt: daysAgo(400), updatedAt: daysAgo(1), revision: 1 },
  ];

  const userDefs = [
    { id: "u-admin", username: "admin", name: "Ahmed Al-Malki", nameAr: "أحمد المالكي", role: "role-admin" },
    { id: "u-khalid", username: "khalid", name: "Khalid Al-Otaibi", nameAr: "خالد العتيبي", role: "role-manager" },
    { id: "u-sara", username: "sara", name: "Sara Al-Shehri", nameAr: "سارة الشهري", role: "role-sales" },
    { id: "u-omar", username: "omar", name: "Omar Al-Harbi", nameAr: "عمر الحربي", role: "role-sales" },
    { id: "u-layla", username: "layla", name: "Layla Al-Ghamdi", nameAr: "ليلى الغامدي", role: "role-sales" },
    { id: "u-fahad", username: "fahad", name: "Fahad Al-Dossari", nameAr: "فهد الدوسري", role: "role-cashier" },
    { id: "u-nouf", username: "nouf", name: "Nouf Al-Qahtani", nameAr: "نوف القحطاني", role: "role-inventory" },
    { id: "u-yousef", username: "yousef", name: "Yousef Al-Zahrani", nameAr: "يوسف الزهراني", role: "role-sales" },
  ];
  const users: User[] = userDefs.map((u, i) => ({
    id: u.id,
    username: u.username,
    name: u.name,
    nameAr: u.nameAr,
    email: `${u.username}@esp.local`,
    roleId: u.role,
    roleName: roles.find((r) => r.id === u.role)?.name ?? "Sales Representative",
    branchIds: [branches[i % branches.length]!.id],
    active: true,
    createdAt: daysAgo(400),
    updatedAt: daysAgo(1),
    revision: 1,
    lastLoginAt: daysAgo(int(0, 2)),
    avatarColor: ["#5A41DC", "#09936C", "#57A2E5", "#F4BE60", "#7C3AED", "#F9535F"][i]!,
  }));

  /* ---------------- Categories & products ---------------- */
  const categories = ["Electronics", "Furniture", "Stationery", "Appliances", "Accessories", "Services"];
  const productDefs = [
    { sku: "EL-001", name: "Laptop Pro 14", nameAr: "لابتوب برو 14", cost: 5200, price: 7499, cat: "Electronics", barcode: "6260000000101" },
    { sku: "EL-002", name: "Wireless Mouse", nameAr: "ماوس لاسلكي", cost: 38, price: 79, cat: "Electronics", barcode: "6260000000102" },
    { sku: "EL-003", name: "Mechanical Keyboard", nameAr: "لوحة مفاتيح ميكانيكية", cost: 185, price: 329, cat: "Electronics", barcode: "6260000000103" },
    { sku: "EL-004", name: "27\" Monitor 4K", nameAr: "شاشة 27 بوصة 4K", cost: 980, price: 1549, cat: "Electronics", barcode: "6260000000104" },
    { sku: "EL-005", name: "Bluetooth Speaker", nameAr: "سماعة بلوتوث", cost: 210, price: 399, cat: "Electronics", barcode: "6260000000105" },
    { sku: "EL-006", name: "Webcam HD", nameAr: "كاميرا ويب", cost: 95, price: 189, cat: "Electronics", barcode: "6260000000106" },
    { sku: "FR-001", name: "Office Desk 120", nameAr: "مكتب مكتبي 120", cost: 540, price: 899, cat: "Furniture", barcode: "6260000000201" },
    { sku: "FR-002", name: "Ergonomic Chair", nameAr: "كرسي مكتب مريح", cost: 620, price: 1099, cat: "Furniture", barcode: "6260000000202" },
    { sku: "FR-003", name: "Bookshelf 5-Tier", nameAr: "رف كتب 5 أرفف", cost: 240, price: 449, cat: "Furniture", barcode: "6260000000203" },
    { sku: "FR-004", name: "Conference Table", nameAr: "طاولة اجتماعات", cost: 1450, price: 2399, cat: "Furniture", barcode: "6260000000204" },
    { sku: "ST-001", name: "A4 Paper Box (5)", nameAr: "ورق A4 صندوق 5 رزم", cost: 12.5, price: 24, cat: "Stationery", barcode: "6260000000301" },
    { sku: "ST-002", name: "Gel Pens Pack 12", nameAr: "عبوة أقلام جيل 12", cost: 18, price: 39, cat: "Stationery", barcode: "6260000000302" },
    { sku: "ST-003", name: "Sticky Notes 3x3", nameAr: "ملاحظات لاصقة", cost: 6.5, price: 14, cat: "Stationery", barcode: "6260000000303" },
    { sku: "ST-004", name: "File Organizer", nameAr: "منظم ملفات", cost: 34, price: 69, cat: "Stationery", barcode: "6260000000304" },
    { sku: "AP-001", name: "Air Conditioner 18000", nameAr: "مكيف 18000 وحدة", cost: 1600, price: 2599, cat: "Appliances", barcode: "6260000000401" },
    { sku: "AP-002", name: "Microwave 30L", nameAr: "ميكروويف 30 لتر", cost: 420, price: 749, cat: "Appliances", barcode: "6260000000402" },
    { sku: "AP-003", name: "Refrigerator 600L", nameAr: "ثلاجة 600 لتر", cost: 2400, price: 3899, cat: "Appliances", barcode: "6260000000403" },
    { sku: "AP-004", name: "Washing Machine 9kg", nameAr: "غسالة 9 كيلو", cost: 1350, price: 2199, cat: "Appliances", barcode: "6260000000404" },
    { sku: "AC-001", name: "USB-C Cable 2m", nameAr: "كابل USB-C", cost: 8, price: 19, cat: "Accessories", barcode: "6260000000501" },
    { sku: "AC-002", name: "Laptop Stand", nameAr: "حامل لابتوب", cost: 55, price: 109, cat: "Accessories", barcode: "6260000000502" },
    { sku: "AC-003", name: "Desk Lamp LED", nameAr: "مصباح مكتب LED", cost: 45, price: 89, cat: "Accessories", barcode: "6260000000503" },
    { sku: "AC-004", name: "Power Bank 20000", nameAr: "باور بانك 20000", cost: 95, price: 169, cat: "Accessories", barcode: "6260000000504" },
    { sku: "AC-005", name: "Phone Holder", nameAr: "حامل هاتف", cost: 12, price: 29, cat: "Accessories", barcode: "6260000000505" },
    { sku: "SV-001", name: "Installation Service", nameAr: "خدمة تركيب", cost: 100, price: 200, cat: "Services", barcode: "", kind: "service" },
    { sku: "SV-002", name: "Extended Warranty 1Y", nameAr: "ضمان ممتد سنة", cost: 150, price: 299, cat: "Services", barcode: "", kind: "service" },
    { sku: "SV-003", name: "Device Maintenance", nameAr: "صيانة أجهزة", cost: 80, price: 180, cat: "Services", barcode: "", kind: "service" },
  ];

  const products: Product[] = productDefs.map((p, i) => {
    const trackStock = p.kind !== "service";
    const stock = trackStock ? int(12, 480) : 0;
    return {
      id: `p-${String(i + 1).padStart(3, "0")}`,
      sku: p.sku,
      barcode: p.barcode || undefined,
      name: p.name,
      nameAr: p.nameAr,
      category: p.cat,
      kind: (p.kind ?? "product") as Product["kind"],
      unit: "pc",
      cost: { amount: p.cost, currency: CURRENCY },
      price: { amount: p.price, currency: CURRENCY },
      taxRate: 15,
      sellable: true,
      purchasable: p.kind !== "service",
      trackStock,
      stock,
      stockMin: trackStock ? int(10, 60) : 0,
      reorderPoint: trackStock ? int(15, 80) : 0,
      description: `${p.name} — ${p.nameAr}`,
      createdAt: daysAgo(400),
      updatedAt: daysAgo(1),
      revision: 1,
    };
  });

  /* ---------------- Warehouses & stock ---------------- */
  const warehouses: Warehouse[] = [
    { id: "wh-hq", code: "WH-001", name: "Main Warehouse", nameAr: "المستودع الرئيسي", address: "Baghdad", active: true, createdAt: daysAgo(400), updatedAt: daysAgo(1), revision: 1 },
    { id: "wh-bsr", code: "WH-002", name: "Basra Warehouse", nameAr: "مستودع البصرة", address: "Basra", active: true, createdAt: daysAgo(400), updatedAt: daysAgo(1), revision: 1 },
    { id: "wh-retail", code: "WH-003", name: "Retail Store", nameAr: "مخزن المعرض", address: "Baghdad", active: true, createdAt: daysAgo(400), updatedAt: daysAgo(1), revision: 1 },
  ];

  const stockItems: StockItem[] = products
    .filter((p) => p.trackStock)
    .flatMap((p, i) => {
      const wh = warehouses[i % 3]!;
      return [
        { id: `si-${p.id}-1`, productId: p.id, warehouseId: wh.id, qty: Math.max(0, p.stock - int(0, 20)), createdAt: daysAgo(400), updatedAt: daysAgo(1), revision: 1 },
      ];
    });

  /* ---------------- Suppliers ---------------- */
  const supplierDefs = [
    { code: "SUP-001", name: "TechWorld Distribution", nameAr: "تيك ورلد للتوزيع" },
    { code: "SUP-002", name: "Al-Salem Trading", nameAr: "السلام للتجارة" },
    { code: "SUP-003", name: "HomeStyle Furnishings", nameAr: "هوم ستايل" },
    { code: "SUP-004", name: "Office Supply Co.", nameAr: "مستلزمات المكاتب" },
    { code: "SUP-005", name: "CoolAir Appliances", nameAr: "كول إير للأجهزة" },
  ];
  const suppliers: Supplier[] = supplierDefs.map((s, i) => ({
    id: `sup-${i + 1}`,
    code: s.code,
    name: s.name,
    nameAr: s.nameAr,
    email: `sales@supplier${i + 1}.com`,
    phone: `+964 7${int(0, 9)}${int(0, 9)} ${int(100, 999)} ${int(1000, 9999)}`,
    taxNumber: `3${int(1000000000, 9999999999)}`,
    paymentTerms: "Net 30",
    rating: int(3, 5),
    active: true,
    createdAt: daysAgo(300),
    updatedAt: daysAgo(1),
    revision: 1,
  }));

  /* ---------------- Customers ---------------- */
  const firstNames = ["Abdullah", "Mohammed", "Faisal", "Nasser", "Tariq", "Sami", "Hassan", "Majed", "Rakan", "Bandar", "Ibrahim", "Sultan"];
  const lastNames = ["Al-Saud", "Al-Farsi", "Al-Rashid", "Al-Anazi", "Al-Hazmi", "Al-Sulaiman", "Al-Mutairi", "Al-Shammari", "Al-Ajmi", "Al-Dhafiri"];
  const companyWords = ["Trading", "Construction", "Technology", "Logistics", "Retail", "Real Estate", "Catering", "Medical"];
  const cities = ["Baghdad", "Basra", "Erbil", "Mosul", "Najaf", "Karbala", "Sulaymaniyah", "Kirkuk"];
  const tiers: Customer["tier"][] = ["bronze", "silver", "gold", "platinum"];
  const tierWeights = [0.38, 0.3, 0.2, 0.12];

  function weightedTier(): Customer["tier"] {
    const r = rand();
    let acc = 0;
    for (let i = 0; i < tiers.length; i++) {
      acc += tierWeights[i]!;
      if (r <= acc) return tiers[i]!;
    }
    return "silver";
  }

  const customers: Customer[] = Array.from({ length: 40 }, (_, i) => {
    const company = `${pick(companyWords)} ${pick(cities)}`;
    const name = i % 2 === 0 ? `${pick(firstNames)} ${pick(lastNames)}` : company;
    const tier = weightedTier();
    const creditLimit = { bronze: 20000, silver: 60000, gold: 150000, platinum: 400000 }[tier]!;
    return {
      id: `cus-${String(i + 1).padStart(3, "0")}`,
      code: `CUS-${String(i + 1).padStart(4, "0")}`,
      name,
      nameAr: name,
      email: `customer${i + 1}@mail.com`,
      phone: `+964 7${int(0, 9)}${int(0, 9)} ${int(100, 999)} ${int(1000, 9999)}`,
      taxNumber: `3${int(1000000000, 9999999999)}`,
      tier,
      segment: pick(["retail", "wholesale", "government", "corporate"]),
      tags: chance(0.4) ? [pick(["VIP", "early-adopter", "bulk-buyer", "referral"])] : [],
      addresses: [{ label: "main", address: `${pick(cities)}, ${pick(["Al-Rashid St", "Karrada St", "Sadoun St", "Al-Mutanabbi St"])}` }],
      creditLimit: { amount: creditLimit, currency: CURRENCY },
      balance: { amount: 0, currency: CURRENCY },
      totalRevenue: { amount: 0, currency: CURRENCY },
      totalInvoices: 0,
      since: daysAgo(int(120, 380)),
      notes: chance(0.3) ? "Prefers electronic invoices." : undefined,
      createdAt: daysAgo(int(120, 380)),
      updatedAt: daysAgo(1),
      revision: 1,
    };
  });

  const contacts: Contact[] = customers.slice(0, 18).map((c, i) => ({
    id: `ct-${i + 1}`,
    customerId: c.id,
    name: `${pick(firstNames)} ${pick(lastNames)}`,
    role: pick(["Procurement", "Finance", "Owner", "Operations"]),
    email: `contact${i + 1}@mail.com`,
    phone: `+964 7${int(0, 9)}${int(0, 9)} ${int(100, 999)} ${int(1000, 9999)}`,
    isPrimary: true,
    createdAt: daysAgo(int(60, 300)),
    updatedAt: daysAgo(1),
    revision: 1,
  }));

  /* ---------------- Leads ---------------- */
  const leadStages: Lead["stage"][] = ["new", "qualified", "proposal", "negotiation", "won", "lost"];
  const leads: Lead[] = Array.from({ length: 24 }, (_, i) => {
    const stage = pick(leadStages);
    const value = round2(int(1, 40) * 1000);
    return {
      id: `lead-${i + 1}`,
      code: `LD-${String(i + 1).padStart(4, "0")}`,
      name: `${pick(firstNames)} ${pick(lastNames)}`,
      company: `${pick(companyWords)} ${pick(cities)}`,
      email: `lead${i + 1}@mail.com`,
      phone: `+964 7${int(0, 9)}${int(0, 9)} ${int(100, 999)} ${int(1000, 9999)}`,
      source: pick(["walk_in", "website", "referral", "campaign", "social", "other"]),
      stage,
      value: { amount: value, currency: CURRENCY },
      probability: { won: 100, lost: 0, negotiation: 70, proposal: 45, qualified: 30, new: 15 }[stage]!,
      ownerId: pick(users).id,
      assignee: pick(users).name,
      tags: chance(0.4) ? ["hot", "enterprise"].slice(0, int(1, 2)) : [],
      notes: stage === "lost" ? "Budget not available." : undefined,
      createdAt: daysAgo(int(1, 90)),
      updatedAt: daysAgo(int(0, 5)),
      revision: 1,
    };
  });

  /* ---------------- Activities ---------------- */
  const activityKinds: Activity["type"][] = ["call", "meeting", "visit", "email", "follow_up", "whatsapp"];
  const activities: Activity[] = Array.from({ length: 42 }, (_, i) => {
    const owner = pick(users);
    const withCustomer = chance(0.6);
    return {
      id: `act-${i + 1}`,
      customerId: withCustomer ? pick(customers).id : undefined,
      leadId: !withCustomer ? pick(leads).id : undefined,
      type: pick(activityKinds),
      title: pick([
        "Follow-up call scheduled",
        "Product demo completed",
        "Contract signed",
        "Price quote sent",
        "Site visit arranged",
        "Payment reminder sent",
      ]),
      description: undefined,
      dueAt: daysAgo(int(0, 14)),
      done: chance(0.72),
      doneAt: chance(0.7) ? daysAgo(int(0, 14)) : undefined,
      ownerId: owner.id,
      createdAt: daysAgo(int(0, 20)),
      updatedAt: daysAgo(int(0, 20)),
      revision: 1,
    };
  });

  /* ---------------- Documents ---------------- */
  const makeLines = (productCount: number): DocumentLine[] => {
    const selected = [...products].sort(() => rand() - 0.5).slice(0, productCount);
    return selected.map((p) => {
      const qty = int(1, 8);
      const unitPrice = round2(p.price.amount * (chance(0.35) ? between(0.9, 1.05) : 1));
      return {
        id: uid("ln"),
        productId: p.id,
        sku: p.sku,
        name: p.name,
        nameAr: p.nameAr,
        qty,
        unitPrice,
        discountPct: chance(0.2) ? pick([0, 2, 5, 10]) : 0,
        taxRate: p.taxRate,
        cost: p.cost.amount,
      };
    });
  };

  const invCounter = seqCounter();
  const ordCounter = seqCounter();
  const quotCounter = seqCounter();
  const payCounter = seqCounter();
  const creditCounter = seqCounter();
  const poCounter = seqCounter();
  const billCounter = seqCounter();

  const today = new Date();

  const quotations: Quotation[] = [];
  const orders: SalesOrder[] = [];
  const invoices: Invoice[] = [];
  const payments: Payment[] = [];
  const creditNotes: CreditNote[] = [];
  const stockMoves: StockMove[] = [];

  let invoiceSeq = 0;
  const salesUserIds = users.filter((u) => u.roleId === "role-sales").map((u) => u.id);
  const customersPaid: Record<string, number> = {};
  const customerInvoices: Record<string, number> = {};

  for (let i = 0; i < 260; i++) {
    const days = int(0, 179);
    const issued = daysAgo(days);
    const customer = pick(customers);
    const branch = pick(branches);
    const lines = makeLines(int(1, 4));
    const discountPct = chance(0.15) ? 2 : 0;
    const totals = lineTotals(lines, discountPct);
    const statusRoll = rand();
    const status: Invoice["status"] =
      days > 120
        ? statusRoll < 0.95
          ? "paid"
          : "cancelled"
        : statusRoll < 0.68
          ? "paid"
          : statusRoll < 0.82
            ? "partially_paid"
            : statusRoll < 0.92
              ? "overdue"
              : "draft";

    invoiceSeq += 1;
    const code = `INV-2026-${invCounter()}`;
    const dueDate = new Date(issued);
    dueDate.setDate(dueDate.getDate() + (status === "overdue" ? -int(2, 30) : 30));
    const hasInstallments = status === "partially_paid" && chance(0.6);
    const installments =
      status === "partially_paid" && hasInstallments
        ? Array.from({ length: int(2, 4) }, (_, idx) => {
            const due = new Date(issued);
            due.setDate(due.getDate() + (idx + 1) * 30);
            const paid = idx === 0;
            return {
              id: uid("inst"),
              invoiceId: "",
              index: idx,
              dueDate: due.toISOString(),
              amount: round2(totals.total / int(2, 4)),
              paid,
              paidAt: paid ? due.toISOString() : undefined,
              createdAt: issued,
              updatedAt: issued,
              revision: 1,
            };
          })
        : [];
    let paidAmount = 0;
    if (status === "paid") paidAmount = totals.total;
    else if (status === "partially_paid")
      paidAmount = hasInstallments
        ? installments.filter((x) => x.paid).reduce((a, x) => a + x.amount, 0)
        : round2(totals.total * 0.5);

    const invoice: Invoice = {
      id: `inv-${invoiceSeq}`,
      code,
      customerId: customer.id,
      customerName: customer.name,
      branchId: branch.id,
      status,
      issueDate: issued,
      dueDate: dueDate.toISOString(),
      lines,
      totals,
      paymentMethod: pick([PaymentMethod.Cash, PaymentMethod.Card, PaymentMethod.BankTransfer, PaymentMethod.Installment]),
      installmentCount: installments.length,
      installments: installments.map((x) => ({ ...x, invoiceId: `inv-${invoiceSeq}` })),
      paidAmount,
      ownerId: salesUserIds[invoiceSeq % salesUserIds.length],
      notes: chance(0.1) ? "Approved by manager." : undefined,
      createdAt: issued,
      updatedAt: daysAgo(0),
      revision: 1,
    };
    invoices.push(invoice);

    customerInvoices[customer.id] = (customerInvoices[customer.id] ?? 0) + 1;
    if (status === "paid" || status === "partially_paid") {
      customersPaid[customer.id] = (customersPaid[customer.id] ?? 0) + paidAmount;
    }

    if (chance(0.35)) {
      orders.push({
        id: `ord-${invoiceSeq}`,
        code: `SO-2026-${ordCounter()}`,
        quotationId: undefined,
        customerId: customer.id,
        customerName: customer.name,
        branchId: branch.id,
        status: status === "cancelled" ? "cancelled" : "delivered",
        lines,
        totals,
        paymentMethod: invoice.paymentMethod,
        discountPct,
        committedAt: issued,
        deliveryDate: daysAgo(Math.max(0, days - int(1, 3))),
        createdAt: issued,
        updatedAt: daysAgo(0),
        revision: 1,
      });
      stockMoves.push({
        id: uid("mv"),
        type: "sold",
        productId: lines[0]!.productId,
        warehouseId: branch.id === "br-bsr" ? "wh-bsr" : "wh-hq",
        qty: -lines[0]!.qty,
        unitCost: { amount: lines[0]!.cost ?? 0, currency: CURRENCY },
        refType: "sale",
        refId: `ord-${invoiceSeq}`,
        refCode: `SO-2026-${invoiceSeq}`,
        createdById: pick(users).id,
        createdAt: issued,
        updatedAt: daysAgo(0),
        revision: 1,
      });
    }

    if (chance(0.12)) {
      quotations.push({
        id: `quot-${invoiceSeq}`,
        code: `QT-2026-${quotCounter()}`,
        customerId: customer.id,
        customerName: customer.name,
        status: pick(["pending", "approved", "rejected", "draft"]),
        lines,
        totals,
        validUntil: daysAgo(-int(5, 20)),
        notes: undefined,
        createdAt: issued,
        updatedAt: daysAgo(0),
        revision: 1,
      });
    }

    if ((status === "paid" || status === "partially_paid") && paidAmount > 0) {
      payments.push({
        id: `pay-${invoiceSeq}`,
        code: `PAY-2026-${payCounter()}`,
        invoiceId: invoice.id,
        customerId: customer.id,
        customerName: customer.name,
        method: invoice.paymentMethod,
        amount: { amount: paidAmount, currency: CURRENCY },
        paidAt: daysAgo(Math.max(0, days - int(0, 5))),
        reference: chance(0.5) ? `REF${int(100000, 999999)}` : undefined,
        cashierId: pick(users).id,
        pos: chance(0.2),
        createdAt: daysAgo(Math.max(0, days - int(0, 5))),
        updatedAt: daysAgo(0),
        revision: 1,
      });
    }
  }

  /* Apply computed balances / totals to customers. */
  for (const c of customers) {
    c.totalRevenue = { amount: round2(customersPaid[c.id] ?? 0), currency: CURRENCY };
    c.totalInvoices = customerInvoices[c.id] ?? 0;
    const unpaid = invoices
      .filter((inv) => inv.customerId === c.id && inv.status !== "draft" && inv.status !== "cancelled")
      .reduce((acc, inv) => acc + Math.max(0, inv.totals.total - inv.paidAmount), 0);
    c.balance = { amount: round2(unpaid), currency: CURRENCY };
  }

  /* Credit notes */
  for (let i = 0; i < 3; i++) {
    const inv = invoices.filter((x) => x.status !== "cancelled" && x.status !== "draft")[i];
    if (!inv) continue;
    creditNotes.push({
      id: `cn-${i + 1}`,
      code: `CN-2026-${creditCounter()}`,
      invoiceId: inv.id,
      customerId: inv.customerId,
      customerName: inv.customerName,
      reason: pick(["Damaged goods", "Customer return", "Wrong item shipped"]),
      lines: inv.lines.slice(0, 1),
      totals: { ...inv.totals, total: round2(inv.lines[0]!.qty * inv.lines[0]!.unitPrice) },
      status: "approved",
      applied: true,
      createdAt: daysAgo(int(5, 30)),
      updatedAt: daysAgo(1),
      revision: 1,
    });
  }

  /* ---------------- Purchasing ---------------- */
  const purchaseOrders: PurchaseOrder[] = Array.from({ length: 12 }, (_, i) => {
    const supplier = pick(suppliers);
    const lines = makeLines(int(1, 4));
    const totals = lineTotals(lines, 0);
    const received = i < 8;
    return {
      id: `po-${i + 1}`,
      code: `PO-2026-${poCounter()}`,
      supplierId: supplier.id,
      supplierName: supplier.name,
      status: received ? "delivered" : pick(["pending", "approved", "in_transit"]),
      expectedDate: daysAgo(int(0, 14)),
      lines,
      totals,
      received,
      notes: undefined,
      createdAt: daysAgo(int(3, 45)),
      updatedAt: daysAgo(0),
      revision: 1,
    };
  });

  const bills: Bill[] = purchaseOrders.slice(0, 8).map((po, i) => ({
    id: `bill-${i + 1}`,
    code: `BILL-2026-${billCounter()}`,
    poId: po.id,
    supplierId: po.supplierId,
    supplierName: po.supplierName,
    status: i < 6 ? "paid" : "partially_paid",
    dueDate: daysAgo(-int(0, 15)),
    totals: po.totals,
    paidAmount: i < 6 ? po.totals.total : round2(po.totals.total * 0.5),
    createdAt: po.createdAt,
    updatedAt: daysAgo(0),
    revision: 1,
  }));

  for (const po of purchaseOrders.filter((x) => x.received)) {
    stockMoves.push({
      id: uid("mv"),
      type: "receive",
      productId: po.lines[0]!.productId,
      warehouseId: "wh-hq",
      qty: po.lines[0]!.qty,
      unitCost: { amount: po.lines[0]!.cost ?? 0, currency: CURRENCY },
      refType: "purchase",
      refId: po.id,
      refCode: po.code,
      createdById: "u-nouf",
      createdAt: po.createdAt,
      updatedAt: po.updatedAt,
      revision: 1,
    });
  }

  /* ---------------- Workflows & audit ---------------- */
  const workflows: WorkflowDef[] = [
    {
      id: "wf-so-approval",
      code: "WF-SO-APPROVAL",
      name: "Sales Order Approval",
      nameAr: "اعتماد أوامر البيع",
      enabled: true,
      trigger: "order:created",
      conditions: [{ field: "totals.total", op: "gte", value: 50000 }],
      actions: ["notify:approvers", "email:approvers"],
      createdAt: daysAgo(200),
      updatedAt: daysAgo(10),
      revision: 1,
    },
    {
      id: "wf-po-approval",
      code: "WF-PO-APPROVAL",
      name: "Purchase Order Approval",
      nameAr: "اعتماد أوامر الشراء",
      enabled: true,
      trigger: "purchase:created",
      conditions: [{ field: "totals.total", op: "gte", value: 100000 }],
      actions: ["notify:approvers"],
      createdAt: daysAgo(200),
      updatedAt: daysAgo(10),
      revision: 1,
    },
    {
      id: "wf-low-stock",
      code: "WF-LOW-STOCK",
      name: "Low Stock Alert",
      nameAr: "تنبيه انخفاض المخزون",
      enabled: true,
      trigger: "stock:below_reorder",
      conditions: [],
      actions: ["notify:inventory", "notify:manager"],
      createdAt: daysAgo(200),
      updatedAt: daysAgo(10),
      revision: 1,
    },
  ];

  const audits = Array.from({ length: 24 }, (_, i) => {
    const actor = pick(users);
    return {
      id: `audit-${i + 1}`,
      actorId: actor.id,
      actorName: actor.name,
      action: pick(["create", "update", "approve", "delete", "login", "export"]),
      resource: pick(["invoice", "order", "customer", "product", "payment", "user"]),
      resourceId: undefined,
      ip: `10.20.${int(0, 255)}.${int(1, 254)}`,
      device: pick(["Chrome / Windows", "Safari / iPhone", "Chrome / Android", "Edge / Windows"]),
      location: pick(cities),
      createdAt: daysAgo(int(0, 30)),
      updatedAt: daysAgo(0),
      revision: 1,
    };
  });

  const todayIso = today.toISOString();

  await db.branches.bulkAdd(branches);
  await db.roles.bulkAdd(roles);
  await db.users.bulkAdd(users);
  await db.products.bulkAdd(products);
  await db.warehouses.bulkAdd(warehouses);
  await db.stockItems.bulkAdd(stockItems);
  await db.suppliers.bulkAdd(suppliers);
  await db.customers.bulkAdd(customers);
  await db.contacts.bulkAdd(contacts);
  await db.leads.bulkAdd(leads);
  await db.activities.bulkAdd(activities);
  await db.quotations.bulkAdd(quotations);
  await db.orders.bulkAdd(orders);
  await db.invoices.bulkAdd(invoices);
  await db.payments.bulkAdd(payments);
  await db.creditNotes.bulkAdd(creditNotes);
  await db.stockMoves.bulkAdd(stockMoves);
  await db.purchaseOrders.bulkAdd(purchaseOrders);
  await db.bills.bulkAdd(bills);
  await db.workflows.bulkAdd(workflows);
  await db.auditLogs.bulkAdd(audits);

  await db.journalEntries.bulkAdd([
    {
      id: "je-1",
      code: "JE-2026-0001",
      date: todayIso,
      description: "Opening balances",
      lines: [
        { accountId: "acc-cash", accountName: "Cash", debit: 250000, credit: 0 },
        { accountId: "acc-owner", accountName: "Owner Equity", debit: 0, credit: 250000 },
      ],
      posted: true,
      postedAt: todayIso,
      createdById: "u-admin",
      createdAt: todayIso,
      updatedAt: todayIso,
      revision: 1,
    },
  ]);

}
