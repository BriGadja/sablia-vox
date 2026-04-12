# Sablia Vox — Design System Specification

> Unit 2 deliverable of vox-saas-master. This spec defines the design tokens, animation architecture, UX flows, and component patterns consumed by Units 3-6.
> Design philosophy: Subtle + professional (Linear/Vercel/Raycast blend). Restrained micro-interactions, gentle page fades, staggered list reveals. Never distracting.

## Part 0: Lighthouse Baseline

Captured 2026-04-12 on `vox.sablia.io` (production, Vercel). No CPU/network throttling.

### Landing Page (`/`)

| Category | Score | Notes |
|----------|-------|-------|
| Accessibility | 96 | 1 failure: color-contrast (muted foreground text) |
| Best Practices | 100 | |
| SEO | 100 | |

| Core Web Vital | Value | Rating | Notes |
|----------------|-------|--------|-------|
| LCP | 2,646ms | Needs improvement | LCP element: hero subtitle `<p>` (text, no network resource). Render delay = 99.5% of LCP time (JS bundle evaluation). TTFB = 13ms. |
| CLS | 0.00 | Good | No layout shifts detected |
| TTFB | 13ms | Good | |
| INP | N/A | | No user interaction during trace |

**Accessibility failure detail:**
- `color-contrast`: Background and foreground colors do not have a sufficient contrast ratio. Likely `text-muted-foreground` on dark background.

### Dashboard (`/dashboard/overview`)

| Category | Score | Notes |
|----------|-------|-------|
| Accessibility | 88 | 4 failures (see below) |
| Best Practices | 100 | |
| SEO | 100 | |

| Core Web Vital | Value | Rating | Notes |
|----------------|-------|--------|-------|
| LCP | 916ms | Good | |
| CLS | 0.08 | Good | Close to 0.1 threshold — monitor during implementation |
| TTFB | 17ms | Good | |
| INP | N/A | | No user interaction during trace |

**Accessibility failure details:**
- `label-content-name-mismatch`: Elements with visible text labels do not have matching accessible names
- `list`: Lists contain non-`<li>` elements (likely sidebar or agent tree structure)
- `listitem`: `<li>` elements outside proper `<ul>`/`<ol>` parent
- `select-name`: Select elements without associated labels (likely date range or agent filter dropdowns)

### Optimization Targets (autoresearch-compatible)

| Metric | Current (Landing) | Current (Dashboard) | Target | Priority |
|--------|-------------------|---------------------|--------|----------|
| Performance (Lighthouse) | Not scored* | Not scored* | >= 90 | High |
| Accessibility | 96 | 88 | >= 90 | High (dashboard) |
| LCP | 2,646ms | 916ms | < 2,500ms | High (landing) |
| CLS | 0.00 | 0.08 | < 0.1 | Monitor |
| INP | N/A | N/A | < 200ms | High |
| SEO | 100 | 100 | >= 90 | Maintain |
| Best Practices | 100 | 100 | >= 90 | Maintain |

*Performance score excluded by audit tool (uses trace-based metrics instead). Lighthouse Performance score to be captured during Unit 6 (Polish) via full Lighthouse CI integration.

**Key optimization opportunities:**
1. Landing page LCP: 2,646ms render delay is JS bundle evaluation. Consider code splitting, lazy loading below-fold sections, or deferring non-critical scripts
2. Dashboard a11y: Fix 4 structural issues (list elements, label associations, select labels) — addressable in Unit 3 (Auth & Settings)
3. Landing page a11y: Increase contrast ratio for `text-muted-foreground` on dark background

---

## Part 1: UX Structure

### 1.1 Information Architecture

#### Route Map

| Route | Access | Purpose | Unit |
|-------|--------|---------|------|
| `/` | Public | Landing page (+ pricing section) | Existing + Unit 4 |
| `/tester-nos-agents` | Public | Demo booking form | Existing |
| `/login` | Public | Password + magic link login | Existing + Unit 3 |
| `/auth/callback` | Public | OAuth/magic link callback handler | Existing |
| `/auth/confirm` | Public | Email confirmation handler | Existing |
| `/auth/error` | Public | Auth error page | Existing |
| `/auth/reset-password` | Public | Password reset request | Existing |
| `/auth/update-password` | Authenticated | Password update form | Existing |
| `/dashboard` | Authenticated | Redirects to `/dashboard/overview` | Existing |
| `/dashboard/overview` | Authenticated | KPIs, charts, call volume | Existing |
| `/dashboard/agents` | Authenticated | Agent cards grid | Existing |
| `/dashboard/agents/[id]` | Authenticated | Agent detail (stats, quality trend, suggestions) | Existing + Unit 5 |
| `/dashboard/agents/[id]/calls` | Authenticated | Agent call history | Existing |
| `/dashboard/agents/[id]/calls/[callId]` | Authenticated | Call detail (audio, transcript) | Existing + Unit 5 |
| `/dashboard/consumption` | Authenticated | Per-agent usage, overage costs | Unit 5 |
| `/dashboard/settings` | Authenticated (admin: full, client: read) | Org profile + team management (tabbed) | Unit 3 |

