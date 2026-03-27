# Plan: Fix Dashboard Sidebar Overlap

**Project**: sablia-vox
**Type**: Bug fix
**Confidence**: 9/10
**Complexity**: Simple (2 files)

## Problem

Dashboard content renders behind the left sidebar panel. Visible on agent detail pages — KPI cards and charts overlap with the sidebar. The overview page is partially protected by its own `overflow-hidden` wrapper.

### Root Cause

In `app/dashboard/layout.tsx`, the `SidebarInset` component (from shadcn's sidebar) sits inside a flex container (`SidebarProvider`). The sidebar uses a gap div (16rem) + fixed-position overlay pattern:

```
SidebarProvider (flex w-full)
├── Sidebar wrapper (gap div 16rem + fixed sidebar z-10)
└── SidebarInset (w-full flex-1) ← PROBLEM
```

`SidebarInset` has `w-full` and `flex-1` but **no `min-w-0`**. Default `min-width: auto` prevents flex shrinking below content's intrinsic minimum width. When charts (Recharts SVGs) have large intrinsic widths:

1. SidebarInset can't shrink below content min-width
2. Sidebar's gap div collapses (it has flex-shrink: 1) to accommodate
3. SidebarInset starts at x≈0, behind the fixed sidebar (z-10)
4. Content renders under the sidebar overlay

## Phase A: Layout Fix

**Files**: `app/dashboard/layout.tsx`, `app/dashboard/agents/[agentId]/AgentDetailClient.tsx`
**Skill**: Direct edit

### Changes

1. Add `min-w-0` to `SidebarInset` className — allows flex shrinking below content intrinsic width
2. Add `min-w-0` to inner `<main>` element — defense in depth for nested flex contexts
3. Add `overflow-hidden` to AgentDetailClient's four `h-[300px]` chart wrappers — parity with OverviewDashboardClient (challenge RISK mitigation)

### Verification Constraints

| Type | Target | Assertion | Method |
|------|--------|-----------|--------|
| contains | app/dashboard/layout.tsx | SidebarInset has min-w-0 class | grep -c 'min-w-0' app/dashboard/layout.tsx \| grep -q '^[1-9]' |
| type-check | tsc | TypeScript compiles | cd /home/sablia/workspace/projects/internal/websites/sablia-vox && npm run type-check 2>&1 \| tail -5 |

## Phase B: Visual Verification

**Skill**: `/e2e-test` or manual browser check

### Steps

1. Start dev server
2. Navigate to `/dashboard/agents/{any-agent-id}`
3. Verify: KPI cards and charts are fully visible, no content behind sidebar
4. Verify: Sidebar toggle (collapse/expand) works correctly
5. Check overview page (`/dashboard/overview`) — confirm no regression

### Verification Constraints

| Type | Target | Assertion | Method |
|------|--------|-----------|--------|
| file-exists | app/dashboard/layout.tsx | Layout file exists | test -f /home/sablia/workspace/projects/internal/websites/sablia-vox/app/dashboard/layout.tsx |

## Validation Strategy

**Acceptance criteria**:
- [ ] `min-w-0` present on SidebarInset in layout.tsx
- [ ] `min-w-0` present on inner `<main>` in layout.tsx
- [ ] `overflow-hidden` on AgentDetailClient chart wrappers
- [ ] Dashboard content fully visible to the right of sidebar (no overlap)
- [ ] Sidebar collapse/expand still works
- [ ] No TypeScript errors (`npm run type-check`)

**Method**: Visual (browser) + build check
**Iteration protocol**: If visual check shows overlap persists, investigate `overflow-hidden` on SidebarInset as fallback

## Documentation Sources & Targets

| Type | Path | What |
|------|------|------|
| Source | components/ui/sidebar.tsx | shadcn sidebar flex layout mechanism |
| Source | app/dashboard/layout.tsx | Current layout structure |
| Target | docs/KNOWN_ISSUES.md | Document min-w-0 pattern for flex+sidebar |

- [x] Plan challenged (integrated /plan shadow challenge)

---

## Challenge Report

**Date**: 2026-03-26 | **Rounds**: 1 | **Verdict**: GO | **Agents**: 2 (Verifier + Devil's Advocate)

### Verified Hypotheses

| # | Hypothesis | Status | Note |
|---|------------|--------|------|
| 1 | `min-w-0` sets `min-width: 0` overriding flex auto | pass | Standard Tailwind utility |
| 2 | Default `min-width: auto` prevents flex shrinking | pass | CSS Flexbox Level 1 spec |
| 3 | `flex-1` = `flex: 1 1 0%` | pass | Standard Tailwind |
| 4 | Sidebar gap div has default `flex-shrink: 1` | pass | Verified in sidebar.tsx:224-233 |
| 5 | `min-w-0` allows shrinking below content min-width | pass | Canonical CSS fix |
| 6 | SidebarInset renders as `<main>` | pass | sidebar.tsx:318 |

### Counter-arguments

| # | Argument | Severity | Resolution |
|---|----------|----------|------------|
| 1 | Root cause mechanism explanation slightly imprecise | RISK | Acknowledged; fix targets correct element |
| 2 | AgentDetailClient chart wrappers lack `overflow-hidden` | RISK | **Added to plan** — Phase A change #3 |
| 9 | Build verification constraint fragile | RISK | **Fixed** — replaced with `npm run type-check` |
| 3-8,10 | Various edge cases (collapsed state, mobile, settings) | MINOR | Covered by Phase B visual verification |

### Verdict

**GO** — 0 BLOCKING, 3 RISK (2 mitigated in plan, 1 acknowledged). Plan is technically sound.
