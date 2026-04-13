---
topic: Sablia Vox — Unit 6 Polish, Performance & Documentation
created: 2026-04-13
agents: [Codebase Polish Auditor, CSS Page Transitions Researcher, Lint Error Categorizer]
plan: plans/vox-saas-polish.md
---

## Research Findings

### Codebase Polish Auditor

**Spinner inventory**: 32 total — 16 page-level (replace with skeletons), 16 inline action (keep).
Page-level spinners: layout Suspense, overview, agents list, agent detail, calls list, call detail, modal, consumption, settings team, auth confirm, password update.

**Responsive gaps (critical)**:
- R1: Calls list table has no `overflow-x-auto` — breaks at 375px
- R2: Agent detail header lacks `flex-wrap` — overflows on mobile
- R3: DashboardPreview mockup grid uses `grid-cols-3` with no mobile breakpoint
- R4: Overview container `overflow-hidden` may clip charts on narrow viewports

**Skeleton usage**: `components/ui/skeleton.tsx` exists but only used by sidebar. KPIGrid has its own `animate-pulse` pattern. No other dashboard page uses skeletons.

**prefers-reduced-motion**: Fully covered via 3 layers (CSS blanket `animation-duration: 0.01ms`, `MotionConfig reducedMotion="user"`, `motion-safe:` prefixes on landing). No gaps.

**Page transitions**: Zero implementation. No ViewTransition, no @starting-style, no AnimatePresence.

**Tech debt status**:
- H3 (CTA duplication): STILL PRESENT — 484 + 404 lines
- H4 (ConsumptionKPIGrid duplication): RESOLVED
- H7 (CallDetail duplication): STILL PRESENT — 341 + 357 lines
- M1 (any types): Down to 6 — EmotionDistribution (3), OutcomeBreakdown (3)
- M2 (redundant getUser): 9 pages duplicate layout auth check
- M5 (large files): SettingsClient.tsx grew to 535 lines (new, not splitting)
- M6 (inline chart styles): 8 instances across 4 files (11px/12px mix)
- L5 (French docs): 2 files confirmed

### CSS Page Transitions Researcher

**Recommended approach**: `@keyframes page-fade-in` animation on page-level content wrappers.
- Zero JS overhead, 100% browser support, Suspense-safe
- View Transitions API still experimental in Next.js 16 (`unstable_ViewTransition`), ~78% browser support, Suspense conflict risk — skip for now
- `AnimatePresence` exit animations broken in App Router — confirmed
- `@starting-style` viable (91% support) but `@keyframes` is simpler for mount-based entry animation

**Implementation**:
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

Apply per-page (not on layout wrapper — layout persists across routes, animation wouldn't re-trigger).

**Reference sites**: Vercel dashboard uses NO page transitions (instant + skeletons). Linear uses custom router transitions. Trend: per-component fade-in, not full-page cross-fade.

### Lint Error Categorizer

**144 total errors**:
- 80 auto-fixable (`biome check --fix --write`)
- 38 CSS parse errors (Tailwind v4 syntax — configure Biome exclusion)
- 26 manual quick fixes (button types, unused vars, array index keys, forEach)
- ~10 medium (Recharts types, env var null checks)
- ~10 high effort (a11y: Modal backdrop, breadcrumb semantic HTML)

**Fix order**: auto-fix → CSS config → button types → type safety → a11y patterns
**Estimated time**: 2.5–3 hours to zero

**Top error files**: globals.css (32), datepicker.css (13), CTAPopupForm (6), DateRangeFilter (6), Modal (5)
