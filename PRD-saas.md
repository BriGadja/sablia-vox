# Sablia Vox — Client-Ready Platform PRD

Source brief: research/brainstorm/2026-04-12-saas-claude-code-non-engineer-patterns-brief.md
Source report: research/brainstorm/2026-04-12-saas-claude-code-non-engineer-patterns.md

## Overview
- **Client**: Sablia (internal)
- **Objective**: Make Sablia Vox client-ready — existing voice agent customers can access their dashboard autonomously, see their data, and experience a polished product. Bridge the gap between landing page and dashboard. Foundation for future self-serve SaaS
- **Target users**: French B2B businesses (real estate, automotive, insurance) who already have or are being sold a Sablia voice agent. Non-technical users who want to monitor agent performance
- **Delivery**: Phased — Phase 1 (client readiness) then Phase 2 (customer success features)

## Strategy

### Why NOT self-serve billing yet
- At €300/month, French B2B buyers expect a demo + human contact (Lemlist/Crisp playbook)
- Manual onboarding IS the competitive moat for a solo founder with <15 clients
- Billing infrastructure only becomes a bottleneck at ~15 clients
- Revenue model: €300/month per agent (100 min included) + €0.27/min overage + €0.14/SMS — billed manually via PDF invoices for now

### What we build instead
- **Phase 1**: Fix what's broken, enable client self-service on the dashboard, polish the experience
- **Phase 2**: Add features that increase retention and demonstrate ongoing value (recordings, suggestions, consumption transparency)
- **Phase 3** (deferred): Self-serve signup, Polar billing, subscription gating, n8n automation layer

### Competitive positioning
Vox already ships all 5 features the market considers "minimum viable dashboard": call log, call recordings + transcripts, volume charts, outcome breakdown, summary KPIs. The gap is operational readiness, not features.

Vox's moat vs Dipler native: multi-org client portal, business-domain KPIs (template-type-aware conversion rates), cross-agent comparative analytics, branded experience. Dipler provides raw per-conversation data — Vox provides business intelligence.

### Design quality bar
The frontend must be **enterprise-grade** — on par with Awwwards-level sites. This is a differentiator: clients paying €300/month expect a premium product feel, not a generic SaaS dashboard. Specifically:
- **Micro-interactions**: Every button, card, and toggle has purposeful motion feedback
- **Page transitions**: Smooth content transitions between routes using CSS-based fade/slide (View Transitions API is experimental in Next.js 16 — use CSS `@starting-style` + `transition` or Framer Motion `animate`/`initial` on page wrapper, NOT `AnimatePresence` exit animations which are broken in App Router without unstable workarounds)
- **Scroll-triggered animations**: Data sections reveal with staggered entrance animations
- **Loading states**: Skeleton screens with shimmer, not spinners
- **Typography & spacing**: Deliberate rhythm, not default padding
- **Dark theme excellence**: Proper contrast ratios, glow effects, depth through layered transparency

### Autoresearch readiness
The codebase must be structured for **continuous improvement via `/autoresearch`** (Principle 4 — Karpathy Loop). This means:
- **Deterministic metrics**: Lighthouse scores (performance, accessibility, SEO) as the objective function
- **Component isolation**: Each UI component independently testable and improvable
- **Animation performance budget**: No layout thrashing, GPU-accelerated transforms only, 60fps target
- **Bundle-aware architecture**: Code-split per route, lazy-load heavy components (charts, audio player)
- **Measurable interaction latency**: Interaction to Next Paint (INP) < 200ms, Cumulative Layout Shift < 0.1

---

## User Stories

### Phase 1: Client-Ready Dashboard

#### Tech Debt Fixes (prerequisite)

- **US-1**: As a client, I want sidebar agent navigation to work so that I can click on my agents and see their detail
  - Acceptance: AgentTree links navigate to `/dashboard/agents/[id]` (not `/dashboard/agent/[id]`)
  - Acceptance: All agent clicks from sidebar land on working pages

- **US-2**: As the platform, I want a single consistent admin check so that admin-only features are reliably gated
  - Acceptance: One `checkIsAdmin()` implementation used across layout, pages, and queries
  - Acceptance: Non-admin users never see admin-only UI (financial page shows redirect or `notFound()`, not empty shell)
  - Acceptance: Financial page has explicit server-side admin gate

