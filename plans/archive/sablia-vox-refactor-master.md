# Master Plan — Sablia Vox Refactoring

> Clean up tech debt while keeping all features intact.
> Source of truth: `PRD.md` | Tech debt inventory: `docs/TECH_DEBT.md`
> Status: **New — 7 units, PRD approved**

---

## Overview

| Property | Value |
|----------|-------|
| Goal | Document everything, then clean up — same features, better architecture |
| Scope | Code cleanup only — no new features, no UX redesign |
| Approach | Bottom-up: dead code → config → consistency → architecture → testing |
| Total units | 7 |
| Estimated sessions | 7-10 |

---

## Unit 1: Dead Code Removal

**Slug**: `sablia-vox-dead-code`

**Scope**: Delete all confirmed dead files, exports, and stale references.

**Tasks**:
1. Delete orphaned files (16 files — see `docs/TECH_DEBT.md` "Dead Code" section)
2. Remove dead exports from `lib/constants.ts` (keep only `chatbotConfig`)
3. Remove dead exports from `lib/queries/louis.ts` (Nestenn functions)
4. Remove dead hook `useLouisAgentPerformance` from `useDashboardData.ts`
5. Remove stale types in `lib/types/database.ts` (legacy schema types)
6. Fix `app/sitemap.ts` — remove `/louis`, `/arthur`, `/alexandra` entries
7. Fix `app/robots.ts` — remove `/landingv2/` disallow rule
8. Delete `.claude/commands/generate-prp.md` and `execute-prp.md`
9. Delete `features/auth-migration/PROGRESS.md` (stale planning doc)

**Entry criteria**: Documentation approved (this plan)
**Exit criteria**: `npm run build` succeeds, `npm run lint` clean, no import errors
**Validate**: `/validate`
**Risks**: Some files may have hidden imports — verify with `grep` before deleting

---

## Unit 2: Config & Dependencies Cleanup

**Slug**: `sablia-vox-config-cleanup`

**Scope**: Fix config conflicts, dependency issues, and environment variables.

**Tasks**:
1. Delete `.eslintrc.json`
2. Remove `eslint` and `eslint-config-next` from devDependencies
3. Move `@tanstack/react-query-devtools` from `dependencies` to `devDependencies`
4. Remove `@tremor/**` from `tailwind.config.ts` content paths (not installed)
5. Extract hardcoded webhook URLs to environment variables:
   - `NEXT_PUBLIC_CTA_WEBHOOK_URL` (CTAStaticForm, CTAPopupForm)
   - `NEXT_PUBLIC_CONTACT_WEBHOOK_URL` (ContactModal)
   - `NEXT_PUBLIC_CHATBOT_WEBHOOK_URL` (lib/constants.ts)
6. Add the new env vars to `.env.example`
7. Update `components/ui/CTAStaticForm.tsx`, `CTAPopupForm.tsx`, `ContactModal.tsx`, `lib/constants.ts` to use env vars

**Entry criteria**: Unit 1 complete
**Exit criteria**: `npm run build` succeeds, no ESLint config, devtools not in prod bundle
**Validate**: `/validate`
**Risks**: Env vars must be set on Vercel before deploying

---

## Unit 3: Deduplication & Consolidation

**Slug**: `sablia-vox-dedup`

**Scope**: Merge duplicate components and consolidate shared logic.

**Tasks**:
1. **CTA Form consolidation**: Extract shared form logic from `CTAPopupForm.tsx` and `CTAStaticForm.tsx` into a single `CTAForm` component with a `variant: 'popup' | 'inline'` prop
2. **Call detail deduplication**: Extract shared logic from `CallDetailClient.tsx` and `CallDetailModalContent.tsx` into a `CallDetail` component, used by both the page and modal
3. **ConsumptionKPIGrid rename**: Rename `Financial/ConsumptionKPIGrid` to `FinancialConsumptionKPIGrid` to avoid name collision with `Consumption/ConsumptionKPIGrid`
4. **checkIsAdmin consolidation**: Create `lib/queries/auth.ts` with a single `checkIsAdmin(supabase, userId?)` function, replace all 3 implementations
5. **ClientBreakdownTable**: Delete V1, rename V2 to drop the "V2" suffix
6. **VoIPIA filter constant**: Replace hardcoded `'voipia'` string in financial tables with `INTERNAL_CLIENT_NAME` constant

**Entry criteria**: Unit 2 complete
**Exit criteria**: No duplicate components, `npm run build` succeeds
**Validate**: `/validate`
**Risks**: CTA form consolidation is the highest-risk task — test both popup and inline variants

---

## Unit 4: Auth & Route Consistency

**Slug**: `sablia-vox-auth-consistency`

**Scope**: Fix auth inconsistencies, broken routes, and missing guards.

