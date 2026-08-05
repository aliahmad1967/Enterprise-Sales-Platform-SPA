# Enterprise Sales Platform (ESP)

An **Arabic-first, offline-first ERP / CRM** single-page application for managing
sales, point of sale, inventory, purchasing, accounting, and reporting — built as
a pnpm monorepo with a React 19 + Vite + TypeScript frontend.

> Friendly start: double-click **`Start Platform.bat`** — it starts the dev
> server and opens the app in your browser automatically (no command line needed).

---

## Features

| Module | Highlights |
| --- | --- |
| **Dashboard** | KPI cards, revenue trend, top products, branch performance, activity feed |
| **CRM** | Customers (tiers, credit limits, balances), contacts, leads, activities |
| **Sales** | Quotations → Sales orders → Invoices with line items, discounts, VAT, payments, installments, printing |
| **POS** | Cashier checkout with product grid (with product images), cart, payment methods |
| **Inventory** | Products (SKU/barcode, image upload, cost/price/tax), warehouses, stock moves, low-stock alerts |
| **Purchasing** | Suppliers, purchase orders, bills |
| **Accounting** | Chart of accounts, journal entries |
| **Reports** | Sales, profit, inventory and activity analytics |
| **Admin** | Users, roles & permissions, audit log |
| **Settings & Tools** | Theme (dark/light), locale, workflow rules, API center, monitoring, AI assistant |

Currency is **IQD (Iraqi Dinar)**, and demo branches/stores are Iraqi
(Baghdad, Basra, Erbil, Mosul, Najaf, Karbala).

---

## Tech stack

- **Frontend**: React 19, TypeScript (strict), Vite 6, Tailwind CSS v4, TanStack Query / Table / Virtual, Zustand, react-hook-form + Zod, Recharts, framer-motion, lucide-react
- **Data**: Offline-first IndexedDB via Dexie with seed data and automatic re-seeding when seed data changes; sync-engine-ready (server layer planned)
- **PWA**: vite-plugin-pwa (service worker app shell, works offline)
- **i18n**: Lightweight typed dictionaries — **Arabic (RTL, primary)** and English
- **Tests**: Vitest + Testing Library (jsdom)
- **Package manager**: pnpm 10 (workspace monorepo)

---

## Project structure

```
apps/
  web/                      Vite + React 19 SPA (the product)
packages/
  design-system/            Design tokens (CSS variables) + Tailwind theme
  ui/                       Base UI components (Radix-style primitives)
  types/                    Shared domain types + DTO contracts
  utils/                    cn, currency/date/number formatters (ar/en), guards
  hooks/                    useMediaQuery, useDebounce, useLocalStorage, useOnline …
  services/                 Offline store (Dexie), repository, hooks, seed data
docs/                       Analysis, architecture, milestones, palette
tests/                      Vitest setup
```

Workspace packages export **source** (`"main": "./src/index.ts"`) — Vite bundles
them directly, so there is no per-package build step.

---

## Getting started

### One-click (no command line)

1. Double-click **`Start Platform.bat`** in the project root.
2. Wait a few seconds — the script starts the dev server and opens
   `http://localhost:5173` in your browser.
3. Log in with any demo account (below).

To stop the app, close the small "Dev Server" window.

### Command line

Requires **Node.js ≥ 20.19** and **pnpm ≥ 10**.

```bash
pnpm install      # install workspace dependencies
pnpm dev          # start the web app (Vite dev server)
pnpm dev:api      # (when the backend milestone is implemented)
pnpm build        # production build
pnpm preview      # preview the production build
```

Open http://localhost:5173.

### Demo accounts

Login is demo-mode: **password equals username** for any seeded user.

| Username | Role |
| --- | --- |
| `admin` | Administrator |
| `khalid` | Sales Manager |
| `sara`, `omar`, `layla`, `yousef` | Sales Representative |
| `fahad` | Cashier |
| `nouf` | Inventory |

---

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the web dev server |
| `pnpm build` | Type-check and build the web app |
| `pnpm typecheck` | Run TypeScript across all workspaces |
| `pnpm test` | Run the Vitest suite once |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm test:ui` | Run tests with the Vitest UI |
| `pnpm qa` | Type-check + test + build in one pass |
| `pnpm seed` | Re-seed the offline database (via seed CLI) |

---

## Data & offline behavior

- All data lives in the browser's IndexedDB (`esp` database, Dexie).
- On first run the database is seeded with realistic Iraqi demo data
  (branches, users, products, customers, invoices, stock, …).
- When seed data changes in code, the app **re-seeds automatically** on next
  open — no manual reset needed. Use a hard refresh (Ctrl+F5) to pick up changes.
- Entity records carry `revision`/`updatedAt`; writes are tagged with a
  `clientId` to prepare for the future server sync engine.

---

## Localization & theming

- Arabic (`ar`) is the primary locale with **RTL** layout using logical CSS properties.
- English (`en`) is fully supported.
- Switch locale from the navbar; switch dark/light theme from Settings.
- UI labels live in `apps/web/src/i18n/{en,ar}.ts` — add new keys to both dictionaries.

---

## Testing

```bash
pnpm test
```

The suite covers formatting utilities, domain guards, repositories, and analytics
via Vitest + Testing Library (jsdom). Coverage config lives in `vitest.config.ts`.

---

## Documentation

See the `docs/` folder for deeper material:

- `docs/analysis.md` — product & domain analysis
- `docs/architecture.md` — monorepo, frontend, data flow, offline/sync strategy, ADRs
- `docs/milestones.md` — delivery milestones (backend: ASP.NET Core + EF Core planned)
- `docs/palette.md` — design tokens & color system