#### Sidebar Navigation Structure

```
PLATFORM
  Vue d'ensemble        [all users]
  Agents                [all users]

MES AGENTS
  > Secretaire (Accueil) [all users — filtered by org]
  > Setter (Prise de RDV) [all users — filtered by org]

GESTION
  Consommation          [all users]
  Parametres            [admin only]
```

**Admin vs client view:**
- **All users**: Overview, Agents (with expandable tree), Consumption
- **Admin only**: Settings (org profile + team management tabs)
- **Hidden for clients**: Settings nav item hidden, admin-only UI sections removed, financial/billing details hidden

#### Page Hierarchy

```
Landing (/)
  +-- Login (/login)
  +-- Demo (/tester-nos-agents)

Auth
  +-- Callback (/auth/callback)
  +-- Confirm (/auth/confirm)
  +-- Error (/auth/error)
  +-- Reset Password (/auth/reset-password)
  +-- Update Password (/auth/update-password)

Dashboard (/dashboard)
  +-- Overview (/dashboard/overview)
  +-- Agents (/dashboard/agents)
  |     +-- Agent Detail (/dashboard/agents/[id])
  |           +-- Calls (/dashboard/agents/[id]/calls)
  |                 +-- Call Detail (/dashboard/agents/[id]/calls/[callId])
  +-- Consumption (/dashboard/consumption)
  +-- Settings (/dashboard/settings)
```

### 1.2 User Flows

#### Flow 1: Client Invite (US-4, US-5)

**Trigger**: Admin clicks "Inviter un membre" in Settings > Equipe tab

```
Admin: Settings > Equipe > Invite form (email + role)
  |
  v
Server Action: POST /api/invite
  -> supabase.auth.admin.inviteUserByEmail() (service_role key)
  -> INSERT user_org_memberships (invited user ID, org_id, role)
  -> Email sent via Resend (custom SMTP)
  |
  v
Client: Receives email with magic link
  -> Link: vox.sablia.io/auth/callback?token_hash=...&type=invite
  -> Uses token_hash (NOT code) to prevent corporate scanner invalidation
  |
  v
Auth Callback: /auth/callback
  -> verifyOtp({ token_hash, type: 'invite' })
  -> Session created
  -> Redirect to /dashboard (or ?redirect= param if deep link)
  |
  v
Dashboard: First login detected (no user_metadata.onboarded_at)
  -> Welcome modal shown (Flow 3)
```

**Error states:**
- Invalid/expired token: Redirect to `/auth/error` with message
- Email already registered: Show error in invite form
- Service role key missing: Server-side error logged, user sees generic error

#### Flow 2: Settings (US-6, US-7)

**Trigger**: Admin navigates to `/dashboard/settings`

```
Settings page: Tabbed layout
  |
  +-- Tab "Organisation" (default)
  |     -> OrgProfileForm: company name, address, billing info
  |     -> Save via Server Action (Zod validated)
  |     -> Success toast / error display
  |
  +-- Tab "Equipe"
        -> TeamMemberList: current members with roles
        -> MemberActions dropdown: change role, remove (with confirm dialog)
        -> InviteMemberForm: email + role dropdown + send button
        -> Invite triggers Flow 1
```

**Non-admin view:** Settings nav item hidden. If a non-admin user navigates directly to `/dashboard/settings`, show read-only org info (no edit, no team management, no invite).

#### Flow 3: Onboarding (US-18)

**Trigger**: First login — detected by checking `user_metadata.onboarded_at === null`

```
Dashboard loads
  -> Check: session.user.user_metadata.onboarded_at
  -> If null: show welcome modal (overlay)
  |
  v
Welcome Modal:
  -> "Bienvenue sur Sablia Vox"
  -> Feature overview (Overview, Agents, History)
  -> CTA: "C'est parti ->"
  |
  v
Dismiss:
  -> supabase.auth.updateUser({ data: { onboarded_at: new Date().toISOString() } })
  -> Modal closes, dashboard accessible
  -> Subsequent logins: modal not shown
```

