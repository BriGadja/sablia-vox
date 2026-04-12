# Sablia Vox — Design System & Animation Architecture Plan

## Executive Summary

Unit 2 of vox-saas-master. Establish the enterprise-grade design system that all subsequent units (3-6) consume. Deliverables: `DESIGN-SPEC.md` (design tokens, animation architecture, UX flows, component patterns) + Lighthouse baseline capture. No code implementation — this plan produces specification documents only.

**Master plan**: `plans/vox-saas-master.md`
**PRD**: `projects/internal/websites/sablia-vox/PRD-saas.md` (design quality bar, animation requirements)
**Research**: `research/plan/2026-04-12-vox-saas-design-system.md`

**Design philosophy**: Subtle + professional (Linear/Vercel/Raycast blend). Restrained micro-interactions, gentle page fades, staggered list reveals. Never distracting.

**Confidence**: 9/10 — spec-writing task, all research complete, no external dependencies.

## Phase Status
| Phase | Name | Tasks |
|-------|------|-------|
| A | Lighthouse Baseline Capture | 2 |
| B | Design Token System | 3 |
| C | Animation Architecture | 3 |
| D | UX Structure & Flows | 2 |
| E | Compile DESIGN-SPEC.md & Validate | 3 |

---

## Phase A: Lighthouse Baseline Capture

Skill: `/execute` (direct — run Lighthouse CLI against live site)

### Tasks
- [ ] A1: Run Lighthouse on landing page (`vox.sablia.io`) — capture performance, accessibility, SEO, best practices scores
- [ ] A2: Run Lighthouse on dashboard page (`vox.sablia.io/dashboard/overview`) — requires authenticated session via Playwright MCP. If auth blocks automated capture, document manual baseline from Chrome DevTools

### Technical Details

**A1: Landing page baseline**

Use Playwright MCP to navigate to `vox.sablia.io` and run Lighthouse audit via Chrome DevTools MCP (`mcp__chrome-devtools__lighthouse_audit`). Capture:
- Performance score (target: >= 90 after optimization)
- Accessibility score (target: >= 90)
- SEO score
- Best Practices score
- Core Web Vitals: FCP, LCP, INP, CLS, TBT

**A2: Dashboard baseline**

Dashboard requires Supabase auth. Approach:
1. Use Playwright MCP to navigate to `vox.sablia.io/login`
2. Authenticate with test credentials (or use existing session from shared browser)
3. Navigate to `/dashboard/overview`
4. Run Lighthouse audit

If automated auth fails, capture manually: Brice opens Chrome DevTools → Lighthouse tab → generate report → export JSON. Document scores from the exported report.

**Output**: Baseline scores written to `DESIGN-SPEC.md` Section 0 (Baseline) and `tmp/s-3413110/lighthouse-baseline.json`.

### Verification Constraints
| Type | Target | Assertion | Method |
|------|--------|-----------|--------|
| section-present | DESIGN-SPEC.md | Has Lighthouse Baseline section | `grep -c 'Lighthouse Baseline' projects/internal/websites/sablia-vox/DESIGN-SPEC.md` |
| contains | DESIGN-SPEC.md | Contains performance score value | `grep -P 'Performance.*\d+' projects/internal/websites/sablia-vox/DESIGN-SPEC.md` |

---

## Phase B: Design Token System

Skill: `/execute` (direct — spec writing)

### Tasks
- [ ] B1: Specify color system — surface elevation tokens (`--surface-1` through `--surface-4`), interactive state overlays (`--hover-overlay`, `--active-overlay`, `--focus-ring`), semantic data visualization colors (`--color-success/warning/danger/info`). Document as CSS custom properties in OKLCh format, compatible with existing `@theme` block in `globals.css`
- [ ] B2: Specify typography scale — font sizes (Minor Third 1.2 ratio, 10px–36px), font weights (400/500/600/700), line heights (1.2–1.625), letter spacing (tight/normal/wide). Document usage rules: KPI numbers use `--tracking-tight` + bold, table data uses `--font-size-sm`, badges use uppercase + `--tracking-wide`. All as `@theme` vars
- [ ] B3: Specify glassmorphism tier system — 3 tiers (subtle: `bg-white/4 blur-8px`, standard: `75% opacity blur-16px`, strong: `90% blur-24px`). Include "light edge" trick (`inset 0 1px 0 oklch(1 0 0 / 0.1)`). Document which tier applies where (subtle = inline cards, standard = modals/panels, strong = tooltips/command palette). Performance rule: max 3 `backdrop-filter` elements in viewport. Replace existing unused `.glass`/`.glass-dark` utilities

