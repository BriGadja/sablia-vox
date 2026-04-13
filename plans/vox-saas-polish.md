# Sablia Vox — Polish, Performance & Documentation Plan

## Executive Summary

Unit 6 (final) of vox-saas-master. Comprehensive polish pass: zero Biome lint errors, spinner→skeleton migration, CSS page transitions, responsive fixes, tech debt cleanup (H3/H7/M1/M2/M6/L5), documentation updates (PRD.md/CLAUDE.md/ARCHITECTURE.md/TECH_DEBT.md), Lighthouse performance verification, and autoresearch baseline establishment.

**Master plan**: `plans/vox-saas-master.md` (challenged GO, 2026-04-12)
**PRD**: `PRD-saas.md` (Phase 1+2 scope)
**Design spec**: `DESIGN-SPEC.md`
**Research**: `research/plan/2026-04-13-vox-saas-polish.md`

**Confidence**: 8/10 — all changes are well-scoped, no DB migrations, no new features. Risk: a11y lint fixes in Modal/breadcrumb may require design pattern changes; Lighthouse targets depend on current Vercel deployment performance.

## Phase Status
| Phase | Name | Tasks |
|-------|------|-------|
| A | Lint Zero | 5 |
| B | Loading States & Page Transitions | 5 |
| C | Responsive & Visual Polish | 4 |
| D | Tech Debt Cleanup | 6 |
| E | Documentation, Performance & Verification | 5 |

---

## Phase A: Lint Zero

Skill: `/execute` (direct implementation)

Bring Biome from 144 errors to 0. Foundation for all subsequent phases — clean codebase before touching anything else.

### Tasks
- [x] A1: Run `npx @biomejs/biome check --write --unsafe .` to auto-fix errors. Note: `--write` alone only applies **safe** fixes (format, organizeImports, noEmptyInterface). The `--unsafe` flag is required for `useTemplate`, `useExhaustiveDependencies`, `noUnusedVariables` which have unsafe-only fixes. Verify with `npm run lint` afterward. Review unsafe fixes for correctness (especially exhaustive deps — auto-fix may add unwanted dependencies)
- [x] A2: Configure Biome to parse Tailwind v4 CSS directives — add `"css": { "parser": { "tailwindDirectives": true } }` to `biome.json`. Available since Biome 2.3.0 (project is on 2.4.10). This fixes the 38 parse errors from `@theme`/`@utility`/`@variant` syntax while keeping CSS linting active for real errors. Do NOT use `files.ignore` (removed in Biome v2.0.0) or `files.includes` exclusion (silences all CSS linting). Verify no CSS parse errors remain
- [x] A3: Fix ~30 quick manual lint errors:
  - Add `type="button"` to 15 `<button>` elements across 9 files (`DateRangeFilter.tsx` ×6, `CallsListClient.tsx` ×2, `CTAPopupForm.tsx` ×1, `SuccessToast.tsx` ×1, `Modal.tsx` ×1, `ExportCSVButton.tsx` ×1, `DashboardErrorFallback.tsx` ×1, `LogoutButton.tsx` ×1, `HeaderV2.tsx` ×1)
  - Fix 3 unused variables (`auth/confirm/page.tsx` `data` → `_data`, `auth/reset-password/page.tsx` `err` → `_err`, `auth/update-password/page.tsx` `err` → `_err`)
  - Fix 3 unused vars in `OverviewDashboardClient.tsx` (remove or prefix with `_`)
  - Fix `forEach` return pattern in `lib/supabase/server.ts` and `middleware.ts` (Supabase cookie `setAll` — use `for...of` instead)
  - Fix `noArrayIndexKey` in 5 files: use stable data keys where available (label, name), add `biome-ignore` with justification for `loading.tsx` skeleton arrays
  - Fix `noUnknownMediaFeatureName` and `noInvalidPositionAtImportRule` in `globals.css`
- [x] A4: Fix ~20 medium lint errors (type safety + env vars):
  - Define Recharts payload interfaces in `EmotionDistribution.tsx` and `OutcomeBreakdown.tsx` (replace 6 `any` types with `TooltipContentProps<number, string>` — Recharts v3 renamed `TooltipProps` to `TooltipContentProps` for custom tooltip content components — and typed legend payload via `LegendProps`)
  - Type vitest mocks properly in `vitest.setup.tsx` (2 `any` types → typed mock objects)
  - Fix `ChatbotInput.tsx` any (1 event handler) and `useSessionStorage.ts` any (1 generic)
  - Replace `process.env.*!` non-null assertions in `lib/supabase/admin.ts`, `lib/supabase/client.ts`, `lib/supabase/server.ts`, `middleware.ts` — use `biome-ignore lint/style/noNonNullAssertion: env var required at build time` inline comments. Avoid `lib/env.ts` with eager `requireEnv()` — it breaks Next.js static generation (module evaluated at build time when env vars may not be set). The `biome-ignore` approach is deliberate: these env vars are mandatory and Next.js build explicitly fails without them