**Tasks**:
1. **Fix AgentTree route** — Change `/dashboard/agent/` to `/dashboard/agents/` in `AgentTree.tsx`
2. **Add admin gate to financial page** — Add server-side admin check in `app/dashboard/financial/page.tsx` (match pattern from `admin/calls/page.tsx`)
3. **Remove redundant auth checks** — Remove individual `getUser()` + redirect from pages that are already covered by `dashboard/layout.tsx` (keep layout check as single source of truth)
4. **Fix redirect param** — Make `LoginForm` read `?redirect=` param and use it on successful login
5. **Add Performance to sidebar** — Add entry in `SidebarConfig.ts` (currently reachable only via direct URL)
6. **Fix `clients/layout.tsx`** — Add explicit `userId` filter to admin check query (don't rely solely on RLS)

**Entry criteria**: Unit 3 complete
**Exit criteria**: AgentTree links work, financial page has admin gate, auth check is single source of truth
**Validate**: `/validate` + `/e2e-test sablia-vox` (auth flows)
**Risks**: Removing redundant auth checks from pages — must verify layout check covers all cases

---

## Unit 5: Code Quality & Types

**Slug**: `sablia-vox-code-quality`

**Scope**: Fix type safety, remove unnecessary directives, clean up patterns.

**Tasks**:
1. **Fix Recharts `any` types** — Replace `(props: any)` with proper Recharts types (`TooltipProps`, `LegendProps`, etc.) across all chart components (~20 instances in 11 files)
2. **Extract chart style constant** — Create `CHART_STYLE` constant for shared Recharts styles (`fontSize: '12px'`), replace inline styles
3. **Remove unnecessary `'use client'`** — Remove from `WaveBackground.tsx`, `EmptyState.tsx`, and any other files that don't need it
4. **Fix Consumption URL state** — Convert `UserConsumptionDashboardClient` local `useState` dates to nuqs URL params (match pattern from other dashboard pages)
5. **Clean up ESLint disable comments** — Fix the actual dependency issue in `ClientAgentFilter.tsx` instead of suppressing

**Entry criteria**: Unit 4 complete
**Exit criteria**: Zero `any` types in chart components, consistent URL state, `npm run lint` clean
**Validate**: `/validate`
**Risks**: Low — type changes and style extraction are safe refactors

---

## Unit 6: VoIPIA Rebrand Completion

**Slug**: `sablia-vox-rebrand`

**Scope**: Replace remaining VoIPIA references in client-facing content.

**Tasks**:
1. **Landing page content** — Update "VoIPIA" to "Sablia Vox" in: SDRComparison, HowItWorksV2, IntegrationsTriple, FAQAccordion, DashboardShowcase (5 files)
2. **CTA forms** — Update "Co-Fondateur VoIPIA" text (after Unit 3 consolidation, only 1 file to change)
3. **DashboardShowcase** — Update `app.voipia.fr/dashboard` to `vox.sablia.io/dashboard`
4. **n8n webhook names** — Ask Brice to rename webhook `voipia_louis_from_site` → `sablia_cta_demo` in n8n, then update env var value

**Entry criteria**: Unit 5 complete + Brice confirmation on n8n webhook rename
**Exit criteria**: Zero "voipia" or "VoIPIA" references in client-facing code
**Validate**: `/validate` + manual visual check of landing page
**Risks**: n8n webhook rename requires Brice action — coordinate before starting

---

## Unit 7: Test Foundation

**Slug**: `sablia-vox-tests`

**Scope**: Write foundational tests for the most critical paths.

**Tasks**:
1. **Auth utilities test** — Test `checkIsAdmin` (the consolidated version from Unit 4)
2. **KPI calculation test** — Test that query functions correctly calculate answer rate, conversion rate
3. **Dashboard filters test** — Test `useDashboardFilters` hook with nuqs
4. **CTA form test** — Test form submission, validation, error states (the consolidated version from Unit 3)
5. **CSV export test** — Test `buildCSV`, `downloadCSV` utilities
6. **LoginForm test** — Test login flow, error display
7. **AdminCallsFilters test** — Test filter interactions
8. **KPIGrid test** — Test rendering with different data shapes

**Entry criteria**: Unit 6 complete (all code stabilized)
**Exit criteria**: `npm test` passes with >0% coverage on critical paths
**Validate**: `/validate`
**Risks**: Low — tests are additive, no production code changes

---

## Sync Points

After each unit:
1. Did the exit criteria pass?
2. Did we discover new tech debt? → Update `docs/TECH_DEBT.md`
3. Does the next unit's scope need adjustment?
4. Update this master plan if needed (edit in place)

---

## Documentation Sources & Targets

| Document | Role | Updated By |
|----------|------|-----------|
| `PRD.md` | Source + Target | Updated by this architect session; update after Unit 6 (rebrand) |
| `CLAUDE.md` | Source + Target | Updated by this architect session; verify after each unit |
| `docs/ARCHITECTURE.md` | Source + Target | Created by this session; update after Unit 3 (dedup) and Unit 4 (auth) |
| `docs/DATABASE_REFERENCE.md` | Source + Target | Updated by this session; no changes expected during refactoring |
| `docs/TECH_DEBT.md` | Source + Target | Created by this session; update at each sync point |
| `docs/KNOWN_ISSUES.md` | Source | No changes expected |

---

## Execution Sequence

```
/plan sablia-vox-dead-code         → /execute → /validate → sync
/plan sablia-vox-config-cleanup    → /execute → /validate → sync
/plan sablia-vox-dedup             → /execute → /validate → sync
/plan sablia-vox-auth-consistency  → /execute → /validate → sync
/plan sablia-vox-code-quality      → /execute → /validate → sync
/plan sablia-vox-rebrand           → /execute → /validate → sync
/plan sablia-vox-tests             → /execute → /validate → /close
```