### Technical Details

**B1: Color system**

Extend existing `:root` OKLCh tokens. Current state: `--background` (0.13), `--card` (0.19), `--border` (0.28). Gap: no intermediate surface levels between background and card.

New surface elevation scale (0.06 lightness steps, matching Linear pattern):
```css
--surface-1: oklch(0.16 0.018 260);  /* Base card — between bg and current card */
--surface-2: oklch(0.22 0.018 260);  /* Raised element — slightly above card */
--surface-3: oklch(0.26 0.016 260);  /* Overlay / dropdown */
--surface-4: oklch(0.30 0.014 260);  /* Tooltip / topmost */
```

**Relationship to existing `--surface` token**: The current `--surface: oklch(0.19 0.020 260)` sits between `--surface-1` (0.16) and `--surface-2` (0.22) in the new scale. `--surface` is NOT aliased to `--surface-1` — they are different values. `--surface` is kept for backward compat with shadcn components that reference it. New components use the numbered scale. The spec must document both the old `--surface` and the new numbered tokens, clarifying that `--surface` is legacy.

Interactive overlays (white-based, theme-agnostic):
```css
--hover-overlay: oklch(1 0 0 / 0.04);
--active-overlay: oklch(1 0 0 / 0.08);
--focus-ring: oklch(0.75 0.14 230 / 0.5);  /* Primary at 50% */
```

Semantic data viz (extend existing `--chart-*` tokens):
```css
--color-success: oklch(0.72 0.17 160);  /* Green — positive outcomes */
--color-warning: oklch(0.82 0.18 80);   /* Amber — pending, attention */
--color-danger: oklch(0.62 0.22 27);    /* Red — errors, destructive */
--color-info: oklch(0.72 0.16 230);     /* Blue — informational */
```

**B2: Typography scale**

Formalize the existing implicit scale into explicit `@theme` tokens:
```css
--font-size-2xs: 0.625rem;  /* 10px — chart axis labels */
--font-size-xs: 0.75rem;    /* 12px — captions, timestamps, badges */
--font-size-sm: 0.875rem;   /* 14px — table rows, secondary text */
--font-size-base: 1rem;     /* 16px — body, card content */
--font-size-lg: 1.125rem;   /* 18px — card titles */
--font-size-xl: 1.25rem;    /* 20px — section headers */
--font-size-2xl: 1.5rem;    /* 24px — KPI values */
--font-size-3xl: 1.875rem;  /* 30px — hero KPIs */
--font-size-4xl: 2.25rem;   /* 36px — large number display */
```

Font mapping: DM Sans (body, dashboard text), Fraunces (landing page display headings), JetBrains Mono (code, metrics where monospace alignment matters).

**B3: Glassmorphism**

Current state: 7+ ad-hoc variants across components, 2 unused utilities. Replace with systematic 3-tier approach:

| Tier | Use case | Background | Blur | Border |
|------|----------|------------|------|--------|
| `glass-subtle` | Dashboard cards, inline surfaces | `oklch(1 0 0 / 0.04)` | 8px | `oklch(1 0 0 / 0.08)` |
| `glass-standard` | Modals, panels, dropdowns | `oklch(0.18 0.02 260 / 0.75)` | 16px | `oklch(1 0 0 / 0.12)` + shadow |
| `glass-strong` | Tooltips, command palette, top-layer | `oklch(0.15 0.02 260 / 0.9)` | 24px | `oklch(1 0 0 / 0.15)` + shadow + light edge |

Migration: document which existing components map to which tier. Units 3-6 apply during implementation — this spec defines the target.

### Verification Constraints
| Type | Target | Assertion | Method |
|------|--------|-----------|--------|
| section-present | DESIGN-SPEC.md | Has Color System section | `grep -c 'Color System' projects/internal/websites/sablia-vox/DESIGN-SPEC.md` |
| section-present | DESIGN-SPEC.md | Has Typography section | `grep -c 'Typography' projects/internal/websites/sablia-vox/DESIGN-SPEC.md` |
| contains | DESIGN-SPEC.md | Has OKLCh surface tokens | `grep -c 'surface-1' projects/internal/websites/sablia-vox/DESIGN-SPEC.md` |
| contains | DESIGN-SPEC.md | Has glassmorphism tiers | `grep -c 'glass-subtle' projects/internal/websites/sablia-vox/DESIGN-SPEC.md` |

