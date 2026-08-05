# Milestone 0 — Project Analysis

> Enterprise Sales Platform SPA · React 19 + ASP.NET Core 9 · Arabic-first RTL SPA
> Competitive bar: Salesforce / Microsoft Dynamics / Odoo / SAP Business One.

## 1. Product Vision

A single-page enterprise sales platform covering the full order-to-cash lifecycle
plus back-office (inventory, purchasing, accounting). The entire app must run as an
SPA with instant navigation, work offline, and be a PWA. Arabic (RTL) is the
primary language; English (LTR) secondary. Both dark and light themes.

## 2. Functional Scope (module map)

| # | Module       | Core capabilities |
| - | ------------ | ----------------- |
| 1 | Dashboard    | Live KPIs, charts, tasks, calendar, goals, heatmap, activity feed |
| 2 | CRM          | Customers, leads, contacts, companies, pipeline/Kanban, visits, calls, emails, meetings, timeline, wallet, tags, segments |
| 3 | Sales        | Quotations, orders, invoices, credit notes, returns, deliveries, payments, installments, discount, tax, commission, recurring, PDF/Email/WhatsApp/SMS, barcode/QR |
| 4 | POS          | Touch UI, barcode/QR, offline, cash drawer, receipt printer, scale, split payments, coupons, returns, kitchen/customer display, shift mgmt |
| 5 | Inventory    | Warehouses, locations, transfers, adjustments, cycle count, stock history, FIFO/LIFO/avg cost, lots, batches, serials, expiry, low-stock, reorder, supplier price |
| 6 | Purchasing   | Suppliers, POs, receiving, bills, returns, approval, price history, supplier evaluation |
| 7 | Accounting   | Cash, bank, expenses, income, journal, GL, tax, cost centers, budget, P&L, balance sheet, trial balance |
| 8 | Reports     | Interactive, realtime, export PDF/Excel/CSV, pivot, drill-down, saved reports, dashboard builder |
| 9 | Administration | Users, roles, permissions (RBAC), audit log, login history, security policy, branches, companies, currencies, languages, themes, license, backup/restore |
| 10 | Settings    | All configuration surfaces |
| 11 | AI          | Chat assistant, sales analysis, report summaries, reorder suggestions, forecasting, discount suggestions, customer analysis, fraud detection, performance analysis, NL→search |
| 12 | Cross-cutting | Global search, command palette (Ctrl+K), notifications, workflow engine, approval engine, audit logs, API center, system monitoring |

## 3. Non-functional requirements

- **SPA-first**: zero full-page reloads; lazy-loaded module chunks.
- **Offline-first**: IndexedDB local DB, queued mutations, background sync, conflict resolution.
- **Performance**: code splitting, virtual scrolling, memoization, debounce, optimistic updates, infinite scroll.
- **Security**: JWT + refresh, RBAC permission matrix, audit trail, XSS/CSRF protection, rate limiting, secure headers, 2FA-ready.
- **Accessibility**: WCAG AA, keyboard navigation, screen reader, focus management, high contrast.
- **Responsive**: mobile → ultra-wide (17 breakpoints tiers via Tailwind).

## 4. Target personas

Sales agent (POS, orders), sales manager (pipeline, targets, reports), back-office
(clerk: inventory/purchasing/accounting), admin (users/roles/branches/settings),
executive (dashboard/reports/AI).

## 5. Constraints

- Frontend fully functional offline with seeded demo data behind a service adapter
  (so the SPA is runnable now, and can be pointed at the real ASP.NET Core API later).
- Backend milestone produces the ASP.NET Core 9 API (Clean Architecture) behind the
  same service contracts (REST + SignalR). The SPA service layer is contract-first so
  the swap is transparent.
- No placeholder/demo code in shipped modules.

## 6. Success criteria (Sprint 1 = foundation)

1. Monorepo installs with `pnpm install` and boots with `pnpm dev`.
2. Design system renders identically in RTL/LTR and dark/light.
3. SPA shell: sidebar (right in RTL), navbar, status bar, command palette, notifications, AI assistant.
4. Dashboard + CRM + Sales functional offline with real (seeded) data.
5. `pnpm build` type-checks and bundles; PWA service worker registered.
6. QA checklist: 30+ UI tests passing; a11y keyboard audit clean.

## 7. Risks

| Risk | Mitigation |
| ---- | ---------- |
| Scope creep | Strict milestone gating, definition-of-done per milestone |
| RTL layout bugs | Logical properties everywhere; QA RTL checklist |
| Offline sync complexity | Simple last-write-wins + monotonic revision counters first |
| Large bundle | Route-level lazy chunks + design-token tree shaking |
