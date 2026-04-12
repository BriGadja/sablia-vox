# Tech Debt Inventory — Sablia Vox

> Complete inventory of tech debt, dead code, and inconsistencies. Last updated: 2026-04-12.
> This document drives the refactoring plan at `plans/sablia-vox-refactor-master.md`.

---

## Critical (Functional Bugs / Production Risk)

| # | Issue | File(s) | Impact |
|---|-------|---------|--------|
| ~~C1~~ | ~~**AgentTree links to dead route** — Fixed: links now point to `/dashboard/agents/[id]` (plural). Verified 2026-04-12.~~ | | |
| ~~C2~~ | ~~**react-query-devtools in production deps**~~ — Resolved: moved to devDependencies + dev-only dynamic import in providers.tsx. | | |
| C3 | **Unapplied migration** — `20260302_remove_leasing_prorata.sql` exists but is not applied. Frontend `InvoiceSummaryTable` still renders prorata rows. | `supabase/migrations/`, `components/dashboard/Financial/InvoiceSummaryTable.tsx` | Frontend/DB divergence after migration is applied |

---

## High (Architecture / Maintainability)

| # | Issue | File(s) | Impact |
|---|-------|---------|--------|
| ~~H1~~ | ~~**ESLint + Biome dual config**~~ — Resolved: ESLint removed, Biome is sole linter. | | |
| ~~H2~~ | ~~**Hardcoded webhook URLs**~~ — Resolved: CTA forms and chatbot now use `NEXT_PUBLIC_CTA_WEBHOOK_URL` and `NEXT_PUBLIC_CHATBOT_WEBHOOK_URL` env vars. | | |
| H3 | **Duplicate CTA forms** — `CTAPopupForm.tsx` (484 lines) and `CTAStaticForm.tsx` (404 lines) have identical FormData, FormField, and handleSubmit logic. Only difference: popup vs inline layout. | `components/ui/CTAPopupForm.tsx`, `CTAStaticForm.tsx` | Double maintenance burden |
| H4 | **Duplicate ConsumptionKPIGrid** — Two components with same name in different directories, accepting different types (`ConsumptionMetrics` vs `UserConsumptionResponse`). | `components/dashboard/Financial/ConsumptionKPIGrid.tsx`, `components/dashboard/Consumption/ConsumptionKPIGrid.tsx` | Name collision, confusing |
| ~~H5~~ | ~~**Financial page has no admin gate** — Resolved: financial route deleted (no longer exists).~~ | | |
| ~~H6~~ | ~~**3 versions of checkIsAdmin** — Consolidated to 2 canonical versions: `checkIsAdminServer()` in `lib/auth.ts` (server) + `checkIsAdmin()` in `lib/queries/global.ts` (browser). Both use same query pattern, scoped by RLS. Fixed 2026-04-12.~~ | | |
| H7 | **CallDetailModalContent duplicates CallDetailClient** — 402 lines vs 418 lines, near-identical code for modal vs full page call detail. | `app/dashboard/@modal/.../CallDetailModalContent.tsx`, `app/dashboard/agents/.../CallDetailClient.tsx` | Double maintenance |
| ~~H8~~ | ~~**VoIPIA references throughout landing** — Resolved: landing rebuilt, zero VoIPIA references. Verified 2026-04-12.~~ | | |
| ~~H9~~ | ~~**VoIPIA in financial filter** — Resolved: financial components deleted.~~ | | |

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
| ~~M8~~ | ~~**`redirect` param set but never consumed** — Fixed: LoginForm now reads `?redirect=` via `useSearchParams()` with URL-constructor open-redirect validation. Fixed 2026-04-12.~~ | | |
| ~~M9~~ | ~~**Chatbot webhook URL hardcoded**~~ — Resolved: uses `NEXT_PUBLIC_CHATBOT_WEBHOOK_URL` env var with fallback. | | |
| M10 | **Two answered definitions in SQL** — `v_agent_calls_enriched` and `get_admin_calls_paginated` use different outcome exclusion lists. | Supabase functions | Potential metric discrepancy |

---

## Low (Cleanup)

| # | Issue | File(s) | Impact |
|---|-------|---------|--------|
| ~~L1~~ | ~~**Performance page not in sidebar** — Resolved: performance route doesn't exist (stale entry).~~ | | |
| ~~L2~~ | ~~**`use client` unnecessary** — Resolved: files deleted in dead code cleanup.~~ | | |
| ~~L3~~ | ~~**ESLint disable comment** — Fixed: replaced with `useRef` pattern in `AgentFilter.tsx` (renamed from ClientAgentFilter). Fixed 2026-04-12.~~ | | |
| ~~L4~~ | ~~**`@tremor/**` in Tailwind content**~~ — Resolved: removed from tailwind.config.ts. | | |
| L5 | **French docs** — `DATABASE_BACKUP_GUIDE.md` and `MIGRATION_BEST_PRACTICES.md` are in French (internal docs should be English per policy). | `docs/` | Language inconsistency |
| ~~L6~~ | ~~**Dead `.claude/commands`**~~ — Resolved: deleted generate-prp.md and execute-prp.md. | | |
| ~~L7~~ | ~~**Stale types in `lib/types/database.ts`**~~ — Resolved: file deleted. | | |
| ~~L8~~ | ~~**Overview page padding inconsistency** — Fixed: standardized to `p-6` and `gap-4`. Fixed 2026-04-12.~~ | | |
| ~~L9~~ | ~~**Chart height approach differences** — Fixed: standardized to `h-[300px]` across all dashboard charts. Fixed 2026-04-12.~~ | | |
| ~~L10~~ | ~~**Loading fallback heights** — Fixed: `h-screen` → `h-full` in all 6 dashboard Suspense fallbacks. Fixed 2026-04-12.~~ | | |
| ~~L11~~ | ~~**`formatRelativeTime` null handling** — Resolved: already handles null correctly.~~ | | |
| ~~L12~~ | ~~**Radix CSS var syntax (animation origins)** — Fixed: `origin-[--radix-*]` → `origin-(--radix-*)` in dropdown-menu.tsx, tooltip.tsx, and select.tsx (3 files, 4 occurrences). Fixed 2026-04-12.~~ | | |
| ~~L13~~ | ~~**Custom 404 page for dashboard** — Fixed: created `app/dashboard/not-found.tsx` with dark theme + `[...not-found]/page.tsx` catch-all. Fixed 2026-04-12.~~ | | |

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