- [x] A5: Fix ~10 a11y lint errors:
  - `Modal.tsx`: Add `role="presentation"` to backdrop div + `onKeyDown` handler for Escape (fixes `noStaticElementInteractions` ×2 + `useKeyWithClickEvents` ×2). Or convert to use shadcn `Dialog` component (preferred — already in project)
  - `breadcrumb.tsx`: Fix `useFocusableInteractive` + `useSemanticElements` — replace `<span>` with `<a>` for breadcrumb items, or add `role="link"` + `tabIndex={0}`
  - `AgentFilter.tsx`, `CTAPopupForm.tsx`, `CTAStaticForm.tsx`: Fix `noLabelWithoutControl` — associate `<label>` with form inputs via `htmlFor` prop
  - `vitest.setup.tsx`: Add `alt=""` to mock `<img>` element (decorative image mock)
  - `sidebar.tsx`: Replace `document.cookie` with a cookie utility or `cookies-next` pattern (fixes `noDocumentCookie`)

### Technical Details

**Biome Tailwind v4 CSS parsing** (`biome.json`):
```json
{
  "css": {
    "parser": {
      "tailwindDirectives": true
    }
  }
}
```
This tells Biome's CSS parser to recognize Tailwind v4 at-rules (`@theme`, `@utility`, `@variant`, `@plugin`) instead of treating them as parse errors. Available since Biome 2.3.0. Keeps CSS linting active for real errors, unlike file exclusion.

**Env var non-null assertion pattern** (inline biome-ignore):
```typescript
// In lib/supabase/admin.ts, client.ts, server.ts, middleware.ts:
// biome-ignore lint/style/noNonNullAssertion: required env var — build fails without it
process.env.NEXT_PUBLIC_SUPABASE_URL!
```
Note: a centralized `lib/env.ts` with eager `requireEnv()` was considered but rejected — it breaks Next.js static generation because the module is evaluated at build time when env vars may not be set in all contexts.

### Verification Constraints
| Type | Target | Assertion | Method |
|------|--------|-----------|--------|
| count-check | Biome errors | Zero lint errors | `cd /home/sablia/workspace/projects/internal/websites/sablia-vox && npx @biomejs/biome check . 2>&1 | grep -c 'Found [0-9]* errors' | grep -q '^0$' || npx @biomejs/biome check . 2>&1 | tail -5 | grep -q 'Checked.*No fixes'` |
| contains | biome.json | Tailwind directives parser enabled | `grep -q 'tailwindDirectives' /home/sablia/workspace/projects/internal/websites/sablia-vox/biome.json` |
| count-check | any types | Zero explicit any in new code | `cd /home/sablia/workspace/projects/internal/websites/sablia-vox && grep -r 'any' components/dashboard/Charts/EmotionDistribution.tsx components/dashboard/Charts/OutcomeBreakdown.tsx 2>/dev/null | grep -v 'biome-ignore' | grep -v '//' | grep -c 'any' | grep -q '^0$'` |

---

## Phase B: Loading States & Page Transitions

Skill: `/execute` (direct implementation) + `/frontend-design` (skeleton design)

Replace all 16 page-level spinners with content-shaped skeletons. Add CSS fade transitions between dashboard routes.

### Tasks
- [x] B1: Create reusable skeleton components in `components/skeletons/`:
  - `DashboardSkeleton.tsx` — 5 KPI card placeholders + 2 chart placeholders (overview pattern)
  - `AgentsGridSkeleton.tsx` — 3-6 card placeholders in responsive grid
  - `AgentDetailSkeleton.tsx` — header + KPI row + 2×2 chart grid placeholders
  - `TableSkeleton.tsx` — table header + N row placeholders (configurable rows prop)
  - `CallDetailSkeleton.tsx` — metadata cards + audio player placeholder + transcript placeholder
  - `ConsumptionSkeleton.tsx` — date picker row + 2-4 agent card placeholders + totals
  - `SettingsSkeleton.tsx` — tab bar + form fields / member list placeholders
  All use `Skeleton` from `components/ui/skeleton.tsx` (existing). All use `animate-pulse`. Shape matches actual content layout to prevent CLS