**Error states:**
- `updateUser` fails: Log error, close modal anyway (non-blocking)
- Modal dismissed via backdrop click or Escape: Same as CTA click

#### Flow 4: Consumption (US-16, US-17)

**Trigger**: User navigates to `/dashboard/consumption`

```
Consumption page loads
  -> Date range from URL params (nuqs, US-17) or default: current month
  -> Fetch: per-agent usage (minutes used, SMS count)
  |
  v
Display:
  -> Per-agent breakdown:
     - Agent name + template type
     - Usage bar: minutes used / 100 included
     - Overage: minutes beyond 100 * 0.27EUR/min
     - SMS count * 0.14EUR/SMS
  -> Total estimated cost:
     - (agents * 300EUR) + overage + SMS
  |
  v
Date range change:
  -> URL params update (nuqs — bookmarkable/shareable)
  -> Refetch data for new period
```

**Error states:**
- No data for period: Show empty state with message
- API error: Show error fallback component

### 1.3 Wireframe References

All wireframes are in `PRD-saas.md`. Key sections:

| Feature | PRD Section | Lines |
|---------|-------------|-------|
| Settings tabs (Organisation + Equipe) | "Settings Page Enhancement" | ~210-248 |
| Login with magic link | "Login Page Enhancement" | ~250-269 |
| Pricing section | "Landing Page Pricing Section" | ~271-296 |
| Dashboard 404 | "Dashboard 404 Page" | ~298-310 |
| Consumption breakdown | "Consumption Section (Phase 2)" | ~312-333 |
| Welcome modal | "Welcome Modal (Phase 2)" | ~335-358 |

---

## Part 2: UI Identity

### 2.1 Color System

#### Existing Tokens (preserved)

Current `:root` OKLCh tokens in `globals.css`. These remain unchanged — new tokens extend them.

```css
/* Core palette (dark mode default) */
--background: oklch(0.13 0.025 260);
--foreground: oklch(0.96 0.005 260);
--card: oklch(0.19 0.020 260);
--card-foreground: oklch(0.96 0.005 260);
--primary: oklch(0.75 0.14 230);
--primary-foreground: oklch(0.13 0.025 260);
--secondary: oklch(0.22 0.015 260);
--muted: oklch(0.22 0.015 260);
--muted-foreground: oklch(0.65 0.02 255);
--accent: oklch(0.80 0.16 80);
--destructive: oklch(0.55 0.22 27);
--border: oklch(0.28 0.015 260);
--surface: oklch(0.19 0.020 260);  /* Legacy — identical to --card, see migration note */

/* Chart colors */
--chart-1: oklch(0.65 0.18 230);  /* Blue */
--chart-2: oklch(0.65 0.15 165);  /* Teal */
--chart-3: oklch(0.75 0.16 80);   /* Amber */
--chart-4: oklch(0.60 0.18 300);  /* Purple */
--chart-5: oklch(0.60 0.18 350);  /* Pink */
```

#### Template Type Colors (existing)

```css
/* @theme block — generate Tailwind utilities */
--color-setter: #8B5CF6;    /* Violet — appointment scheduling */
--color-secretary: #3B82F6;  /* Blue — reception/inquiry handling */
--color-transfer: #FB923C;   /* Orange — call transfer/redirection */
```

#### Surface Elevation Scale (new)

Introduces intermediate surface levels between `--background` (0.13) and `--border` (0.28) for visual depth hierarchy. Follows a compressed lightness progression.

```css
/* Add to :root — surface elevation tokens */
--surface-1: oklch(0.16 0.018 260);  /* Between bg (0.13) and card (0.19) */
--surface-2: oklch(0.22 0.018 260);  /* Raised element — above card */
--surface-3: oklch(0.26 0.016 260);  /* Overlay / dropdown */
--surface-4: oklch(0.30 0.014 260);  /* Tooltip / topmost layer */
```

**Migration note**: The existing `--surface: oklch(0.19 0.020 260)` is identical to `--card` and sits between `--surface-1` (0.16) and `--surface-2` (0.22) in the new scale. `--surface` is NOT aliased to any numbered token — it is kept for backward compatibility with shadcn components that reference `--color-surface`. New components should use the numbered scale. The `--surface` token is considered legacy.

