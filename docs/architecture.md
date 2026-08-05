# Architecture

## 1. Monorepo layout (pnpm workspaces)

```
apps/
  web/                     Vite + React 19 SPA (the product)
packages/
  design-system/           Token source of truth (CSS vars + TS) + Tailwind theme
  ui/                      Base UI components (shadcn-style, Radix primitives)
  types/                   Shared domain types + DTO contracts
  utils/                   cn, currency/date/number formatters (ar/en), guards
  hooks/                   useMediaQuery, useDebounce, useLocalStorage, useOnline …
  services/                API client, endpoints, offline store, sync engine
docs/                      Milestones, ADRs, QA plan
scripts/                   dev/build/seed helpers
tests/                     e2e smoke specs (Playwright)
```

Workspace packages publish **source** (`"main": "./src/index.ts"`); Vite bundles
them directly. Contracts between SPA and API live in `packages/types`.

## 2. Frontend architecture (apps/web)

```
src/
  app/          App providers, router, root layout, error boundary
  modules/      Feature modules (dashboard, crm, sales, inventory, …)
  state/        Zustand stores (theme, auth, ui, notifications, command palette)
  i18n/         ar/en dictionaries + react-i18next-less lightweight resolver
  lib/          query client config, http client wiring, indexdb boot
```

**Data flow**: Components → TanStack Query hooks → `@esp/services` → adapter.
Adapters: `http` (axios → API) or `local` (seeded IndexedDB + in-memory seed) →
repository → normalized cache. Mutations go through a queue that flushes to the
adapter with optimistic updates + rollback.

## 3. Backend architecture (apps/api — Milestone 10+)

ASP.NET Core 9, Clean Architecture, DDD, CQRS (MediatR), EF Core + SQL Server,
Redis cache, Hangfire jobs, SignalR hub, JWT auth.

```
Api/        Controllers (thin) + OpenAPI
Application/Commands, Queries, DTOs, Validators (FluentValidation), Domain events
Domain/     Aggregates, ValueObjects, Specifications
Infrastructure/ EF Core, Redis, Hangfire, Object storage, SignalR, Audit
```

## 4. Domain model (core aggregates)

```
Company ▸ Branch ▸ User (Role, Permission)
Customer (Category, Segment, Wallet) ▸ Contact ▸ Lead ▸ Activity(visit/call/…)
Product (SKU, barcode) ▸ Category ▸ PriceList
Warehouse ▸ Location ▸ StockItem (lot/batch/serial/expiry) ▸ StockMove(transfer/adjust/count)
Sales: Quotation → SalesOrder → Invoice → Payment(Installment) ; CreditNote, Return, Delivery
Purchasing: Supplier ▸ PurchaseOrder → Bill ; PurchaseReturn
Accounting: Account ▸ JournalEntry(Line) ▸ CostCenter ▸ Budget ▸ TaxRate
Workflow: WorkflowDef(rule/condition/action) ▸ Instance ▸ ApprovalRequest
Audit: AuditLog(actor, at, before, after, ip, device, location)
```

Money = decimal + currency (ISO 4217) as a Value Object; all pricing handled in a
single `Money` type to avoid float drift.

## 5. Offline / sync strategy

- IndexedDB (Dexie) mirrors query cache per user+branch.
- Every entity carries `revision` + `updatedAt`; writes tagged with `clientId`.
- Sync engine: push queue → server applies via idempotency key → pull deltas by
  `updatedAt > cursor`; last-write-wins initially; conflict UI for edits.
- Service worker (vite-plugin-pwa) caches app shell; navigation requests fall back
  to shell for true SPA offline.

## 6. Security model

JWT access (15m) + rotating refresh (7d) stored in HttpOnly cookie (or secure
storage fallback). Role/Permission matrix: `permission = resource:action`
(`invoice:create`, `settings:update`). Server double-validates every request;
audit middleware records who/when/before/after/ip/device. 2FA (TOTP) hook in
auth service, UI ready.

## 7. Performance budget

- App shell < 300 kB gzip; module chunks < 200 kB.
- First paint < 1.5 s on desktop; CLS < 0.1; TTI < 3 s.
- Lists > 200 rows → virtual scrolling; charts memoized; debounced filters.

## 8. ADRs (decision records)

- **ADR-001** Use Vite + React 19 + TypeScript strict (build speed, DX, ecosystem).
- **ADR-002** Tailwind v4 + CSS variables for theming (design tokens, dark/RTL).
- **ADR-003** Custom lightweight i18n (typed dictionaries, ICU-lite, per-locale dir).
- **ADR-004** Workspace packages export source; Vite bundles (no per-package build step).
- **ADR-005** TanStack Query for server cache; Zustand only for ephemeral UI state.
- **ADR-006** Offline-first with IndexedDB + sync queue; LWW initially.
- **ADR-007** RTL as primary: logical properties only, layout derives from `dir`.
