# Tech Debt Inventory — Sablia Vox

> Complete inventory of tech debt, dead code, and inconsistencies. Last updated: 2026-04-13.
> Units 1-6 of vox-saas-master plan resolved the majority of items. Remaining items listed below.

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
| ~~H3~~ | ~~**Duplicate CTA forms**~~ — Resolved: shared logic extracted to `components/ui/cta-form/CTAFormCore.tsx`. Both forms now compose around the shared core. Fixed 2026-04-13 (Unit 6 Phase D). | | |
| H4 | **Duplicate ConsumptionKPIGrid** — Two components with same name in different directories, accepting different types (`ConsumptionMetrics` vs `UserConsumptionResponse`). | `components/dashboard/Financial/ConsumptionKPIGrid.tsx`, `components/dashboard/Consumption/ConsumptionKPIGrid.tsx` | Name collision, confusing |
| ~~H5~~ | ~~**Financial page has no admin gate** — Resolved: financial route deleted (no longer exists).~~ | | |
| ~~H6~~ | ~~**3 versions of checkIsAdmin** — Consolidated to 2 canonical versions: `checkIsAdminServer()` in `lib/auth.ts` (server) + `checkIsAdmin()` in `lib/queries/global.ts` (browser). Both use same query pattern, scoped by RLS. Fixed 2026-04-12.~~ | | |
| ~~H7~~ | ~~**CallDetailModalContent duplicates CallDetailClient**~~ — Resolved: shared `CallDetailContent` component extracted to `components/dashboard/CallDetail/`. Both page and modal compose around it. Fixed 2026-04-13 (Unit 6 Phase D). | | |
| ~~H8~~ | ~~**VoIPIA references throughout landing** — Resolved: landing rebuilt, zero VoIPIA references. Verified 2026-04-12.~~ | | |
| ~~H9~~ | ~~**VoIPIA in financial filter** — Resolved: financial components deleted.~~ | | |

---

## Medium (Code Quality)

| # | Issue | File(s) | Impact |
|---|-------|---------|--------|
| M1 | **Remaining `any` types in Recharts** — ~6 instances in `EmotionDistribution.tsx` and `OutcomeBreakdown.tsx` custom tooltip/legend renderers. Down from ~20 (Unit 6 Phase A). | `components/dashboard/Charts/` (2 files) | Minor type safety gap |
| ~~M2~~ | ~~**Redundant auth checks**~~ — Resolved: redundant `getUser()` + redirect removed from individual page.tsx files. Layout handles auth guard. Fixed 2026-04-13 (Unit 6 Phase D). | | |
| M3 | **Consumption dates not URL-synced** — `UserConsumptionDashboardClient` uses local `useState` for dates instead of nuqs URL params. | `app/dashboard/consumption/UserConsumptionDashboardClient.tsx` | Filter state lost on navigation/refresh |
| M4 | **No test coverage** — Test infrastructure (Vitest + RTL) exists but zero tests written. | `test/` directory | No regression safety net |
| M5 | **Large files needing splitting** — Multiple files exceed 400 lines with mixed concerns. | See "Large Files" section below | Hard to maintain |
| ~~M6~~ | ~~**Inline Recharts styles**~~ — Resolved: shared constants extracted to `lib/chart-config.ts`. All chart components import from there. Fixed 2026-04-13 (Unit 6 Phase D). | | |
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
| ~~L5~~ | ~~**French docs**~~ — Resolved: `DATABASE_BACKUP_GUIDE.md` and `MIGRATION_BEST_PRACTICES.md` translated to English. Fixed 2026-04-13 (Unit 6 Phase D). | | |
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

Most previously large files were resolved in Units 1-6:
- `CTAPopupForm.tsx` (484→117), `CTAStaticForm.tsx` (404→49) — shared core extracted
- `CallDetailClient.tsx` (418→75), `CallDetailModalContent.tsx` (402→96) — shared component extracted
- `AdminCallsTable.tsx`, `Financial/`, `CostBreakdownChart.tsx` — routes deleted
- `lib/types/financial.ts`, `lib/queries/financial.ts` — routes deleted
- `KPIGrid.tsx` (386→223), `lib/queries/global.ts` (392→277), `lib/types/dashboard.ts` (411→203) — reduced through cleanup