- **US-3**: As a client visiting the landing page, I want to see "Sablia Vox" branding (not VoIPIA) so that the product feels current and professional
  - Acceptance: All VoIPIA references in landing components replaced with Sablia Vox
  - Acceptance: Financial filter hardcoded "voipia" string replaced with config/constant

#### Magic Link Client Access

- **US-4**: As an admin (Brice), I want to invite a client to the dashboard via magic link so that they can access their data without managing passwords
  - Acceptance: Settings > Team has "Invite member" form (email input + permission level selector)
  - Acceptance: Submitting sends a Supabase magic link email to the new member
  - Acceptance: New member joins the same org with `read` permission by default
  - Acceptance: Invited user clicks magic link → lands on `/auth/callback` → redirected to `/dashboard`

- **US-5**: As an invited client, I want to log in via magic link so that I don't need to remember a password
  - Acceptance: Login page offers "Se connecter par email" (magic link) option alongside password
  - Acceptance: Magic link authentication flow works end-to-end (email → click → dashboard)
  - Acceptance: First login redirects to dashboard with appropriate non-admin view

#### Settings Page (Editable)

- **US-6**: As an org admin, I want to edit my organization profile so that my billing and contact info are correct
  - Acceptance: Settings page org section has editable fields: name, billing email, industry (with dropdown)
  - Acceptance: Changes save via Server Action with Zod validation
  - Acceptance: Success toast on save, error toast on failure
  - Acceptance: Non-admin users see read-only view (no edit forms)

- **US-7**: As an org admin, I want to manage team members so that I control who accesses the dashboard
  - Acceptance: Settings > Team shows member list with name, email, permission level, join date
  - Acceptance: Admin can change member permission level (read/write/admin)
  - Acceptance: Admin can remove members (with confirmation dialog)
  - Acceptance: Invite form (US-4) is part of this section

#### Client-Facing Polish

- **US-8**: As a client user, I want the dashboard to show only what's relevant to me so that I'm not confused by admin features
  - Acceptance: Non-admin sidebar hides: Financial, Administration, Client management sections
  - Acceptance: View-as-user switcher hidden for non-admins
  - Acceptance: No admin-only pages accessible via direct URL (redirect to `/dashboard`)
  - Acceptance: Performance page accessible in sidebar (currently missing from SidebarConfig — L1)

- **US-9**: As a client, I want deep links to work when I bookmark or share a dashboard URL so that I can navigate directly to a specific view
  - Acceptance: `?redirect=` param from middleware is consumed by LoginForm
  - Acceptance: After magic link login, user returns to the page they were trying to access
  - Acceptance: URL filters (date range, agent) are preserved across login redirects

- **US-10**: As a client, I want a custom 404 page in the dashboard so that errors feel handled, not broken
  - Acceptance: Dashboard 404 page matches dark theme with violet accent
  - Acceptance: Shows "Page introuvable" with link back to `/dashboard`

#### Landing Page Bridge

- **US-11**: As a visitor, I want to see pricing information on the website so that I understand the cost before booking a demo
  - Acceptance: Pricing section added to landing page (not a separate `/pricing` page) showing: €300/month per agent, 100 min included, overage rates
  - Acceptance: CTA links to demo booking (existing `/tester-nos-agents` form), not to a signup page
  - Acceptance: Section fits the existing landing page design (glassmorphism cards, dark theme)

---

### Phase 2: Customer Success Features

#### Audio & Transcript Experience

- **US-12**: As a client, I want to listen to call recordings directly in the dashboard so that I can review agent conversations
  - Acceptance: Call detail page has working audio player with play/pause, seek, playback speed
  - Acceptance: Audio loads from Dipler signed URLs (4 tracks available: merged, user mic, VAD, Iris)
  - Acceptance: Fallback state when recording is unavailable (not all calls have recordings)
  - Acceptance: Transcript syncs with audio playback position (if feasible)

- **US-13**: As a client, I want to read call transcripts so that I can understand what happened in each conversation
  - Acceptance: Call detail page shows full conversation transcript with speaker labels
  - Acceptance: Transcript is searchable (ctrl+F works naturally)
  - Acceptance: Key moments highlighted (outcome-relevant exchanges)

