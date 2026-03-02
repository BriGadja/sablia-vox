# Tech Debt Inventory — Sablia Vox

> Complete inventory of tech debt, dead code, and inconsistencies. Last updated: 2026-03-02.
> This document drives the refactoring plan at `.claude/plans/sablia-vox-refactor-master.md`.

---

## Critical (Functional Bugs / Production Risk)

| # | Issue | File(s) | Impact |
|---|-------|---------|--------|
| C1 | **AgentTree links to dead route** — Generates hrefs to `/dashboard/agent/[id]` (singular) instead of `/dashboard/agents/[id]` (plural). Sidebar agent navigation is entirely broken. | `components/dashboard/Sidebar/AgentTree.tsx` | Sidebar "Mes Agents" tree clicks navigate to 404 |
| C2 | **react-query-devtools in production deps** — Listed under `dependencies` not `devDependencies`. DevTools panel ships to production bundle. | `package.json` | Unnecessary JS in production bundle |
| C3 | **Unapplied migration** — `20260302_remove_leasing_prorata.sql` exists but is not applied. Frontend `InvoiceSummaryTable` still renders prorata rows. | `supabase/migrations/`, `components/dashboard/Financial/InvoiceSummaryTable.tsx` | Frontend/DB divergence after migration is applied |

---

## High (Architecture / Maintainability)

| # | Issue | File(s) | Impact |
|---|-------|---------|--------|
| ~~H1~~ | ~~**ESLint + Biome dual config**~~ — Resolved: ESLint removed, Biome is sole linter. | | |
| H2 | **Hardcoded webhook URLs** — CTA forms hardcode `https://n8n.sablia.io/webhook/voipia_louis_from_site` and `https://n8n.sablia.io/webhook/formulaire_rdv`. | `components/ui/CTAStaticForm.tsx:161`, `CTAPopupForm.tsx:188`, `ContactModal.tsx:33` | Should be env vars; contain old "voipia" name |
| H3 | **Duplicate CTA forms** — `CTAPopupForm.tsx` (484 lines) and `CTAStaticForm.tsx` (404 lines) have identical FormData, FormField, and handleSubmit logic. Only difference: popup vs inline layout. | `components/ui/CTAPopupForm.tsx`, `CTAStaticForm.tsx` | Double maintenance burden |
| H4 | **Duplicate ConsumptionKPIGrid** — Two components with same name in different directories, accepting different types (`ConsumptionMetrics` vs `UserConsumptionResponse`). | `components/dashboard/Financial/ConsumptionKPIGrid.tsx`, `components/dashboard/Consumption/ConsumptionKPIGrid.tsx` | Name collision, confusing |
| H5 | **Financial page has no admin gate** — No server-side admin check. Non-admins see empty UI (RPC returns nothing but page renders). | `app/dashboard/financial/page.tsx` | UX issue for non-admins |
| H6 | **3 versions of checkIsAdmin** — Layout (server + userId), admin/calls (server + userId), global.ts (browser, no userId). | `app/dashboard/layout.tsx`, `app/dashboard/admin/calls/page.tsx`, `lib/queries/global.ts` | Inconsistent, error-prone |
| H7 | **CallDetailModalContent duplicates CallDetailClient** — 402 lines vs 418 lines, near-identical code for modal vs full page call detail. | `app/dashboard/@modal/.../CallDetailModalContent.tsx`, `app/dashboard/agents/.../CallDetailClient.tsx` | Double maintenance |
| H8 | **VoIPIA references throughout landing** — SDRComparison, HowItWorksV2, IntegrationsTriple, FAQAccordion, DashboardShowcase all reference "VoIPIA". | `components/landing/` (5 files) | Brand inconsistency |
| H9 | **VoIPIA in financial filter** — `ClientBreakdownTable.tsx` and `ClientBreakdownTableV2.tsx` filter out "voipia" by hardcoded string match. | `components/dashboard/Financial/ClientBreakdown*.tsx` | Should use constant or config |

---

## Medium (Code Quality)

