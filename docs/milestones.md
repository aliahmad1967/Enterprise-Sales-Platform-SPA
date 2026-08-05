# Milestone Roadmap

Each milestone is self-contained, runnable, and gated (100% before next).

| M  | Name | Deliverables | Exit criteria |
| -- | ---- | ------------ | ------------- |
| 0  | Analysis & Architecture | `analysis.md`, `palette.md`, `architecture.md`, ADRs | Docs reviewed, palette extracted |
| 1  | Scaffold + Design System | Monorepo, tokens, Tailwind theme, base UI kit | `pnpm dev` boots; kit story renders RTL/dark |
| 2  | SPA Shell | Router, layout, theme/i18n/auth stores, command palette, notifications, AI assistant, status bar, PWA | Shell navigates instantly, offline reload works |
| 3  | Dashboard | Live KPIs, charts, activities, tasks, calendar | Fully interactive offline |
| 4  | CRM | Customers, leads, contacts, pipeline kanban, timeline, wallet | CRUD + pipeline drag-drop works |
| 5  | Sales | Quotations, orders, invoices, payments, returns, recurring | Document flow with approvals |
| 6  | Inventory + Purchasing | Stock moves, transfers, adjustments, POs, receiving | Stock valuation correct (FIFO/avg) |
| 7  | Accounting + Reports | Journal, GL, P&L, balance sheet, report builder, exports | Reports balance; exports valid |
| 8  | POS | Touch POS, barcode, payments, shift, receipts | Offline POS sale reconciles |
| 9  | Admin + Settings + AI | Users/roles/permissions, audit, API center, monitoring, AI assistant wired | RBAC enforced; AI answers from data |
| 10 | Hardening | Security pass, a11y audit, perf budget, e2e suite, docs | QA checklist green |

## Definition of Done (each milestone)
- [ ] Code: strict TS, SOLID, no demo/placeholder, technical comments only when needed
- [ ] Tests: unit for utils/services + component/integration for UI
- [ ] Docs: updated for the milestone
- [ ] Verify: `pnpm build` + `pnpm typecheck` + `pnpm test` green
- [ ] QA: RTL + dark/light + responsive + keyboard checks