- [x] B2: Replace 10 Suspense fallback spinners in `page.tsx` server components (S1-S9, S12) with the appropriate skeleton from B1. These are `<Suspense fallback={<Loader2 />}>` wrappers in page files. For S1 (layout.tsx), use `DashboardSkeleton` as the general fallback — no separate LayoutSkeleton needed. Auth pages (S15, S16) keep spinners — they're processing states, not data loading. **Note**: some routes have spinners in BOTH their page.tsx (Suspense, handled here) AND their client component (isLoading, handled in B3) — these are distinct spinners and both must be replaced
- [x] B3: Replace 7 TanStack Query `isLoading` spinners in client components (S4, S6, S8, S10, S11, S13, S14) with inline skeletons. Pattern: `if (isLoading) return <AgentDetailSkeleton />` instead of `if (isLoading) return <div className="flex ..."><Loader2 /></div>`. These are the `isLoading` checks inside `AgentsListClient` (S4), `AgentDetailClient` (S6), `CallsListClient` (S8), `CallDetailClient` (S10), `CallDetailModalContent` (S11), `ConsumptionClient` (S13), `SettingsClient` (S14)
- [x] B4: Add CSS page fade-in animation to `globals.css` and apply to all dashboard pages:
  ```css
  @keyframes page-fade-in {
    from { opacity: 0; transform: translateY(3px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .page-fade-in {
    animation: page-fade-in 180ms cubic-bezier(0.4, 0, 0.2, 1) both;
  }
  @media (prefers-reduced-motion: reduce) {
    .page-fade-in { animation: none; }
  }
  ```
  Apply `page-fade-in` class to the outermost wrapper `<div>` in each dashboard page's client component (OverviewDashboardClient, AgentsListClient, AgentDetailClient, CallsListClient, CallDetailClient, ConsumptionClient, SettingsClient). NOT on layout wrapper (persists across routes — animation won't re-trigger)
- [x] B5: Verify skeletons match content shape — compare skeleton layout vs loaded layout for each page. Ensure no CLS introduced (skeleton → content transition should be same dimensions). Run `npm run type-check` and `npm run lint` to confirm no regressions

### Technical Details

**Skeleton component pattern**:
```tsx
import { Skeleton } from '@/components/ui/skeleton'

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={`kpi-${i}`} className="h-24 rounded-lg" />
        ))}
      </div>
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Skeleton className="h-[300px] rounded-lg" />
        <Skeleton className="h-[300px] rounded-lg" />
      </div>
    </div>
  )
}
```

### Verification Constraints
| Type | Target | Assertion | Method |
|------|--------|-----------|--------|
| file-exists | components/skeletons/ | Skeleton directory exists with files | `test -d /home/sablia/workspace/projects/internal/websites/sablia-vox/components/skeletons && [ $(ls /home/sablia/workspace/projects/internal/websites/sablia-vox/components/skeletons/*.tsx 2>/dev/null | wc -l) -ge 5 ]` |
| contains | globals.css | Page fade-in animation defined | `grep -q 'page-fade-in' /home/sablia/workspace/projects/internal/websites/sablia-vox/app/globals.css` |
| count-check | Dashboard client files | All 7 client components have page-fade-in | `cd /home/sablia/workspace/projects/internal/websites/sablia-vox && grep -rl 'page-fade-in' app/dashboard/ components/ | wc -l | [ $(cat) -ge 7 ]` |

---

## Phase C: Responsive & Visual Polish

Skill: `/execute` (direct implementation) + browser verification via Playwright MCP

Fix 4 identified responsive gaps. Verify all dashboard pages at 375px, 768px, 1280px.

### Tasks
- [x] C1: Fix critical responsive issues:
  - **R1** (`CallsListClient.tsx`): Wrap the calls `<table>` in `<div className="overflow-x-auto">`. On mobile (< 640px), consider converting to a stacked card layout using `hidden sm:table` / `sm:hidden` pattern for table vs cards
  - **R2** (`AgentDetailClient.tsx`): Add `flex-wrap gap-3` to the agent header flex container. Stack back button + name above the "Voir les appels" link on mobile
  - **R3** (`DashboardPreview.tsx`): Add `grid-cols-1 sm:grid-cols-3` to the mockup grid. This is decorative — `sm:` breakpoint is sufficient
  - **R4** (`OverviewDashboardClient.tsx`): Change `overflow-hidden` to `overflow-x-hidden overflow-y-auto` on the outer container to prevent vertical chart clipping