---

## Phase C: Animation Architecture

Skill: `/execute` (direct — spec writing)

### Tasks
- [ ] C1: Specify motion library setup — `motion` v12 with LazyMotion (`domAnimation` feature set, ~20kb vs 34kb direct), MotionProvider wrapper in `app/layout.tsx` with `<MotionConfig reducedMotion="user">`. Document migration path: existing 16 files import from `motion/react` → update to `motion/react-m` for tree-shaking. No package change needed (`motion` ^12.38.0 already installed)
- [ ] C2: Specify motion primitives catalog + page transition approach — 6 primitives (`FadeIn`, `SlideUp`, `SlideIn`, `StaggerChildren`, `ScaleIn`, `FadeInWhenVisible`) in `components/motion/`. Page transitions via React `<ViewTransition>` (experimental in Next.js 16, `next.config.ts` flag). Document existing `Reveal.tsx` → deprecate in favor of `FadeInWhenVisible`. Animation easing/duration tokens as CSS vars in `@theme`
- [ ] C3: Specify skeleton/shimmer pattern + reduced motion strategy + performance budget — CSS-only shimmer keyframe (no Motion dependency), paired `*Skeleton` components co-located with real components. Reduced motion: MotionConfig layer (auto-disables transform/layout) + CSS `@media` for View Transitions. Performance: GPU-only properties (transform, opacity), max 30 simultaneous whileInView, INP < 200ms, 60fps target

### Technical Details

**C1: Motion library setup**

Current state: `motion` ^12.38.0 installed, imported as `motion` in 16 files. No LazyMotion, no MotionConfig. Full bundle shipped (~33kb gzip).

Target architecture:
```
app/layout.tsx
  └─ <MotionConfig reducedMotion="user">
       └─ <LazyMotion features={domAnimation}>
            └─ <ViewTransition>
                 └─ {children}
```

MotionProvider component (`components/providers/motion-provider.tsx`):
```typescript
'use client'
import { LazyMotion, domAnimation, MotionConfig } from 'motion/react'

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation} strict>
        {children}
      </LazyMotion>
    </MotionConfig>
  )
}
// `strict` prop: throws an error if any component uses `motion.*` instead of `m.*`,
// preventing accidental full-bundle imports that bypass tree-shaking.
```

Migration: existing `import { motion } from 'motion/react'` → `import * as m from 'motion/react-m'`. Component-level change, no package.json change. 16 files to migrate during Units 3-6.

**Import exception**: `AnimatePresence` is NOT available in `motion/react-m` — it must continue to be imported from `motion/react`. The migration map must document this: files using `AnimatePresence` keep their `motion/react` import for that specific export, and use `m` from `motion/react-m` for animated elements.

**C2: Motion primitives**

| Primitive | Use case | Props | Animation |
|-----------|----------|-------|-----------|
| `FadeIn` | Cards, modals, sections | `delay`, `duration`, `className` | opacity 0→1 |
| `SlideUp` | Hero text, CTAs, entering content | `delay`, `className` | opacity 0→1, y 16→0 |
| `SlideIn` | Side panels, drawers | `direction: 'left'\|'right'`, `className` | opacity 0→1, x ±24→0 |
| `StaggerChildren` | Agent card grids, lists | `staggerDelay`, `className` | Container: stagger 80ms. Items: opacity 0→1, y 12→0 |
| `ScaleIn` | Badges, chips, tooltips, notifications | `scale`, `className` | opacity 0→1, scale 0.9→1 |
| `FadeInWhenVisible` | Scroll-triggered sections (landing, long pages) | `delay`, `threshold`, `className` | whileInView: opacity 0→1, y 20→0. `viewport={{ once: true, margin: '-80px' }}` |

All primitives: `'use client'`, hydration-safe (initial matches server render), GPU-only properties.

**Page transitions — React ViewTransition**:
```typescript
// next.config.ts
experimental: { viewTransition: true }

// app/layout.tsx
import { ViewTransition } from 'react'
// Wrap children: <ViewTransition>{children}</ViewTransition>
```