#### Agent Insights & Suggestions

- **US-14**: As a client, I want to see AI-generated suggestions for improving my agent so that I can optimize its performance
  - Acceptance: Agent detail page has "Suggestions" section showing recent improvement suggestions
  - Acceptance: Suggestions sourced from `improvement_suggestions` table (currently empty — needs population mechanism)
  - Acceptance: Each suggestion shows: category, description, confidence, status (pending/applied/dismissed)

- **US-15**: As a client, I want to see my agent's quality trend over time so that I know if it's getting better or worse
  - Acceptance: Agent detail page has quality trend chart using `quality_snapshots` data
  - Acceptance: Shows daily quality score (1-5) over last 30 days
  - Acceptance: Visual indicators for improvement/degradation trend

#### Consumption Transparency

- **US-16**: As a client, I want to see my current month's consumption so that I understand my costs
  - Acceptance: Dashboard shows consumption section: minutes used, SMS count, estimated overage cost
  - Acceptance: Data sourced from existing `calls` + `sms` tables (aggregate for current billing period)
  - Acceptance: Per-agent breakdown (agent A: 73 min, agent B: 45 min)
  - Acceptance: Visual progress bar showing usage vs included 100 min per agent

- **US-17**: As a client, I want consumption dates to persist in the URL so that I can bookmark or share a specific view
  - Acceptance: Consumption page uses nuqs URL params for date range (fixing M3 tech debt)
  - Acceptance: Date range preserved on page refresh and navigation

#### Onboarding Experience

- **US-18**: As a new client logging in for the first time, I want a welcome experience so that I understand what I'm looking at
  - Acceptance: First-login detection (no prior sessions or `user_metadata.onboarded_at IS NULL` on auth session)
  - Acceptance: Welcome modal/banner with: "Bienvenue sur Sablia Vox", 3 key features highlighted (calls, agents, analytics), dismissible
  - Acceptance: After dismissal, sets `user_metadata.onboarded_at` via `supabase.auth.updateUser()` — never shows again

---

## Data Model

### Modified Entities

| Entity | Changes | Why |
|--------|---------|-----|
| Organization | None needed — `name`, `billing_email`, `industry` already exist | Settings edit uses existing columns |
| User (auth.users) | Use `user_metadata.onboarded_at` via `supabase.auth.updateUser()` — Supabase prohibits adding columns to `auth.users` directly | Track first-login onboarding completion |
| User Org Membership | None — `permission_level` already supports read/write/admin | Team management uses existing columns |

### No New Tables Required

Phase 1+2 operates mostly on existing tables. The `quality_snapshots` table exists (underused). The `improvement_suggestions` table does NOT exist in the v2 database — it must be created as a migration in Unit 5, or US-14 is deferred. Consumption data is computed from `calls`, `sms`, `emails` tables.

### Key Queries

| Query | Used by | Complexity |
|-------|---------|------------|
| Org profile by org_id | Settings > Org tab | Simple — already exists in settings page |
| Org members with user details | Settings > Team tab | Simple — already exists in settings page |
| Update org profile fields | Settings > Org edit | Simple — `UPDATE organizations SET ... WHERE id = org_id` |
| Invite member (Supabase Auth) | Settings > Team invite | Medium — API route with service_role key calls `supabase.auth.admin.inviteUserByEmail()`, then `INSERT user_org_memberships` with invited user's ID. Uses `token_hash` email template to prevent corporate scanner link invalidation |
| Remove member | Settings > Team remove | Simple — `DELETE FROM user_org_memberships WHERE user_id = ? AND org_id = ?` |
| Current period consumption per deployment | Consumption section | Medium — aggregate `calls.duration_seconds` + `sms` count for current billing period |
| Quality trend by deployment | Agent detail > Quality chart | Simple — `SELECT * FROM quality_snapshots WHERE deployment_id = ? ORDER BY snapshot_date` |
| Improvement suggestions by deployment | Agent detail > Suggestions | Simple — `SELECT * FROM improvement_suggestions WHERE deployment_id = ?` |

---

## UI Specifications

### Settings Page (`/dashboard/settings`) — Full Rebuild

Existing page is read-only. Rebuild as tabbed interface with edit capabilities.