- [x] C2: Fix minor responsive issues:
  - **R5** (`ConsumptionClient.tsx`): Add `flex-wrap` to date picker row for safety on very narrow screens
  - **R6** (`AgentDetailClient.tsx`): Add `h-[250px] lg:h-[300px]` to charts for shorter mobile heights
- [x] C3: Visual consistency pass — verify padding/spacing across all dashboard pages:
  - All page wrappers use consistent padding (`p-4 sm:p-6`)
  - Card gaps use `gap-4` consistently
  - Section spacing uses `space-y-6` consistently
  - No hard-coded pixel widths that break responsive grid
- [x] C4: Browser verification at 3 breakpoints (375px, 768px, 1280px) using Playwright MCP. Take screenshots of: overview, agents list, agent detail, calls list, consumption, settings. Flag any remaining layout issues. Verify page transitions are visible on navigation

### Technical Details

**Calls list mobile pattern** (R1):
```tsx
{/* Desktop: table */}
<div className="hidden sm:block overflow-x-auto">
  <table>...</table>
</div>
{/* Mobile: cards */}
<div className="sm:hidden space-y-3">
  {calls.map(call => (
    <div key={call.id} className="glass-subtle rounded-lg p-4 space-y-2">
      <div className="flex justify-between">
        <span>{call.phone_number}</span>
        <OutcomeBadge outcome={call.outcome} />
      </div>
      <div className="text-xs text-muted-foreground">
        {formatDate(call.started_at)} · {call.duration}s
      </div>
    </div>
  ))}
</div>
```

### Verification Constraints
| Type | Target | Assertion | Method |
|------|--------|-----------|--------|
| contains | CallsListClient.tsx | Table has overflow-x-auto wrapper | `grep -q 'overflow-x-auto' /home/sablia/workspace/projects/internal/websites/sablia-vox/app/dashboard/agents/\\[agentId\\]/calls/CallsListClient.tsx` |
| contains | AgentDetailClient.tsx | Header has flex-wrap | `grep -q 'flex-wrap' /home/sablia/workspace/projects/internal/websites/sablia-vox/app/dashboard/agents/\\[agentId\\]/AgentDetailClient.tsx` |
| contains | DashboardPreview.tsx | Grid has responsive breakpoint | `grep -q 'sm:grid-cols' /home/sablia/workspace/projects/internal/websites/sablia-vox/components/landing/DashboardPreview.tsx` |

---

## Phase D: Tech Debt Cleanup

Skill: `/execute` (direct implementation)

Resolve remaining reasonable tech debt: H3 (CTA form duplication), H7 (CallDetail duplication), M1 (6 `any` types — done in A4), M2 (9 redundant auth checks), M6 (inline chart styles), L5 (French docs).