CSS customization:
```css
::view-transition-old(root) { animation: fade-out 200ms ease-out; }
::view-transition-new(root) { animation: fade-in 250ms ease-out; }
@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(root), ::view-transition-new(root) { animation: none; }
}
```

**Note**: React's `<ViewTransition>` component (imported from `'react'`) is distinct from using the browser View Transitions API directly. The PRD warns against the raw API ("View Transitions API is experimental in Next.js 16") — React's `<ViewTransition>` is the framework-blessed wrapper that handles the API safely. Requires `experimental: { viewTransition: true }` in Next.js 16 config. Degrades gracefully — no-op on unsupported browsers (content renders without transition). Browser support is now broad (Chrome 111+, Firefox 133+, Safari 18+). Risk: React API may stabilize (drop experimental flag) in React 20 / Next.js 17. Mitigation: CSS-based transitions are the fallback.

**PageTransition primitive substitution**: The master plan lists `PageTransition` as a motion primitive. This plan replaces it with React `<ViewTransition>` — a browser-native approach that's lighter and more compatible than a Motion-based page wrapper. The `PageTransition` primitive is NOT needed as a separate component; `<ViewTransition>` fulfills this role with CSS customization via `::view-transition-*` pseudo-elements.

**Animation tokens** (extend existing `--duration-*` in `:root`):
```css
/* Durations */
--duration-instant: 50ms;
--duration-fast: 100ms;      /* was 75ms */
--duration-normal: 200ms;    /* was 150ms */
--duration-moderate: 300ms;  /* new */
--duration-slow: 400ms;      /* was 300ms */
--duration-xslow: 600ms;     /* new — page transitions */

/* Easing curves (add to @theme) */
--ease-default: cubic-bezier(0.4, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

/* Stagger */
--stagger-delay: 50ms;
```

**JS constant exports**: CSS custom properties cannot be used directly in Motion's JS `transition` API (e.g., `transition={{ duration: 0.3 }}`). The spec must include a `lib/motion-tokens.ts` file that exports the same values as JS constants:
```typescript
// lib/motion-tokens.ts — JS mirror of CSS animation tokens
export const duration = { instant: 0.05, fast: 0.1, normal: 0.2, moderate: 0.3, slow: 0.4, xslow: 0.6 } as const
export const ease = { default: [0.4, 0, 0.2, 1], in: [0.4, 0, 1, 1], out: [0, 0, 0.2, 1], spring: [0.34, 1.56, 0.64, 1] } as const
export const stagger = { delay: 0.05 } as const
```
Motion primitives import from this file. CSS vars remain for Tailwind utilities and CSS transitions. Single source of truth: CSS vars are canonical, JS file mirrors them.

Usage matrix:
| Interaction | Duration | Easing |
|-------------|----------|--------|
| Hover states, dropdowns appear | `--duration-normal` (200ms) | `--ease-out` |
| Dismissals, collapses | `--duration-fast` (100ms) | `--ease-in` |
| Route transitions, panel slides | `--duration-moderate` (300ms) | `--ease-default` |
| Notifications, badges pop-in | `--duration-moderate` (300ms) | `--ease-spring` |
| Scroll-triggered reveals | `--duration-slow` (400ms) | `--ease-out` |
| Page transitions (ViewTransition) | `--duration-slow` (400ms) | `--ease-out` |

**C3: Skeleton, reduced motion, performance**

Skeleton shimmer — CSS-only:
```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@utility skeleton {
  background: linear-gradient(90deg,
    oklch(0.22 0.015 260) 25%,
    oklch(0.28 0.012 260) 50%,
    oklch(0.22 0.015 260) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s linear infinite;
  border-radius: var(--radius-sm);
}
```

Rules:
- Max 5 simultaneous shimmer elements — use `animate-pulse` (existing) for secondary slots
- Every component with async data gets a paired `*Skeleton` co-located in same file
- Skeleton dimensions match real content (prevents CLS)

Reduced motion strategy:
1. **Layer 1 — MotionConfig**: `reducedMotion="user"` auto-disables transform/layout animations, preserves opacity/color transitions
2. **Layer 2 — CSS**: `@media (prefers-reduced-motion: reduce)` for View Transitions and CSS keyframes
3. **Layer 3 — useReducedMotion() hook**: Available for edge cases where `MotionConfig` isn't sufficient — e.g., swapping a parallax scroll for a static layout, or disabling opacity/color transitions that `MotionConfig` doesn't auto-disable. Per PRD: "`useReducedMotion()` hook for opacity/color transitions that Framer Motion doesn't auto-disable." Spec must document when to use each layer