```css
/* Add to @theme block for Tailwind utility generation */
--color-surface-1: var(--surface-1);
--color-surface-2: var(--surface-2);
--color-surface-3: var(--surface-3);
--color-surface-4: var(--surface-4);
```

#### Interactive State Overlays (new)

White-based overlays for interactive states. Theme-agnostic — work on any surface color.

```css
/* Add to :root */
--hover-overlay: oklch(1 0 0 / 0.04);   /* Subtle hover highlight */
--active-overlay: oklch(1 0 0 / 0.08);  /* Press/active state */
--focus-ring: oklch(0.75 0.14 230 / 0.5);  /* Primary at 50% opacity */
```

**Current codebase mapping**: Existing `hover:bg-white/10` and `bg-white/20` patterns will migrate to these tokens during Units 3-6. The overlay tokens are deliberately more subtle than current values — this aligns with the "restrained, professional" design philosophy.

#### Semantic Data Visualization Colors (new)

Extend the existing `--chart-*` palette with semantic meaning for outcomes and status indicators.

```css
/* Add to :root */
--color-success: oklch(0.72 0.17 160);  /* Green — positive outcomes (appointment_scheduled, etc.) */
--color-warning: oklch(0.82 0.18 80);   /* Amber — pending, attention (callback_requested) */
--color-danger: oklch(0.62 0.22 27);    /* Red — errors, destructive (call_failed, error) */
--color-info: oklch(0.72 0.16 230);     /* Blue — informational */
```

### 2.2 Typography

#### Font Families

| Token | Font | Use case |
|-------|------|----------|
| `--font-body` (`--font-dm-sans`) | DM Sans | Body text, dashboard content, cards, tables |
| `--font-display` (`--font-fraunces`) | Fraunces | Landing page display headings, hero text |
| `--font-mono` (`--font-jetbrains-mono`) | JetBrains Mono | Code snippets, metrics where monospace alignment matters |

#### Size Scale

Pragmatic scale optimized for dashboard readability. Not a strict mathematical ratio — hand-tuned for the content hierarchy.