**Layout**:
```
┌──────┬──────────────────────────────────┐
│      │  Paramètres                      │
│      │  ┌──────────┬───────────┐       │
│ Side │  │ Organis. │ Équipe    │       │
│ bar  │  └──────────┴───────────┘       │
│      │                                  │
│      │  [Tab content below]             │
│      │                                  │
└──────┴──────────────────────────────────┘
```

**Tab: Organisation** (admin: editable form / non-admin: read-only display)
```
│  Organisation                           │
│  ┌────────────────────────────────┐    │
│  │  Nom         [Nestenn       ]  │    │
│  │  Secteur     [Immobilier   ▼]  │    │
│  │  Email fact. [a@nestenn.fr ]   │    │
│  │                                │    │
│  │          [Enregistrer]         │    │
│  └────────────────────────────────┘    │
```

**Tab: Équipe** (admin: full management / non-admin: read-only list)
```
│  Membres de l'équipe                    │
│  ┌────────────────────────────────┐    │
│  │  👤 Bob Martin                  │    │
│  │     bob@nestenn.fr   Admin  [⋮] │    │
│  │  👤 Alice Dupont                │    │
│  │     alice@nestenn.fr Read   [⋮] │    │
│  └────────────────────────────────┘    │
│                                        │
│  Inviter un membre                     │
│  ┌────────────────────────────────┐   │
│  │  Email [____________]          │   │
│  │  Rôle  [Lecture      ▼]       │   │
│  │              [Envoyer]         │   │
│  └────────────────────────────────┘   │
```

- **Components**: SettingsTabs, OrgProfileForm (client, Zod validation), TeamMemberList, MemberActions (dropdown: change role, remove), InviteMemberForm
- **Interactions**: Org save via Server Action, invite via Supabase Auth `inviteUserByEmail()`, role change via `UPDATE user_org_memberships`, remove with confirmation dialog

### Login Page Enhancement

Add magic link option below existing password form:

```
│  ┌────────────────────────────────┐  │
│  │  Connexion                      │  │
│  │                                 │  │
│  │  Email     [________________]   │  │
│  │  Mot de p. [________________]   │  │
│  │                                 │  │
│  │  [Se connecter]                 │  │
│  │                                 │  │
│  │  ─────── ou ───────            │  │
│  │                                 │  │
│  │  [Recevoir un lien magique]     │  │
│  │                                 │  │
│  │  Mot de passe oublié ?          │  │
│  └────────────────────────────────┘  │
```

### Landing Page Pricing Section

New section added between existing DashboardShowcase and FAQ sections:

```
│  Tarification simple et transparente   │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │  €300 /mois par agent             │ │
│  │  ──────────────────────────       │ │
│  │  ✓ 100 minutes incluses          │ │
│  │  ✓ Dashboard analytique complet  │ │
│  │  ✓ Auto-guérison de l'agent      │ │
│  │  ✓ Monitoring en temps réel      │ │
│  │  ✓ Notifications SMS             │ │
│  │  ✓ Support dédié                 │ │
│  │  ──────────────────────────       │ │
│  │  Dépassement: 0.27€/min          │ │
│  │  SMS: 0.14€/SMS                  │ │
│  │                                   │ │
│  │  [Réserver une démo]              │ │
│  └──────────────────────────────────┘ │
```

- **Components**: PricingSection (server component, uses existing `PricingTier` type from `lib/types/landing.ts`)
- **CTA**: Links to `/tester-nos-agents` (existing demo form), NOT to signup

### Dashboard 404 Page

```
┌──────┬──────────────────────────────┐
│      │                              │
│ Side │    Page introuvable          │
│ bar  │    La page demandée n'existe │
│      │    pas ou a été déplacée.    │
│      │                              │
│      │    [← Retour au dashboard]   │
│      │                              │
└──────┴──────────────────────────────┘
```

### Consumption Section (Phase 2)

New component in `/dashboard/consumption` (existing route, needs enhancement):