Performance budget:
- **GPU-only**: animate only `transform`, `opacity` (always compositor-promoted). `filter` and simple `clip-path: inset()` are generally compositor-friendly but complex polygons may trigger paint — prefer transform/opacity for critical animations
- **Never animate**: `width`, `height`, `margin`, `padding`, `top`/`left`
- **INP**: < 200ms for all interactions
- **CLS**: < 0.1 (skeletons match real content size)
- **Frame budget**: 16.67ms per frame (60fps) — no layout/paint during animations
- **Max whileInView**: ~30 simultaneous elements; use StaggerChildren for larger lists
- **backdrop-filter**: max 3 elements with blur simultaneously in viewport

### Verification Constraints
| Type | Target | Assertion | Method |
|------|--------|-----------|--------|
| section-present | DESIGN-SPEC.md | Has Animation Architecture section | `grep -c 'Animation Architecture' projects/internal/websites/sablia-vox/DESIGN-SPEC.md` |
| contains | DESIGN-SPEC.md | Has MotionProvider specification | `grep -c 'MotionProvider' projects/internal/websites/sablia-vox/DESIGN-SPEC.md` |
| contains | DESIGN-SPEC.md | Has ViewTransition page transition spec | `grep -c 'ViewTransition' projects/internal/websites/sablia-vox/DESIGN-SPEC.md` |
| contains | DESIGN-SPEC.md | Has skeleton shimmer pattern | `grep -c 'shimmer' projects/internal/websites/sablia-vox/DESIGN-SPEC.md` |
| contains | DESIGN-SPEC.md | Has reduced motion strategy | `grep -c 'prefers-reduced-motion' projects/internal/websites/sablia-vox/DESIGN-SPEC.md` |

---

## Phase D: UX Structure & Flows

Skill: `/execute` (direct — spec writing)

### Tasks
- [ ] D1: Document information architecture — complete route map (public, auth, dashboard routes with permission level), sidebar navigation structure (admin vs client view), page hierarchy. Consolidate from PRD wireframes + current codebase
- [ ] D2: Document user flows for new pages — (1) Client invite flow: admin sends invite → email → magic link → auth/callback → dashboard. (2) Settings flow: tab navigation, org edit, team management, invite form. (3) Onboarding flow: first login detection → welcome modal → dismiss → set `user_metadata.onboarded_at`. (4) Consumption flow: date range selection → per-agent breakdown → overage calculation. Include wireframe references from PRD

### Technical Details

**D1: Information architecture**

Route map (from codebase + PRD):

| Route | Access | Purpose |
|-------|--------|---------|
| `/` | Public | Landing page (+ pricing section in Unit 4) |
| `/tester-nos-agents` | Public | Demo booking form |
| `/login` | Public | Password + magic link login |
| `/auth/callback` | Public | OAuth/magic link callback handler |
| `/auth/confirm` | Public | Email confirmation handler |
| `/auth/error` | Public | Auth error page |
| `/auth/reset-password` | Public | Password reset request |
| `/auth/update-password` | Authenticated | Password update form |
| `/dashboard` | Authenticated | Redirects to `/dashboard/overview` |
| `/dashboard/overview` | Authenticated | KPIs, charts, call volume |
| `/dashboard/agents` | Authenticated | Agent cards grid |
| `/dashboard/agents/[id]` | Authenticated | Agent detail (stats, quality trend, suggestions) |
| `/dashboard/agents/[id]/calls` | Authenticated | Agent call history |
| `/dashboard/agents/[id]/calls/[callId]` | Authenticated | Call detail (audio, transcript) |
| `/dashboard/consumption` | Authenticated | Per-agent usage, overage costs |
| `/dashboard/settings` | Authenticated | Org profile + team management (tabbed) |

Sidebar structure:
- **All users**: Overview, Agents (with tree), Consumption
- **Admin only**: Settings (org + team), Financial (if exists)
- **Hidden for clients**: View-as-user switcher, admin-only sections

**D2: User flows**

Each flow documented as: trigger → steps → end state → error states. Wireframe references point to PRD sections.