```css
/* Add to @theme for Tailwind utility generation */
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

**Migration note**: The existing `--font-scale-ratio: 1.25` in `:root` is unused (defined but never consumed). Remove during implementation.

#### Font Weights

| Weight | Token | Use case |
|--------|-------|----------|
| 400 | `font-normal` | Body text, descriptions |
| 500 | `font-medium` | Card titles, nav items, labels |
| 600 | `font-semibold` | Section headers, KPI labels |
| 700 | `font-bold` | Hero headings, KPI values, emphasis |

#### Line Heights

| Context | Value | Notes |
|---------|-------|-------|
| Headings | 1.2 | Tight for display text |
| Body | 1.5 | Comfortable reading |
| Relaxed | 1.625 | Long-form content, descriptions |
| UI elements | 1.25 | Badges, labels, compact UI |

#### Letter Spacing

```css
/* Already available via Tailwind — document usage */
--tracking-tighter: -0.05em;  /* Not used */
--tracking-tight: -0.025em;   /* KPI numbers, large display values */
--tracking-normal: 0em;       /* Body text, default */
--tracking-wide: 0.025em;     /* Badges, uppercase labels */
--tracking-wider: 0.05em;     /* Small caps, category tags */
```

#### Typography Usage Rules

| Element | Size | Weight | Tracking | Font |
|---------|------|--------|----------|------|
| KPI hero values | `--font-size-3xl` | 700 | tight | DM Sans |
| KPI card values | `--font-size-2xl` | 700 | tight | DM Sans |
| KPI labels | `--font-size-sm` | 500 | normal | DM Sans |
| Card titles | `--font-size-lg` | 600 | normal | DM Sans |
| Table data | `--font-size-sm` | 400 | normal | DM Sans |
| Table headers | `--font-size-xs` | 600 | wide | DM Sans |
| Badges/chips | `--font-size-xs` | 500 | wide | DM Sans, uppercase |
| Timestamps | `--font-size-xs` | 400 | normal | DM Sans |
| Chart labels | `--font-size-2xs` | 400 | normal | DM Sans |
| Landing hero | `--font-size-4xl`+ | 700 | tight | Fraunces |
| Code/metrics | `--font-size-sm` | 400 | normal | JetBrains Mono |

### 2.3 Spacing & Radius

#### Spacing System

Tailwind's default 4px base grid is the canonical spacing system. No custom spacing tokens needed.

| Step | Value | Use case |
|------|-------|----------|
| 1 | 4px (`p-1`) | Minimal internal padding |
| 2 | 8px (`p-2`, `gap-2`) | Icon padding, tight gaps |
| 3 | 12px (`p-3`, `gap-3`) | Small card padding |
| 4 | 16px (`p-4`, `gap-4`) | Standard card padding, section gaps |
| 5 | 20px (`p-5`) | Medium spacing |
| 6 | 24px (`p-6`, `gap-6`) | Large card padding, section spacing |
| 8 | 32px (`p-8`) | Section padding (dashboard) |

**Component spacing rules:**
- Dashboard cards: `p-4` or `p-6` depending on content density
- Card gaps in grids: `gap-4` (compact) or `gap-6` (spacious)
- Section vertical spacing: `space-y-6` or `space-y-8`
- Sidebar items: `p-2` horizontal, `gap-1` vertical
- Form fields: `space-y-4` between fields

#### Border Radius

Existing tokens in `@theme`:

```css
--radius: 0.5rem;                       /* 8px — base */
--radius-lg: var(--radius);              /* 8px — cards, containers */
--radius-md: calc(var(--radius) - 2px);  /* 6px — buttons, inputs */
--radius-sm: calc(var(--radius) - 4px);  /* 4px — badges, chips, small elements */
```

**Usage rules:**
- Cards, modals, panels: `rounded-lg` (8px)
- Buttons, inputs, selects: `rounded-md` (6px)
- Badges, chips, tags: `rounded-sm` (4px)
- Avatars, status dots: `rounded-full`
- Charts (recharts): no border radius (sharp edges)

### 2.4 Glassmorphism System

#### 3-Tier Specification

Replace existing ad-hoc `glass` and `glass-dark` utilities (currently unused or inconsistently applied) with a systematic 3-tier approach:

| Tier | CSS Class | Background | Blur | Border | Shadow | Use Case |
|------|-----------|------------|------|--------|--------|----------|
| `glass-subtle` | `@utility glass-subtle` | `oklch(1 0 0 / 0.04)` | `8px` | `1px oklch(1 0 0 / 0.08)` | none | Dashboard cards, inline surfaces |
| `glass-standard` | `@utility glass-standard` | `oklch(0.18 0.02 260 / 0.75)` | `16px` | `1px oklch(1 0 0 / 0.12)` | `0 4px 24px oklch(0 0 0 / 0.2)` | Modals, side panels, dropdowns |
| `glass-strong` | `@utility glass-strong` | `oklch(0.15 0.02 260 / 0.9)` | `24px` | `1px oklch(1 0 0 / 0.15)` | `0 8px 32px oklch(0 0 0 / 0.3)` | Tooltips, command palette, top-layer |

**Light edge trick** (for `glass-standard` and `glass-strong`):
```css
box-shadow: inset 0 1px 0 oklch(1 0 0 / 0.1), /* light edge */ 0 4px 24px oklch(0 0 0 / 0.2);
```

#### CSS Implementation

```css
/* Replace existing glass/glass-dark utilities in globals.css */

@utility glass-subtle {
  background: oklch(1 0 0 / 0.04);
  backdrop-filter: blur(8px);
  border: 1px solid oklch(1 0 0 / 0.08);
}

@utility glass-standard {
  background: oklch(0.18 0.02 260 / 0.75);
  backdrop-filter: blur(16px);
  border: 1px solid oklch(1 0 0 / 0.12);
  box-shadow: inset 0 1px 0 oklch(1 0 0 / 0.1), 0 4px 24px oklch(0 0 0 / 0.2);
}