```
│  Ma consommation — Avril 2026         │
│                                        │
│  ┌────────────────────────────────┐   │
│  │  Agent Louis (Nestenn)         │   │
│  │  73 / 100 min  ████████░░░░   │   │
│  │  Dépassement: 0 min            │   │
│  │                                │   │
│  │  Agent Arthur (Nestenn)        │   │
│  │  112 / 100 min ████████████   │   │
│  │  Dépassement: 12 min (3.24€)  │   │
│  │                                │   │
│  │  SMS envoyés: 45  (6.30€)     │   │
│  └────────────────────────────────┘   │
│                                       │
│  Total estimé: 609.54€               │
│  (2 × 300€ + 3.24€ + 6.30€)         │
```

### Welcome Modal (Phase 2)

```
┌────────────────────────────────────────┐
│                                        │
│  Bienvenue sur Sablia Vox              │
│                                        │
│  Votre tableau de bord pour suivre     │
│  vos agents vocaux en temps réel.      │
│                                        │
│  📊 Vue d'ensemble                     │
│     KPIs, volumes, tendances           │
│                                        │
│  🤖 Vos agents                         │
│     Performance, appels, suggestions   │
│                                        │
│  📞 Historique                         │
│     Détails, enregistrements,          │
│     transcriptions                     │
│                                        │
│  [C'est parti →]                       │
│                                        │
└────────────────────────────────────────┘
```

---

## Technical Constraints

| Aspect | Choice | Rationale |
|--------|--------|-----------|
| Framework | Next.js 16 (App Router) | Already in use |
| Database | Supabase (PostgreSQL + RLS) | Already in use, no new tables in Phase 1 |
| Auth | Supabase Auth (password + magic link) | Magic link already supported, just needs UI |
| Hosting | Vercel | Already in use |
| UI Library | shadcn/ui + Tailwind v4 | Already in use |
| State | TanStack Query + nuqs | Already in use |
| Email | Resend (custom SMTP via Supabase) | Built-in SMTP limited to 2 emails/hour — Resend required for production invite volume. Already credentialed in n8n |

## Tech Deliverables

| Stack Component | Deliverable | Description |
|-----------------|-------------|-------------|
| UI / Design | `DESIGN-SPEC.md` | Design tokens, animation system, component hierarchy, responsive breakpoints, Lighthouse targets |
| API / Data Layer | `API-client-ready.md` | Server actions (org edit, team management, invite), magic link auth flow |

Database deliverable omitted — no new tables.

## Non-Functional Requirements

- **Responsive**: Mobile-first — all new pages work at 375px. Tablet (768px) and desktop (1280px+) layouts designed intentionally, not just "wider"
- **Performance (Lighthouse targets)**:
  - Performance score: >= 90 (landing), >= 85 (dashboard)
  - First Contentful Paint: < 1.5s
  - Largest Contentful Paint: < 2.5s
  - Interaction to Next Paint (INP): < 200ms
  - Cumulative Layout Shift: < 0.1
  - Total Blocking Time: < 200ms
- **Animation performance**:
  - All animations use `transform` and `opacity` only (GPU-composited, no layout triggers)
  - 60fps target on mid-range devices
  - `prefers-reduced-motion` fully respected: Framer Motion `MotionConfig reducedMotion="user"` for transform/layout animations + `useReducedMotion()` hook for opacity/color transitions that Framer Motion doesn't auto-disable
  - No animation on initial server render (hydration-safe)
- **Bundle size**: Route-level code splitting. No chart library loaded on pages without charts. Audio player lazy-loaded
- **Security**: Server Actions validate with Zod, admin checks consolidated, invite sends via Supabase Auth (not custom email)
- **i18n**: French (existing language)
- **Accessibility**: WCAG 2.1 AA minimum. Settings forms follow shadcn/ui accessible patterns. Contrast ratios verified on dark theme. Focus rings visible. Screen reader labels on interactive elements
- **SEO**: Landing page pricing section with JSON-LD structured data (SaaS product schema)
- **Autoresearch compatibility**: All Lighthouse metrics are deterministic and scriptable. Component architecture supports isolated testing. Animation system centralized (single source of truth for easing curves, durations, stagger patterns)

## Success Criteria