### Verification Constraints
| Type | Target | Assertion | Method |
|------|--------|-----------|--------|
| section-present | DESIGN-SPEC.md | Has Information Architecture section | `grep -c 'Information Architecture' projects/internal/websites/sablia-vox/DESIGN-SPEC.md` |
| section-present | DESIGN-SPEC.md | Has User Flows section | `grep -c 'User Flows' projects/internal/websites/sablia-vox/DESIGN-SPEC.md` |
| contains | DESIGN-SPEC.md | Documents settings flow | `grep -c 'Settings' projects/internal/websites/sablia-vox/DESIGN-SPEC.md` |

---

## Phase E: Compile DESIGN-SPEC.md & Validate

Skill: `/execute` (direct — compile + validate)

### Tasks
- [ ] E1: Compile all Phase A-D outputs into `DESIGN-SPEC.md` in the project root (`projects/internal/websites/sablia-vox/DESIGN-SPEC.md`). Structure: Part 0 (Lighthouse Baseline), Part 1 (UX Structure: IA, flows, wireframe references), Part 2 (UI Identity: color tokens, typography, spacing, glassmorphism, animation architecture, motion primitives, skeleton pattern, performance budget). Ensure CSS token blocks are copy-pasteable into `globals.css` `@theme` / `:root`
- [ ] E2: Validate spec completeness against master plan Unit 2 exit criteria — check every criterion marked in master plan section
- [ ] E3: Update project `CLAUDE.md` with design system reference — add `DESIGN-SPEC.md` to Documentation section, note design token location, add motion primitive import pattern

### Technical Details

**E1: DESIGN-SPEC.md structure**

```markdown
# Sablia Vox — Design System Specification

## Part 0: Lighthouse Baseline
(from Phase A)

## Part 1: UX Structure
### 1.1 Information Architecture
### 1.2 User Flows
### 1.3 Wireframe References (→ PRD-saas.md)

## Part 2: UI Identity
### 2.1 Color System
  - Existing tokens (preserved)
  - Surface elevation scale (new)
  - Interactive state overlays (new)
  - Semantic data viz colors (new)
  - Template type colors (existing, documented)
### 2.2 Typography
  - Font families
  - Size scale
  - Weight/height/spacing
  - Usage rules
### 2.3 Spacing & Radius
### 2.4 Glassmorphism System
  - 3-tier specification
  - Component mapping
  - Performance rules
### 2.5 Animation Architecture
  - Motion library setup (MotionProvider)
  - Animation tokens (durations, easing, stagger)
  - Usage matrix
  - Page transitions (ViewTransition)
  - Motion primitives catalog
  - Existing component migration map
### 2.6 Loading States
  - Skeleton/shimmer pattern
  - Component pairing rules
### 2.7 Accessibility
  - Reduced motion strategy
  - Contrast ratios
  - Focus ring specification
### 2.8 Performance Budget
  - Lighthouse targets
  - Core Web Vitals targets
  - Animation performance rules
  - Autoresearch compatibility
```

**E2: Master plan exit criteria checklist**

From `plans/vox-saas-master.md` Unit 2 exit criteria:
- [ ] Part 1 (UX Structure: flows, IA, wireframes for settings, pricing, consumption, onboarding)
- [ ] Part 2 (UI Identity: palette evolution, typography, animation system, motion tokens)
- [ ] CSS Design Tokens block is machine-parseable (Tailwind v4 `@theme` compatible)
- [ ] Animation system: easing curves, durations, stagger patterns, page transition approach
- [ ] Motion primitives: FadeIn, SlideUp, StaggerChildren, PageTransition — GPU-only properties
- [ ] `prefers-reduced-motion` strategy documented
- [ ] Skeleton loading pattern defined
- [ ] Lighthouse baseline captured
- [ ] Autoresearch targets set: performance >= 90, a11y >= 90, CLS < 0.1, INP < 200ms

### Verification Constraints
| Type | Target | Assertion | Method |
|------|--------|-----------|--------|
| file-exists | DESIGN-SPEC.md | Design spec exists | `test -f projects/internal/websites/sablia-vox/DESIGN-SPEC.md` |
| count-check | DESIGN-SPEC.md | Has all 8 Part 2 subsections (2.1-2.8) | `[ $(grep -c '### 2\.' projects/internal/websites/sablia-vox/DESIGN-SPEC.md) -ge 8 ]` |
| contains | DESIGN-SPEC.md | Has @theme compatible token block | `grep -c '@theme' projects/internal/websites/sablia-vox/DESIGN-SPEC.md` |
| contains | DESIGN-SPEC.md | Has autoresearch targets | `grep -c 'autoresearch' projects/internal/websites/sablia-vox/DESIGN-SPEC.md` |
| contains | CLAUDE.md | References DESIGN-SPEC.md | `grep -c 'DESIGN-SPEC' projects/internal/websites/sablia-vox/CLAUDE.md` |