@utility glass-strong {
  background: oklch(0.15 0.02 260 / 0.9);
  backdrop-filter: blur(24px);
  border: 1px solid oklch(1 0 0 / 0.15);
  box-shadow: inset 0 1px 0 oklch(1 0 0 / 0.1), 0 8px 32px oklch(0 0 0 / 0.3);
}
```

#### Component Mapping (migration guide)

| Current Pattern | Component(s) | Target Tier | Notes |
|-----------------|-------------|-------------|-------|
| `bg-white/5 border border-white/10` | Dashboard cards, call detail sections, empty states | `glass-subtle` | Most common — ~15 instances |
| `bg-white/10 border border-white/20` | Buttons, logout, error fallback actions | Interactive overlay (not glass) | Use `--hover-overlay`/`--active-overlay` tokens instead |
| `bg-white/5` (no border) | Table headers, icon backgrounds, nav hover | Contextual | Keep as-is or migrate to `--surface-1` |
| `glass` utility | Not actively used | Remove | Replace with `glass-subtle` |
| `glass-dark` utility | Not actively used | Remove | Replace with `glass-subtle` |

**Note**: Hover states (`hover:bg-white/10`, `hover:bg-white/20`) are interactive overlays, not glassmorphism tiers. They map to `--hover-overlay` and `--active-overlay` tokens, not glass utilities.

#### Performance Rules

- **Max 3 `backdrop-filter` elements** simultaneously visible in viewport
- Prefer `glass-subtle` (8px blur) for frequently rendered components
- `glass-standard` and `glass-strong` reserved for overlay/modal contexts (fewer simultaneous instances)
- Mobile: consider reducing blur values by 50% if GPU performance degrades

### 2.5 Animation Architecture

#### Motion Library Setup

**Current state**: `motion` ^12.38.0 installed, imported as `motion` in 16 files. No LazyMotion, no MotionConfig. Full bundle shipped (~33kb gzip).

**Target architecture**:

```
app/layout.tsx
  +- <MotionProvider>
       +- <MotionConfig reducedMotion="user">
            +- <LazyMotion features={domAnimation} strict>
                 +- <ViewTransition>
                      +- {children}
```

**MotionProvider** (`components/providers/motion-provider.tsx`):

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
```

- **`strict` prop**: Throws an error if any component uses `motion.*` instead of `m.*` inside the LazyMotion scope. Prevents accidental full-bundle imports that bypass tree-shaking
- **Bundle savings**: `m` component = ~4.6kb + `domAnimation` = ~15kb = ~20kb total vs ~34kb full bundle

**Migration path**: `import { motion } from 'motion/react'` -> `import * as m from 'motion/react-m'`

16 files to migrate during Units 3-6. Component-level change, no `package.json` change.

**Import exception**: `AnimatePresence` is NOT available in `motion/react-m`. It must continue to be imported from `motion/react`. Files using `AnimatePresence` keep their `motion/react` import for that specific export, and use `m` from `motion/react-m` for animated elements.

#### Animation Tokens

**CSS custom properties** (add to `:root` in `globals.css`):

```css
/* Durations — intentional value changes from existing system */
--duration-instant: 50ms;       /* new */
--duration-fast: 100ms;         /* was 75ms — slightly more perceptible */
--duration-normal: 200ms;       /* was 150ms — feels more deliberate */
--duration-moderate: 300ms;     /* new */
--duration-slow: 400ms;         /* was 300ms — landing page reveals */
--duration-xslow: 600ms;        /* new — page transitions */
/* --duration-waveform: 3000ms — preserved, audio player specific */

/* Easing curves (add to @theme for Tailwind utility generation) */
--ease-default: cubic-bezier(0.4, 0, 0.2, 1);    /* Standard — general purpose */
--ease-in: cubic-bezier(0.4, 0, 1, 1);            /* Accelerate — exits, dismissals */
--ease-out: cubic-bezier(0, 0, 0.2, 1);           /* Decelerate — entrances, reveals */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1); /* Overshoot — pop-in, notifications */

/* Stagger */
--stagger-delay: 50ms;
```

**JS constant exports** (`lib/motion-tokens.ts`):

CSS vars cannot be used directly in Motion's JS `transition` API. Mirror tokens as JS constants:

```typescript
// lib/motion-tokens.ts — JS mirror of CSS animation tokens
// CSS vars are canonical, JS file mirrors them

export const duration = {
  instant: 0.05,
  fast: 0.1,
  normal: 0.2,
  moderate: 0.3,
  slow: 0.4,
  xslow: 0.6,
} as const

export const ease = {
  default: [0.4, 0, 0.2, 1],
  in: [0.4, 0, 1, 1],
  out: [0, 0, 0.2, 1],
  spring: [0.34, 1.56, 0.64, 1],  // cubic-bezier approximation for CSS compat
} as const

// For true spring physics in Motion components (mass/stiffness/damping tuning):
export const spring = {
  gentle: { type: 'spring' as const, stiffness: 200, damping: 20 },
  snappy: { type: 'spring' as const, stiffness: 300, damping: 25 },
  bouncy: { type: 'spring' as const, stiffness: 400, damping: 15 },
} as const

export const stagger = {
  default: 0.05,
  fast: 0.03,
  slow: 0.08,
} as const
```

#### Usage Matrix