- [ ] AgentTree sidebar navigation works (all agent links resolve correctly)
- [ ] Single `checkIsAdmin()` used everywhere, financial page gated server-side
- [ ] All VoIPIA references replaced with Sablia Vox in landing + financial
- [ ] Magic link login works end-to-end (send → click → dashboard)
- [ ] Admin can invite member via settings → magic link email sent → member joins org
- [ ] Settings org tab: admin edits name/email/industry, non-admin sees read-only
- [ ] Settings team tab: admin changes roles, removes members with confirmation
- [ ] Non-admin users see clean dashboard — no admin features visible or accessible
- [ ] Deep links work after login (`?redirect=` param consumed)
- [ ] Dashboard 404 matches dark theme
- [ ] Landing page pricing section renders with correct pricing and demo CTA
- [ ] (Phase 2) Audio player works on call detail, transcript displays with speaker labels
- [ ] (Phase 2) Consumption page shows per-agent usage with progress bars
- [ ] (Phase 2) Agent detail shows quality trend chart + suggestions section
- [ ] (Phase 2) Welcome modal shows on first login, dismissible, never repeats
- [ ] Zero `any` types in new code, Biome lint clean
- [ ] Existing dashboard functionality unchanged for current users
- [ ] Design spec (`DESIGN-SPEC.md`) produced with animation system, tokens, and Lighthouse targets
- [ ] Lighthouse performance >= 90 on landing page, >= 85 on dashboard pages
- [ ] All animations GPU-composited (transform/opacity only), 60fps on mid-range device
- [ ] `prefers-reduced-motion` disables all animations
- [ ] Page transitions smooth (no hard cuts between dashboard routes)
- [ ] Skeleton loading states on all data-dependent sections (no spinners)

## Out of Scope

- **Self-serve signup**: Clients are invited by Brice, not self-registering. Signup page deferred to Phase 3
- **Billing integration (Polar/Stripe)**: Manual invoicing for now. Billing automation deferred to Phase 3
- **Subscription gating middleware**: No paywall — all invited users get full access
- **n8n automation workflows**: No trial expiry, usage alerts, or billing webhooks. Manual process
- **Free trial system**: No trial management — clients get access when Brice invites them
- **Separate /pricing page**: Pricing info is a section on the landing page, not its own route
- **White-label / custom branding**: No per-org customization
- **API key management**: No programmatic access
- **Agent modification UI**: Dashboard is analytics-only. Config changes go through Sablia team
- **Self-serve agent provisioning**: Brice provisions agents manually

## Competitive Reference

This PRD targets parity with the "minimum viable dashboard" shipped by all competitors:

| Feature | VoiceAIWrapper | VoiceAIPortal | Trillet | **Vox (current)** | **Vox (after Phase 1+2)** |
|---------|---------------|---------------|---------|-------------------|--------------------------|
| Call log | Yes | Yes | Yes | **Yes** | Yes |
| Recordings | Yes | Yes | Yes | **Partial** | **Full (US-12)** |
| Transcripts | Yes | Yes | Yes | **Yes** | Enhanced (US-13) |
| Volume chart | Yes | Yes | Yes | **Yes** | Yes |
| Outcome breakdown | Yes | Yes | Yes | **Yes** | Yes |
| Summary KPIs | Basic | ROI calc | Sentiment | **Rich (20 outcomes)** | Yes |
| Client self-access | Magic links | Magic links | Sub-accounts | **Admin-only** | **Magic links (US-4,5)** |
| Usage/billing view | Agency-side | No | Per-minute | **None** | **Per-agent (US-16)** |
| Quality trends | No | No | Basic | **None** | **Daily chart (US-15)** |
| AI suggestions | No | No | No | **None** | **Per-agent (US-14)** |

After Phase 1+2, Vox matches competitors on table-stakes features AND differentiates on quality trends and AI suggestions — features no competitor offers.

## Challenge Gate
- [x] PRD + Master Plan challenged via /challenge (GO — Round 2, 2026-04-12)

## Future Phases (Reference)

### Phase 3: Scale Infrastructure (when manual becomes bottleneck, ~15+ clients)
- Self-serve signup flow (`/signup`)
- Polar billing integration (seat-based + metered)
- Subscription gating middleware
- n8n automation layer (6 workflows: billing webhooks, trial management, usage alerts, onboarding, notifications)
- Separate `/pricing` page

### Phase 4: Platform Features
- Self-serve agent provisioning (Dipler PAK API integration)
- Agent modification UI (prompt editing, config changes)
- White-label per-org branding
- API key management