---

## Deliverables

| File | Path | Description |
|------|------|-------------|
| DESIGN-SPEC.md | projects/internal/websites/sablia-vox/DESIGN-SPEC.md | Design system specification — tokens, animation, UX flows, Lighthouse baseline |

## Documentation Sources & Targets

| Document | Role | Update scope |
|----------|------|-------------|
| `PRD-saas.md` | Source | — (wireframes, design quality bar, animation requirements) |
| `plans/vox-saas-master.md` | Source | — (Unit 2 scope, exit criteria, challenge actions) |
| `plans/archive/vox-saas-tech-debt.md` | Source | — (Unit 1 completed work context) |
| `app/globals.css` | Source | — (existing token system, keyframes, utilities) |
| `research/plan/2026-04-12-vox-saas-design-system.md` | Source | — (3-agent research findings) |
| `DESIGN-SPEC.md` | Target (new) | Phase E — primary deliverable |
| `CLAUDE.md` (project) | Target | Phase E — add DESIGN-SPEC.md reference |

## Validation Strategy

**Type**: mixed (automated + HITL)
**Confidence before validation**: 9/10

### Acceptance Criteria
- [ ] AC-1: `DESIGN-SPEC.md` exists with Part 0 (baseline), Part 1 (UX), Part 2 (UI) | Type: binary | Verify: `test -f DESIGN-SPEC.md && grep -c 'Part 0' DESIGN-SPEC.md && grep -c 'Part 1' DESIGN-SPEC.md && grep -c 'Part 2' DESIGN-SPEC.md`
- [ ] AC-2: CSS token blocks are machine-parseable (`@theme` format, valid OKLCh values) | Type: binary | Verify: `grep -P 'oklch\([\d.]+ [\d.]+ [\d.]+' DESIGN-SPEC.md | wc -l` (expect >= 15 OKLCh values)
- [ ] AC-3: All 6 motion primitives documented (FadeIn, SlideUp, SlideIn, StaggerChildren, ScaleIn, FadeInWhenVisible) | Type: binary | Verify: `grep -c 'FadeIn\|SlideUp\|SlideIn\|StaggerChildren\|ScaleIn\|FadeInWhenVisible' DESIGN-SPEC.md` (expect >= 6)
- [ ] AC-4: Animation easing tokens defined (ease-default, ease-in, ease-out, ease-spring) | Type: binary | Verify: `grep -c 'ease-default\|ease-in\|ease-out\|ease-spring' DESIGN-SPEC.md` (expect >= 4)
- [ ] AC-5: Lighthouse baseline scores captured for landing page | Type: binary | Verify: `grep -P 'Performance.*\d+' DESIGN-SPEC.md`
- [ ] AC-6: Reduced motion strategy documented with both MotionConfig and CSS layers | Type: binary | Verify: `grep -c 'MotionConfig\|prefers-reduced-motion' DESIGN-SPEC.md` (expect >= 2)
- [ ] AC-7: Spec covers all master plan exit criteria (score >= 8/10) | Type: scored | Verify: compare DESIGN-SPEC.md sections against Unit 2 exit criteria list in `plans/vox-saas-master.md`
- [ ] AC-8: Glassmorphism 3-tier system specified with performance rules | Type: binary | Verify: `grep -c 'glass-subtle\|glass-standard\|glass-strong' DESIGN-SPEC.md` (expect >= 3)

### Validation Steps
| # | Method | What it checks | Pass condition |
|---|--------|---------------|----------------|
| 1 | `test -f DESIGN-SPEC.md` | File exists | Exit 0 |
| 2 | `grep` commands | AC-1 through AC-6, AC-8 | All binary criteria pass |
| 3 | Section count | AC-7 coverage | >= 8 of 9 exit criteria addressed |
| 4 | HITL review | Spec quality — tokens usable, flows clear, architecture sound | Brice approves |

### Iteration Protocol
If validation fails:
1. Identify which acceptance criteria failed
2. Add missing content to the relevant DESIGN-SPEC.md section
3. Re-run all validation steps
4. Repeat until all criteria pass