| Interaction | Duration | Easing | Notes |
|-------------|----------|--------|-------|
| Hover states, dropdowns appear | `--duration-normal` (200ms) | `--ease-out` | Decelerate into view |
| Dismissals, collapses | `--duration-fast` (100ms) | `--ease-in` | Accelerate away |
| Route transitions, panel slides | `--duration-moderate` (300ms) | `--ease-default` | Standard feel |
| Notifications, badges pop-in | `--duration-moderate` (300ms) | `--ease-spring` | Subtle overshoot |
| Scroll-triggered reveals | `--duration-slow` (400ms) | `--ease-out` | Gentle entrance |
| Page transitions (ViewTransition) | `--duration-slow` (400ms) | `--ease-out` | Cross-route |

#### Page Transitions — React ViewTransition

React 19's `<ViewTransition>` component provides cross-route transitions with graceful degradation.

```typescript
// next.config.ts
experimental: { viewTransition: true }

// app/layout.tsx
import { ViewTransition } from 'react'
// Wrap children inside MotionProvider:
// <MotionProvider>
//   <ViewTransition>{children}</ViewTransition>
// </MotionProvider>
```

**CSS customization** (add to `globals.css`):

```css
::view-transition-old(root) {
  animation: fade-out var(--duration-normal) var(--ease-in);
}
::view-transition-new(root) {
  animation: fade-in var(--duration-moderate) var(--ease-out);
}

@keyframes fade-out { from { opacity: 1; } to { opacity: 0; } }
@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }

@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(root),
  ::view-transition-new(root) {
    animation: none;
  }
}
```

**PRD reconciliation**: PRD-saas.md recommended against the raw View Transitions API. React 19's `<ViewTransition>` is distinct — it's a framework-blessed wrapper with graceful degradation (no-op on unsupported browsers). Browser support is broad: Chrome 111+, Firefox 133+, Safari 18+. Experimental in Next.js 16 (`experimental.viewTransition: true` config flag). Risk: API may stabilize in React 20 / Next.js 17. Fallback: CSS-based transitions work without the component.

**PageTransition note**: Master plan lists `PageTransition` as a motion primitive. This is fulfilled by `<ViewTransition>` (browser-native, lighter than a Motion wrapper). No separate `PageTransition` component needed.

#### Motion Primitives Catalog

All primitives live in `components/motion/`. All are `'use client'`, hydration-safe (initial state matches server render), GPU-only properties.

| Primitive | File | Use Case | Props | Animation |
|-----------|------|----------|-------|-----------|
| `FadeIn` | `fade-in.tsx` | Cards, modals, sections | `delay?`, `duration?`, `className?` | opacity 0 -> 1 |
| `SlideUp` | `slide-up.tsx` | Hero text, CTAs, entering content | `delay?`, `className?` | opacity 0 -> 1, y 16 -> 0 |
| `SlideIn` | `slide-in.tsx` | Side panels, drawers | `direction: 'left' \| 'right'`, `className?` | opacity 0 -> 1, x +/-24 -> 0 |
| `StaggerChildren` | `stagger-children.tsx` | Agent card grids, lists | `staggerDelay?`, `className?` | Container: stagger 80ms. Items: opacity 0 -> 1, y 12 -> 0 |
| `ScaleIn` | `scale-in.tsx` | Badges, chips, tooltips, notifications | `scale?`, `className?` | opacity 0 -> 1, scale 0.9 -> 1 |
| `FadeInWhenVisible` | `fade-in-when-visible.tsx` | Scroll-triggered sections (landing, long pages) | `delay?`, `threshold?`, `className?` | whileInView: opacity 0 -> 1, y 20 -> 0. `viewport={{ once: true, margin: '-80px' }}` |

**Existing component migration**:
- `Reveal.tsx` (components/landing/): Supports 5 directions (up/down/left/right/none) with `amount: 0.15`. Replace with `FadeInWhenVisible` for scroll-up reveals and `SlideIn` for horizontal reveals. Audit all `<Reveal>` usages during Units 3-6
- All 16 files using `import { motion } from 'motion/react'`: Migrate to `import * as m from 'motion/react-m'`

### 2.6 Loading States

#### Skeleton/Shimmer Pattern

CSS-only shimmer animation — no Motion dependency, lightweight.