| # | Issue | File(s) | Impact |
|---|-------|---------|--------|
| M1 | **Systemic `any` types in Recharts** — ~20 instances of `(props: any)` in custom tooltip/legend renderers. Recharts v3 exports proper types. | `components/dashboard/Charts/` (8+ files), `Financial/` (3 files) | Type safety gap |
| M2 | **Redundant auth checks** — Every dashboard page calls `getUser()` + redirect, duplicating the layout check. | All `app/dashboard/*/page.tsx` | Unnecessary DB calls per request |
| M3 | **Consumption dates not URL-synced** — `UserConsumptionDashboardClient` uses local `useState` for dates instead of nuqs URL params. | `app/dashboard/consumption/UserConsumptionDashboardClient.tsx` | Filter state lost on navigation/refresh |
| M4 | **No test coverage** — Test infrastructure (Vitest + RTL) exists but zero tests written. | `test/` directory | No regression safety net |
| M5 | **Large files needing splitting** — Multiple files exceed 400 lines with mixed concerns. | See "Large Files" section below | Hard to maintain |
| M6 | **Inline Recharts styles** — `style={{ fontSize: '12px' }}` repeated verbatim across all chart components. | `components/dashboard/Charts/` (16 files) | Repetition, no shared constant |
| ~~M7~~ | ~~**Stale sitemap and robots**~~ — Resolved: dead routes removed from sitemap.ts and robots.ts. | | |
| M8 | **`redirect` param set but never consumed** — Middleware sets `?redirect=<path>` but LoginForm always redirects to `/dashboard`. | `middleware.ts`, `components/auth/LoginForm.tsx` | Users lose deep-link context |
| M9 | **Chatbot webhook URL hardcoded** — `lib/constants.ts` hardcodes `https://n8n.sablia.io/webhook/chatbot-iapreneurs`. | `lib/constants.ts:92` | Should be env var |
| M10 | **Two answered definitions in SQL** — `v_agent_calls_enriched` and `get_admin_calls_paginated` use different outcome exclusion lists. | Supabase functions | Potential metric discrepancy |

---

## Low (Cleanup)

| # | Issue | File(s) | Impact |
|---|-------|---------|--------|
| L1 | **Performance page not in sidebar** — Route exists but no `SidebarConfig` entry. | `components/dashboard/Sidebar/SidebarConfig.ts` | Must access via direct URL |
| L2 | **`use client` unnecessary** — `WaveBackground.tsx` and `EmptyState.tsx` have `'use client'` but contain no hooks or browser APIs. | `components/animations/WaveBackground.tsx`, `components/dashboard/EmptyState.tsx` | Prevents server rendering |
| L3 | **ESLint disable comment** — `react-hooks/exhaustive-deps` suppressed in ClientAgentFilter. | `components/dashboard/Filters/ClientAgentFilter.tsx:55` | Potential stale closure bug |
| ~~L4~~ | ~~**`@tremor/**` in Tailwind content**~~ — Resolved: removed from tailwind.config.ts. | | |
| L5 | **French docs** — `DATABASE_BACKUP_GUIDE.md` and `MIGRATION_BEST_PRACTICES.md` are in French (internal docs should be English per policy). | `docs/` | Language inconsistency |
| ~~L6~~ | ~~**Dead `.claude/commands`**~~ — Resolved: deleted generate-prp.md and execute-prp.md. | | |
| ~~L7~~ | ~~**Stale types in `lib/types/database.ts`**~~ — Resolved: file deleted. | | |

---

## Dead Code (Confirmed Unused)

> **Resolved** — All dead files (29), dead exports (4 functions), dead assets (7), and dead config entries were removed in the dead code cleanup pass (2026-03-02).

---

## Large Files (>300 lines, Potential Split Candidates)

| File | Lines | Notes |
|------|-------|-------|
| `components/ui/sidebar.tsx` | 745 | shadcn generated — acceptable |
| `lib/types/financial.ts` | 544 | Could split: leasing, consumption, invoice |
| `components/dashboard/AdminCalls/AdminCallsTable.tsx` | 536 | Mixed: table render, scroll, columns, row clicks |
| `components/ui/CTAPopupForm.tsx` | 484 | Near-duplicate of CTAStaticForm |
| `components/landing/DashboardShowcase.tsx` | 462 | Huge mock UI, hardcoded demo data |
| `app/dashboard/agents/[agentId]/calls/[callId]/CallDetailClient.tsx` | 418 | Call detail + transcript + audio + metadata |
| `lib/types/dashboard.ts` | 411 | All dashboard types in one file |
| `components/ui/CTAStaticForm.tsx` | 404 | Near-duplicate of CTAPopupForm |
| `app/dashboard/@modal/.../CallDetailModalContent.tsx` | 402 | Near-duplicate of CallDetailClient |
| `lib/queries/financial.ts` | 401 | 10+ query functions |
| `lib/queries/global.ts` | 392 | Many global queries |
| `components/dashboard/KPIGrid.tsx` | 386 | All KPI variants |
| `components/dashboard/Financial/CostBreakdownChart.tsx` | 379 | Three chart variants + tooltip |