## Regression Tests

| Test | Source Plan | Command/Check | Expected |
|------|------------|---------------|----------|
| checkIsAdmin consolidated | vox-saas-tech-debt A1 | `grep -c 'checkIsAdminServer' projects/internal/websites/sablia-vox/lib/auth.ts` | >= 1 |
| No VoIPIA in landing | vox-saas-tech-debt D1 | `[ $(grep -ric 'voipia' projects/internal/websites/sablia-vox/components/landing/ 2>/dev/null) -eq 0 ]` | 0 matches |
| Dashboard 404 exists | vox-saas-tech-debt B1 | `test -f projects/internal/websites/sablia-vox/app/dashboard/not-found.tsx` | Exists |

## Challenge Gate
- [x] Plan challenged (integrated /plan shadow challenge)

---

## Challenge Report

**Date**: 2026-04-12 | **Type**: post-plan | **Round**: 2

### Verified Hypotheses (Round 2 — 28 claims checked)

| Status | Count | Key Items |
|--------|-------|-----------|
| Pass | 24 | ViewTransition from 'react' confirmed, LazyMotion strict verified, domAnimation ~20kb confirmed, MotionConfig reducedMotion="user" behavior verified, OKLCh browser support broad, Tailwind v4 @theme/@utility syntax correct, AnimatePresence exception accurate |
| Warning | 2 | Firefox VT support actually available (133+, not missing), typography scale is pragmatic/not strict 1.2 Minor Third |
| Fail | 0 | — (Round 1 BLOCKING fixed: ViewTransition import, LazyMotion strict) |

### Counter-arguments (Round 2 — 10 findings)

| Severity | Count | Key Items |
|----------|-------|-----------|
| RISK | 3 | (1) --surface-1 value differs from --surface — "alias" claim was misleading (fixed in auto-apply), (2) PRD ViewTransition contradiction documented (React wrapper vs raw API distinction clarified), (3) PageTransition primitive replaced by ViewTransition (substitution documented) |
| MINOR | 7 | Typography label inaccuracy, light mode tokens deferred, glassmorphism 4+ levels → 3 tiers simplification, Reveal.tsx deprecation loses direction variants, duration token value changes affect 16 existing files, no spacing tokens task, --ease-spring is cubic-bezier not true spring |

### External Insights (Round 1 — carried forward)

| # | Insight | Source | Impact on plan |
|---|---------|--------|----------------|
| 1 | Firefox 133+ supports same-document View Transitions (Baseline Oct 2025) | MDN, caniuse | Plan updated — removed outdated "Firefox lacks support" claim |
| 2 | LazyMotion `strict` prevents silent bundle regression during multi-unit execution | motion.dev docs | Added to plan — critical for Units 3-6 migration |
| 3 | CSS shimmer `background-position` runs on main thread in Firefox | Community performance reports | Plan's `animate-pulse` fallback for secondary slots already mitigates this |
| 4 | OKLCh browser support exceeds Next.js 16 browser floor | caniuse (Chrome 111+, Safari 16.4+, Firefox 113+) | No fallbacks needed — confirmed safe |

### Iteration History
| Round | Verdict | BLOCKING | Actions Applied | Key Change |
|-------|---------|----------|-----------------|------------|
| 1 | REVISE | 3 (2 unique) | 6 | Fixed ViewTransition import (react not next), added LazyMotion strict, documented AnimatePresence exception, clarified surface token relationship, added useReducedMotion Layer 3, added JS motion-tokens.ts exports |
| 2 | GO | 0 | 3 (minor wording) | Corrected surface "alias" to "legacy", clarified PRD ViewTransition distinction, documented PageTransition→ViewTransition substitution, qualified clip-path GPU claim |

**Iterations**: 2 | **Total agents spawned**: 8 (3 Round 1 + 2 Round 2 + 3 research)

### Verdict: GO

**Justification**: All Round 1 BLOCKING issues resolved — ViewTransition import corrected to `from 'react'` (confirmed by 2 agents independently), LazyMotion `strict` prop added to prevent bundle regression during multi-unit migration. Round 2 found 0 BLOCKING, 3 RISK (all documented/mitigated in plan), 7 MINOR (tactical, addressable during /execute). Plan is a spec-writing task with high confidence (9/10) and no external dependencies.