```css
/* Add to globals.css */
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

#### Component Pairing Rules

- Every component with async data gets a paired `*Skeleton` co-located in the same file
- Skeleton dimensions must match real content dimensions (prevents CLS)
- Max 5 simultaneous shimmer elements in viewport — use `animate-pulse` (existing Tailwind) for secondary slots
- Pattern: `{ComponentName}` + `{ComponentName}Skeleton` in same file

Example:
```typescript
// components/dashboard/KPICard.tsx
export function KPICard({ data }: Props) { /* ... */ }
export function KPICardSkeleton() {
  return (
    <div className="glass-subtle rounded-lg p-4">
      <div className="skeleton h-4 w-24 mb-2" />
      <div className="skeleton h-8 w-16" />
    </div>
  )
}
```

### 2.7 Accessibility

#### Reduced Motion Strategy — 3 Layers

**Layer 1 — MotionConfig (automatic)**:
`<MotionConfig reducedMotion="user">` auto-disables transform/layout animations while preserving opacity and backgroundColor transitions. Covers the majority of animations with zero per-component effort.

**Layer 2 — CSS @media (View Transitions & keyframes)**:
```css
@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(root),
  ::view-transition-new(root) { animation: none; }

  .skeleton { animation: none; }
  /* Other CSS keyframe animations */
}
```

**Layer 3 — useReducedMotion() hook (edge cases)**:
For cases where MotionConfig isn't sufficient — e.g., swapping a parallax scroll for a static layout, or disabling autoplay behaviors not controlled by transform/opacity animations.

```typescript
import { useReducedMotion } from 'motion/react'

function ParallaxSection() {
  const shouldReduceMotion = useReducedMotion()
  // Swap parallax for static layout when reduced motion preferred
}
```

Per PRD: "useReducedMotion() hook for opacity/color transitions that Framer Motion doesn't auto-disable." Most components only need Layers 1+2.

#### Contrast Ratios

Current landing page has a `color-contrast` failure on `text-muted-foreground`. Target:
- **Normal text**: >= 4.5:1 contrast ratio (WCAG AA)
- **Large text** (>= 18px or >= 14px bold): >= 3:1 contrast ratio
- **UI components**: >= 3:1 contrast ratio

`--muted-foreground: oklch(0.65 0.02 255)` on `--background: oklch(0.13 0.025 260)` — verify contrast ratio and adjust lightness if needed during implementation.

#### Focus Ring Specification

```css
--focus-ring: oklch(0.75 0.14 230 / 0.5);  /* Primary at 50% opacity */
```

Applied via `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background` pattern (existing shadcn pattern). The offset ensures the ring is visible against any surface color.

### 2.8 Performance Budget

#### Lighthouse Targets (autoresearch-compatible)

| Metric | Target | Current (Landing) | Current (Dashboard) |
|--------|--------|-------------------|---------------------|
| Performance | >= 90 | TBD (trace-based) | TBD (trace-based) |
| Accessibility | >= 90 | 96 | 88 (fix in Unit 3) |
| SEO | >= 90 | 100 | 100 |
| Best Practices | >= 90 | 100 | 100 |

#### Core Web Vitals Targets

| Vital | Target | Current (Landing) | Current (Dashboard) |
|-------|--------|-------------------|---------------------|
| LCP | < 2,500ms | 2,646ms (needs work) | 916ms (good) |
| CLS | < 0.1 | 0.00 (excellent) | 0.08 (monitor) |
| INP | < 200ms | N/A (measure in Unit 6) | N/A |

#### Animation Performance Rules

- **GPU-only properties**: Animate only `transform` and `opacity` (always compositor-promoted). `filter` is generally GPU-friendly for simple operations
- **Never animate**: `width`, `height`, `margin`, `padding`, `top`/`left`, `clip-path` (not reliably GPU-accelerated)
- **Frame budget**: 16.67ms per frame (60fps) — no layout/paint during animations
- **Max whileInView**: ~30 simultaneous elements. Use `StaggerChildren` for larger lists
- **backdrop-filter**: Max 3 elements with blur simultaneously in viewport
- **Skeleton shimmer**: Max 5 simultaneous shimmer elements. Use `animate-pulse` for secondary slots

#### Autoresearch Compatibility

Deterministic metrics for `/autoresearch` skill (Principle 4: Karpathy Loop):

| Metric | Tool | Pass Condition |
|--------|------|----------------|
| Lighthouse Performance | Lighthouse CI | >= 90 |
| Lighthouse Accessibility | Lighthouse CI | >= 90 |
| CLS | Performance trace | < 0.1 |
| INP | Performance trace | < 200ms |
| `tsc` | `npm run type-check` | Exit 0 |
| Biome lint | `npm run lint` | Exit 0 |
| Bundle size | `npm run build` | No regression from baseline |