### Tasks
- [ ] D1: **H3 — Extract shared CTA form logic**: Create `components/ui/cta-form/CTAFormCore.tsx` with shared `FormData` interface, `FormField` component, `useCTAForm()` hook (validation + submission), and `CTAFormFields` component (all form fields). The hook must be parameterized — the two forms differ in: `source` field value (`'landing_cta'` in popup vs `'landing_page_tester_nos_agents'` in static), and timestamp inclusion (popup includes `timestamp`, static doesn't). Phone normalization is identical in both — shared safely. Pass these as config to the shared hook. Refactor `CTAPopupForm.tsx` and `CTAStaticForm.tsx` to compose `CTAFormFields` with their layout wrappers (modal vs inline). Target: each wrapper file < 80 lines, shared core < 300 lines. Total savings: ~300 lines of duplication
- [ ] D2: **H7 — Extract shared CallDetail content**: Create `components/dashboard/CallDetail/CallDetailContent.tsx` with shared data fetching hook, `getOutcomeDisplay`, `getEmotionDisplay`, metadata display, transcript display, and audio player integration. Add a `variant: 'page' | 'modal'` prop to handle intentional differences: modal uses smaller icons/text, different padding, and ExternalLink icon; page uses ArrowLeft back link and PageHeader. Refactor `CallDetailClient.tsx` and `CallDetailModalContent.tsx` as thin wrappers composing `CallDetailContent` with the appropriate variant. Target: each wrapper < 60 lines, shared content < 300 lines. Total savings: ~250 lines of duplication
- [ ] D3: **M2 — Remove redundant auth redirects**: The dashboard `layout.tsx` already calls `getUser()` and redirects unauthenticated users. Remove the redundant `getUser() + redirect` from 9 page files: `page.tsx`, `overview/page.tsx`, `agents/page.tsx`, `agents/[agentId]/page.tsx`, `agents/[agentId]/calls/page.tsx`, `agents/[agentId]/calls/[callId]/page.tsx`, `@modal/.../page.tsx`, `consumption/page.tsx`, `settings/page.tsx`. For pages that need `user` data (email, metadata for admin check): use a separate `getUser()` call without redirect — the layout guarantees the user exists. Settings page needs `checkIsAdminServer()` which creates its own client — leave that
- [ ] D4: **M6 — Extract shared chart style constants**: Create `lib/chart-config.ts` with:
  ```typescript
  export const CHART_AXIS_STYLE = { fontSize: '11px', fill: 'currentColor' } as const
  export const CHART_TOOLTIP_STYLE = { fontSize: '12px' } as const
  ```
  Update 5 chart files (`EmotionDistribution.tsx`, `OutcomeBreakdown.tsx`, `LatencyTimeSeriesChart.tsx`, `CallVolumeChart.tsx`, `QualityTrendChart.tsx`) to import from `lib/chart-config.ts` instead of inline styles
- [ ] D5: **L5 — Translate French docs**: Translate `docs/DATABASE_BACKUP_GUIDE.md` and `docs/MIGRATION_BEST_PRACTICES.md` from French to English. Keep technical accuracy — these are operational guides
- [ ] D6: Run full verification: `npm run type-check && npm run lint && npm run build` to confirm all refactors are clean. Verify no broken imports from moved/renamed components

### Technical Details

**CTA form extraction pattern** (D1):
```
components/ui/cta-form/
├── CTAFormCore.tsx      # FormData, FormField, useCTAForm hook, CTAFormFields
├── CTAPopupForm.tsx     # Modal wrapper → <Dialog> + <CTAFormFields />
├── CTAStaticForm.tsx    # Inline wrapper → <div> + <CTAFormFields />
└── index.ts             # Re-exports
```

**CallDetail extraction pattern** (D2):
```
components/dashboard/CallDetail/
├── CallDetailContent.tsx    # Shared content (metadata, transcript, audio, charts)
├── useCallDetail.ts         # Shared data fetching hook
└── index.ts                 # Re-exports
```

**Redundant auth check removal** (D3):
```typescript
// BEFORE (in each page.tsx):
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) redirect('/login')

// AFTER (pages that don't need user data):
// Remove entirely — layout handles auth

// AFTER (pages that need user data, e.g., settings):
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
// No redirect — layout guarantees user exists
// Use user.email, user.user_metadata, etc.
```

### Verification Constraints
| Type | Target | Assertion | Method |
|------|--------|-----------|--------|
| file-exists | CTAFormCore | Shared CTA form exists | `test -f /home/sablia/workspace/projects/internal/websites/sablia-vox/components/ui/cta-form/CTAFormCore.tsx` |
| file-exists | CallDetailContent | Shared CallDetail exists | `test -f /home/sablia/workspace/projects/internal/websites/sablia-vox/components/dashboard/CallDetail/CallDetailContent.tsx` |
| count-check | Auth redirects | Max 2 pages with redirect('/login') (layout + dashboard page.tsx redirect to overview) | `cd /home/sablia/workspace/projects/internal/websites/sablia-vox && grep -rl "redirect('/login')" app/dashboard/ | wc -l | [ $(cat) -le 2 ]` |
| file-exists | chart-config | Chart config exists | `test -f /home/sablia/workspace/projects/internal/websites/sablia-vox/lib/chart-config.ts` |

---

## Phase E: Documentation, Performance & Verification

Skill: `/execute` (documentation) + `/e2e-test` (browser) + Playwright MCP (Lighthouse)

Update all project docs to reflect Units 1-5 changes. Run Lighthouse audits. Establish autoresearch baseline.

### Tasks
- [ ] E1: **Update PRD.md** — currently dated 2026-03-02 with stale info:
  - Update Tech Stack table: Tailwind 3.4 → v4, Framer Motion 11.x → `motion/react` (Motion One), add nuqs version
  - Update Route Map: remove deleted routes (`/dashboard/clients`, `/dashboard/financial`, `/dashboard/admin/calls`, `/dashboard/performance`), add `/dashboard/consumption` (new), add `/dashboard/settings` (rebuilt)
  - Update Component references: remove deleted components (Financial, AdminCalls, Clients), add new ones (motion primitives, audio player, transcript, consumption, skeletons)
  - Update User section: add client user role description (non-admin, read-only dashboard access via magic link)
  - Add section about design system (`DESIGN-SPEC.md` reference)
- [ ] E2: **Update project CLAUDE.md** — add/update:
  - Architecture section: add `components/skeletons/`, `components/dashboard/CallDetail/`, `components/ui/cta-form/`, `lib/chart-config.ts`
  - Code Patterns section: add page fade-in animation pattern, skeleton loading pattern, CTA form composition pattern
  - Routes section: update to match current state (remove deleted routes, add new ones)
  - Design tokens reference: link to `DESIGN-SPEC.md` for full token spec
- [ ] E3: **Update docs/ARCHITECTURE.md** — currently dated 2026-03-02:
  - Update file structure tree (many directories deleted, new ones added)
  - Add auth flow diagram (magic link + password, invite flow, token_hash pattern)
  - Add design system section (motion primitives, glassmorphism tiers, skeleton patterns)
  - Update data flow section (TanStack Query hooks, Supabase RPC pattern, org-scoped JWT)
  - Remove references to deleted components/routes
- [ ] E4: **Update docs/TECH_DEBT.md** — mark newly resolved items from this unit:
  - ~~H3~~ (CTA form duplication — resolved)
  - ~~H7~~ (CallDetail duplication — resolved)
  - ~~M1~~ (any types — resolved to 0)
  - ~~M2~~ (redundant auth checks — resolved)
  - ~~M6~~ (inline chart styles — resolved)
  - ~~L5~~ (French docs — resolved)
  - Update "Large Files" section with current state
  - Note remaining items: C3 (unapplied migration), M4 (no test coverage), M5 (large files — acceptable), M10 (SQL definition discrepancy)
- [ ] E5: **Lighthouse audit + autoresearch baseline**:
  - Run Lighthouse on landing page (`vox.sablia.io`) — target: performance >= 90, a11y >= 90, SEO >= 90
  - Run Lighthouse on dashboard (`vox.sablia.io/dashboard/overview`) — target: performance >= 85, a11y >= 90
  - Measure CLS and INP on both pages
  - If targets not met: identify top 3 optimization opportunities and fix inline
  - Document baseline in `docs/AUTORESEARCH_BASELINE.md`: Lighthouse scores, bundle sizes (`npm run build` output), Core Web Vitals, animation frame rate observations
  - Run E2E flow test: invite → login → welcome modal → dashboard → agents → call detail → audio → consumption → settings

### Technical Details

**Autoresearch baseline document** (`docs/AUTORESEARCH_BASELINE.md`):
```markdown
# Autoresearch Baseline — Sablia Vox

> Captured: 2026-04-13. Baseline for `/autoresearch` continuous improvement.

## Lighthouse Scores
| Page | Performance | Accessibility | SEO | Best Practices |
|------|-------------|---------------|-----|----------------|
| Landing (/) | {score} | {score} | {score} | {score} |
| Dashboard (/dashboard/overview) | {score} | {score} | {score} | {score} |

## Core Web Vitals
| Metric | Landing | Dashboard | Target |
|--------|---------|-----------|--------|
| LCP | {ms} | {ms} | < 2500ms |
| CLS | {value} | {value} | < 0.1 |
| INP | {ms} | {ms} | < 200ms |

## Bundle Analysis
| Route | JS Size | CSS Size |
|-------|---------|---------|
| / | {kb} | {kb} |
| /dashboard | {kb} | {kb} |

## Deterministic Metrics for Autoresearch
- Lighthouse Performance score: primary objective function
- Lighthouse Accessibility score: secondary objective function
- Bundle size (total JS): constraint (must not increase)
- Type errors (tsc): 0 (gate)
- Lint errors (Biome): 0 (gate)
```

### Verification Constraints
| Type | Target | Assertion | Method |
|------|--------|-----------|--------|
| file-exists | PRD.md | PRD updated | `grep -q '2026-04-13\|Tailwind.*v4\|motion/react' /home/sablia/workspace/projects/internal/websites/sablia-vox/PRD.md` |
| file-exists | AUTORESEARCH_BASELINE.md | Baseline doc created | `test -f /home/sablia/workspace/projects/internal/websites/sablia-vox/docs/AUTORESEARCH_BASELINE.md` |
| file-exists | TECH_DEBT.md | Tech debt updated | `grep -q 'H3.*Resolved\|H3.*resolved\|~~H3~~' /home/sablia/workspace/projects/internal/websites/sablia-vox/docs/TECH_DEBT.md` |
| contains | ARCHITECTURE.md | Auth flow documented | `grep -q 'magic link\|token_hash\|invite' /home/sablia/workspace/projects/internal/websites/sablia-vox/docs/ARCHITECTURE.md` |

---

## Documentation Sources & Targets

| Document | Role | Update scope |
|----------|------|-------------|
| `PRD-saas.md` | Source | — |
| `PRD.md` | Source + Target | Phase E — update route map, tech stack, feature inventory |
| `DESIGN-SPEC.md` | Source | — |
| `API-client-ready.md` | Source | — |
| `CLAUDE.md` (project) | Target | Phase E — update routes, architecture, design system, patterns |
| `docs/ARCHITECTURE.md` | Target | Phase E — auth flow, design system, updated file tree |
| `docs/TECH_DEBT.md` | Target | Phase E — mark resolved items from this unit |
| `docs/AUTORESEARCH_BASELINE.md` | Target (new) | Phase E — Lighthouse scores, bundle sizes, metrics |
| `research/plan/2026-04-13-vox-saas-polish.md` | Source | — |

---

## Validation Strategy

**Type**: mixed (automated + visual + HITL)
**Confidence before validation**: 8/10

### Acceptance Criteria
- [ ] AC-1: Zero Biome lint errors | Type: binary | Verify: `npm run lint` exits with 0 errors
- [ ] AC-2: Zero TypeScript errors | Type: binary | Verify: `npm run type-check` exits cleanly
- [ ] AC-3: Build succeeds | Type: binary | Verify: `npm run build` exits 0
- [ ] AC-4: Zero page-level spinners in new/touched code (only action spinners remain) | Type: binary | Verify: `grep -r 'Loader2' app/dashboard/ --include='*.tsx' | grep -v 'node_modules' | grep -c 'Suspense\|isLoading\|loading' | grep -q '^0$'` (custom — check no Loader2 in Suspense fallbacks or loading states)
- [ ] AC-5: All dashboard pages responsive at 375px | Type: scored (>= 7/10) | Verify: Playwright screenshots at 375px width — no horizontal overflow, text readable, interactive elements tappable
- [ ] AC-6: Lighthouse landing page performance >= 90, a11y >= 90 | Type: binary | Verify: Lighthouse audit via Playwright MCP
- [ ] AC-7: Lighthouse dashboard a11y >= 90 | Type: binary | Verify: Lighthouse audit via Playwright MCP
- [ ] AC-8: Page fade-in transitions visible on dashboard navigation | Type: scored (>= 7/10) | Verify: Visual check in browser — navigate between dashboard routes, confirm subtle fade-in
- [ ] AC-9: PRD.md, CLAUDE.md, ARCHITECTURE.md, TECH_DEBT.md updated | Type: binary | Verify: `grep` for key new content in each file
- [ ] AC-10: CTA form duplication resolved (H3) | Type: binary | Verify: `test -f components/ui/cta-form/CTAFormCore.tsx && [ $(wc -l < components/ui/cta-form/CTAPopupForm.tsx 2>/dev/null || echo 999) -lt 100 ]`
- [ ] AC-11: CallDetail duplication resolved (H7) | Type: binary | Verify: `test -f components/dashboard/CallDetail/CallDetailContent.tsx`

### Validation Steps
| # | Method | What it checks | Pass condition |
|---|--------|---------------|----------------|
| 1 | Script | Lint + type-check + build | All 3 exit 0 |
| 2 | Playwright | Responsive screenshots at 375/768/1280px | No overflow, readable, interactive |
| 3 | Playwright | Lighthouse landing page | Performance >= 90, A11y >= 90 |
| 4 | Playwright | Lighthouse dashboard | A11y >= 90, Performance >= 85 |
| 5 | Visual | Page transitions | Fade visible on route change |
| 6 | Script | Spinner audit | Zero Loader2 in Suspense fallbacks |
| 7 | Manual | Doc review | All 4 docs updated with current info |

### Validation Scripts
```bash
# AC-1, AC-2, AC-3: Automated gates
cd /home/sablia/workspace/projects/internal/websites/sablia-vox
npm run lint && npm run type-check && npm run build

# AC-4: Spinner audit (zero page-level spinners)
grep -rn 'Loader2' app/dashboard/ --include='*.tsx' | grep -v 'SettingsClient' | grep -v 'Button' | grep -v 'ExportCSV'

# AC-10: CTA dedup
wc -l components/ui/cta-form/CTAFormCore.tsx components/ui/CTAPopupForm.tsx components/ui/CTAStaticForm.tsx 2>/dev/null
```

### Iteration Protocol
If validation fails:
1. Identify which acceptance criteria failed
2. Fix the root cause (do NOT patch around it)
3. Re-run all validation steps
4. Repeat until all criteria pass

---

## Regression Tests

| Test | Source Plan | Command/Check | Expected |
|------|------------|---------------|----------|
| Auth flow works | vox-saas-auth-settings | Login with password + magic link | Both methods reach dashboard |
| Settings page loads | vox-saas-auth-settings | Navigate to /dashboard/settings as admin | Tabs visible, org data loaded |
| Agent detail shows quality chart | vox-saas-customer-success | Navigate to /dashboard/agents/[id] | Quality trend chart renders |
| Consumption page loads | vox-saas-customer-success | Navigate to /dashboard/consumption | Per-agent usage displayed |
| Welcome modal shows for new users | vox-saas-landing-onboarding | First login without onboarded_at | Modal appears |
| Pricing section on landing | vox-saas-landing-onboarding | Navigate to / | Pricing section visible |

---

## Challenge Gate
- [x] Plan challenged (integrated /plan shadow challenge)

---

## Challenge Report

**Date**: 2026-04-13 | **Type**: post-plan | **Round**: 2

### Iteration History
| Round | Verdict | BLOCKING | Actions Applied | Key Change |
|-------|---------|----------|-----------------|------------|
| 1 | REVISE | 4 (3 distinct) | 9 | Fixed Biome `--write --unsafe`, `tailwindDirectives` config, `TooltipContentProps`, env biome-ignore, skeleton page-fade-in, CTA/CallDetail parameterization |
| 2 | GO | 0 | 4 | Clarified B2/B3 spinner ownership (10 Suspense + 7 isLoading), fixed CTA source values, D4 file count, AC-10 path |

**Iterations**: 2 | **Total agents spawned**: 8 (3 R1 + 2 R2 + 3 research)

### Verified Hypotheses (Round 2 — 15 claims checked)

| Status | Count | Key Items |
|--------|-------|-----------|
| Pass | 14 | `--write --unsafe` confirmed, `tailwindDirectives` valid in Biome 2.4.10 schema, `@keyframes` re-triggers on mount, layout persists across routes (animation on client components correct), `biome-ignore` satisfies AC-1 (zero errors), View Transitions experimental confirmed, Recharts `TooltipContentProps` exists in v3, `process.env!` with biome-ignore is idiomatic |
| Warning | 1 | 3 `noImportantStyles` errors in globals.css not explicitly listed in plan (covered by A1 `--write --unsafe` auto-fix or A3 manual) |
| Fail | 0 | — |

### Counter-arguments (Round 2 — 6 findings)

| Severity | Count | Key Items |
|----------|-------|-----------|
| RISK | 2 | (1) CSS error verification after `tailwindDirectives` — executor should run `biome check app/globals.css` separately to confirm parse errors resolved; (2) CTA source values differ from plan's original claim — corrected to actual values from codebase |
| MINOR | 4 | 3 `noImportantStyles` in globals.css, `--write --unsafe` for `useExhaustiveDependencies` needs review, B2 S1 layout uses DashboardSkeleton (noted), AC validation scripts reference paths that may change during D1 refactor |

### External Insights (Round 1 — 5 findings)

| # | Insight | Source | Impact |
|---|---------|--------|--------|
| 1 | Biome `tailwindDirectives: true` (2.3.0+) is the correct approach, not CSS exclusion | biomejs.dev changelog | A2 fixed to use this |
| 2 | Recharts v3 renamed `TooltipProps` → `TooltipContentProps` | recharts wiki migration guide | A4 fixed |
| 3 | Layout-level auth (Server Component) is CVE-2025-29927-proof, unlike middleware-only | Datadog security labs | D3 approach validated |
| 4 | Skeleton components should NOT animate in (appear immediately as fallback) | Community experience | B1 fixed |
| 5 | TanStack Query `useSuspenseQuery` executes serially (future awareness) | TanStack docs | No current impact |

### Verdict: **GO**

**Justification**: All 4 BLOCKING issues from Round 1 were resolved and confirmed by Round 2 agents (8/8 R1 fixes verified). Round 2 found 1 additional BLOCKING (B2/B3 spinner count ambiguity) — fixed inline. Zero BLOCKING remain. 2 RISK items are tactical and within `/execute` scope. Plan is structurally sound — no DB migrations, no new features, well-scoped refactors with clear before/after targets.
