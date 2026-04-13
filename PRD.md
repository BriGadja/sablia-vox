# PRD — Sablia Vox

> Single source of truth for the Sablia Vox platform. Last updated: 2026-04-13.

---

## 1. Product Vision & Business Model

**Sablia Vox** is a B2B SaaS platform that deploys AI voice agents for automated lead follow-up and sales qualification.

**Core agents**:
- **Louis** — Instant lead callback (<60s), qualifies via natural conversation, books appointments, sends confirmation SMS
- **Arthur** — Client reactivation via outbound sequences (calls + SMS)
- **Alexandra** — 24/7 inbound reception agent

**Business model**: Monthly subscription (leasing) + consumption-based billing (per minute/SMS/email).

**Target market**: French B2B companies — real estate, automotive, insurance, SaaS.

**Domain**: `vox.sablia.io`

**Users**:
- **Sablia team** (admin) — Full dashboard access, org settings, user management
- **Client users** (non-admin) — Read-only view of their org's agent performance, call history, and consumption data. Invited via magic link (token_hash flow)

---

## 2. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.x |
| Language | TypeScript | 5.x |
| Runtime | React | 19.x |
| Styling | Tailwind CSS | v4 (4.2.x) |
| Animations | Motion (`motion/react`) | 12.x |
| UI Components | shadcn/ui (Radix) + custom | — |
| Database | Supabase (PostgreSQL) | — |
| Auth | Supabase Auth | — |
| Server State | TanStack React Query | 5.x |
| URL State | nuqs | 2.8.x |
| Charts | Recharts | 3.x |
| Notifications | sonner | 2.x |
| Voice AI | Dipler + n8n workflows | — |
| Analytics | Vercel Analytics + GA4 | — |
| Tracking | Lemlist visitor pixel | — |
| Hosting | Vercel | — |
| Linter/Formatter | Biome | 2.4.x |
| Testing | Vitest + React Testing Library | 4.x |

---

## 3. Route Map

### Public Pages

| Route | Purpose | Components |
|-------|---------|------------|
| `/` | Landing page — hero, how it works, SDR comparison, integrations, dashboard showcase, FAQ, floating CTA | HeroHomeV2, HowItWorksV2, SDRComparison, IntegrationsTriple, DashboardShowcase, CustomDevelopment, FAQAccordion, FloatingCTA |
| `/tester-nos-agents` | Demo request form | TesterNosAgentsClient → CTAStaticForm |
| `/login` | Email/password authentication | LoginForm |

### Auth Pages (Public)

| Route | Purpose |
|-------|---------|
| `/auth/callback` | PKCE code exchange (route handler) |
| `/auth/confirm` | Hash-fragment token handler (invite/recovery/magiclink) |
| `/auth/error` | Auth error display |
| `/auth/reset-password` | Password reset request form |
| `/auth/update-password` | New password form (post-reset) |

### Dashboard (Authenticated)

All dashboard routes follow the pattern: Server Component (auth guard) → Client Component (React Query data fetching).

| Route | Title | Purpose | Admin Only |
|-------|-------|---------|------------|
| `/dashboard` | — | Redirects to `/dashboard/overview` | No |
| `/dashboard/overview` | Vue d'ensemble | Global KPIs, call volume, emotion distribution, latency, agent type comparison | No |
| `/dashboard/agents` | Agents | Agent deployment cards with metrics | No |
| `/dashboard/agents/[agentId]` | Agent Detail | Per-agent KPIs, charts, call list link | No |
| `/dashboard/agents/[agentId]/calls` | Historique des appels | Paginated call history for an agent | No |
| `/dashboard/agents/[agentId]/calls/[callId]` | Detail de l'appel | Full call detail with transcript, audio, metadata | No |
| `/dashboard/consumption` | Ma Consommation | Per-deployment consumption KPIs, charts, monthly comparison | No |
| `/dashboard/settings` | Parametres | Org profile, member management (invite/remove), improvement suggestions | Admin (edit) / All (view) |

### Special Routes

| Route | Type | Purpose |
|-------|------|---------|
| `/dashboard/@modal/(.)agents/[agentId]/calls/[callId]` | Intercepting parallel route | Shows call detail as modal overlay on client-side navigation |

---

## 4. User Roles & Access Control

### Role Model

Users belong to organizations via `user_org_memberships`. Roles are `admin` or `member`. All data is org-scoped via JWT `app_metadata.org_id`.

| Role | Dashboard | Agents/Calls | Consumption | Settings | Invite Users |
|------|-----------|-------------|-------------|----------|-------------|
| `member` | Own org data | Read-only | Read-only | View only | No |
| `admin` | Own org data | Read-only | Read-only | Edit org + members | Yes |

**Admin detection**: `user_org_memberships.role = 'admin'` checked via `is_org_admin()` SQL function or `checkIsAdmin()` in code.

### Route Protection Layers

1. **Middleware** (`middleware.ts`) — Redirects unauthenticated users from `/dashboard/*` to `/login`
2. **Dashboard layout** — Server-side `getUser()` check + admin flag for sidebar
3. **Page-level guards** — Individual pages also check auth (redundant with layout)
4. **Layout gates** — `/dashboard/clients/` layout returns `notFound()` for non-admins
5. **RPC enforcement** — Financial RPCs use `is_admin()` SQL function

### Auth Flows

**Login**: `/login` → `signInWithPassword()` → redirect to `/dashboard`

**Invitation/Recovery**: Email link → `AuthHashHandler` detects hash → `/auth/confirm` → `setSession()` → `/auth/update-password` or `/dashboard`

**PKCE**: Email link with `?code=` → `/auth/callback` → `exchangeCodeForSession()` → redirect

**Logout**: `signOut()` → redirect to `/login`

**Admin "View as User"**: Admins can impersonate any user via `viewAsUser` URL param. All queries route through that user's client permissions.

---

## 5. Database Schema (Summary)

> Full reference: `docs/DATABASE_REFERENCE.md`

### Entity Relationships

```
auth.users
  └─1:N─► user_client_permissions ◄─N:1─► clients
                                            └─1:N─► agent_deployments ◄─N:1─► agent_types
                                                      ├─1:N─► agent_calls
                                                      ├─1:N─► agent_sms
                                                      └─1:N─► agent_emails
```

### Core Tables

| Table | Purpose |
|-------|---------|
| `clients` | Customer companies |
| `agent_types` | Agent types: louis, arthur, alexandra |
| `agent_deployments` | Agent instances per client (with billing config) |
| `agent_calls` | Individual call records with costs, latency, transcript |
| `agent_sms` | SMS messages sent via agents |
| `agent_emails` | Email messages sent via agents |
| `user_client_permissions` | RLS: user → client access mapping |

### Key Views

| View | Purpose |
|------|---------|
| `v_agent_calls_enriched` | Calls with computed `answered` and `appointment_scheduled` booleans |
| `v_user_accessible_clients` | RLS-filtered clients for current user |
| `v_user_accessible_agents` | RLS-filtered agent deployments for current user |
| `v_financial_metrics_enriched` | Daily aggregated financial metrics (calls + SMS + emails + leasing) |

### Critical KPI Formulas

```sql
Answer Rate      = answered_calls / total_calls × 100
Conversion Rate  = appointments / ANSWERED_calls × 100  -- NOT total_calls!
Cost per RDV     = total_cost / appointments
```

**Pitfalls**:
- `metadata ? 'key'` checks key **existence**, not value — use `outcome = 'appointment_scheduled'`
- Conversion rate denominator is **answered_calls**, not total_calls
- Voicemail is NOT answered

### Outcome Values (lowercase)

`appointment_scheduled`, `appointment_refused`, `voicemail`, `not_interested`, `callback_requested`, `too_short`, `call_failed`, `no_answer`, `busy`, `not_available`, `invalid_number`, `do_not_call`, `error`, `canceled`, `rejected`

### Emotions

`positive`, `neutral`, `negative`, `unknown`

---

## 6. Feature Inventory

### Live Features

| Feature | Routes | Description |
|---------|--------|-------------|
| Landing page | `/` | Value proposition, SDR comparison, integrations, dashboard showcase, FAQ |
| Demo request | `/tester-nos-agents` | CTA form → n8n webhook |
| Authentication | `/login`, `/auth/*` | Email/password + email link (invite/recovery) |
| Overview dashboard | `/dashboard/overview` | Global KPIs, call volume chart, emotion distribution, latency trends, agent type comparison |
| Agent management | `/dashboard/agents`, `[agentId]` | Agent deployment cards, per-agent detail with KPIs/charts |
| Call history | `agents/[agentId]/calls`, `calls/[callId]` | Paginated call list, call detail with transcript + audio |
| Call detail modal | `@modal/(.)agents/...` | Intercepting route — modal overlay on client-side navigation |
| Consumption view | `/dashboard/consumption` | Per-deployment consumption KPIs, charts, monthly comparison |
| Settings | `/dashboard/settings` | Org profile, member management (invite/remove), improvement suggestions |
| Chatbot widget | Global (landing) | n8n webhook-powered chatbot with session persistence |
| URL-based filters | All dashboard pages | Date range, client, agent, agent type filters persisted in URL via nuqs |
| Admin view-as-user | Sidebar | Admins can impersonate any user to see their view |
| Agent tree sidebar | Dashboard sidebar | Collapsible company → agent hierarchy navigation |
| Lemlist tracking | Global | Visitor tracking pixel |

---

## 7. Component Hierarchy & Design System

### Component Structure

```
components/
├── landing/           # Landing page sections (server components)
│   ├── HeroHomeV2, HowItWorksV2, SDRComparison
│   ├── IntegrationsTriple, DashboardShowcase, CustomDevelopment
│   └── FAQAccordion, FloatingCTA
├── dashboard/         # Dashboard components (all client components)
│   ├── Charts/        # Recharts visualizations
│   ├── Cards/         # Agent deployment cards
│   ├── CallDetail/    # Shared call detail content + hook (used by page + modal)
│   ├── Filters/       # DateRangeFilter, AgentFilter
│   ├── Sidebar/       # AppSidebar, AgentTree, UserSwitcher
│   └── (shared)       # KPICard, KPIGrid, Modal, PageHeader, ExportCSVButton
├── skeletons/         # 7 skeleton loading components (Dashboard, AgentDetail, Agents, etc.)
├── motion/            # 6 animation primitives (FadeIn, SlideUp, SlideIn, ScaleIn, StaggerChildren, FadeInWhenVisible)
├── audio/             # AudioPlayer — shared player with seek, speed control, track selector
├── transcript/        # TranscriptDisplay — parser with speaker labels (Agent/Client bubbles)
├── shared/            # HeaderV2, Button, Card
├── ui/                # shadcn/ui primitives + cta-form/ (CTAFormCore shared extraction)
├── chatbot/           # ChatbotWidget + hooks (useChatbot, useWebhook, useSessionStorage)
├── auth/              # LoginForm, LogoutButton, AuthHashHandler
├── animations/        # RippleBackground, WaveBackground
├── providers/         # TanStack QueryClientProvider
└── tracking/          # LemlistTracker, ClientLemlistTracker
```

### Design Tokens

| Token | Value |
|-------|-------|
| Background | Dark gradient (black → purple-950/20 → black) |
| Cards | Glassmorphism (`bg-white/5`, `border-white/10`, `backdrop-blur-xl`) |
| Accent | Violet/Purple (`#8B5CF6`) |
| Agent: Louis | `#3B82F6` (Blue) |
| Agent: Arthur | `#FB923C` (Orange) |
| Agent: Alexandra | `#10B981` (Green) |
| Font | Inter (variable) |

> Full design system specification: [`DESIGN-SPEC.md`](DESIGN-SPEC.md) — tokens, animation primitives, glassmorphism tiers, Lighthouse baseline.

### UI Patterns

- **Glassmorphism cards**: `bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl`
- **Gradients**: `bg-gradient-to-br from-purple-500 to-purple-600`
- **Animations**: Motion (`motion/react-m`) for entrance animations, CSS `page-fade-in` for route transitions
- **Skeletons**: Dedicated skeleton components per route in `components/skeletons/`
- **Responsive**: Mobile-first with `sm:`, `md:`, `lg:` breakpoints
- **Dashboard page pattern**: Server Component (auth + Suspense) → Client Component (React Query)

---

## 8. External Integrations

| Service | Purpose | Config |
|---------|---------|--------|
| Supabase | Database, Auth, RLS | `.mcp.json`, env vars |
| n8n | Workflow automation, webhooks (CTA forms, chatbot) | `n8n.sablia.io` |
| Dipler | Voice AI engine | Via n8n workflows |
| Vercel | Hosting, analytics, preview deployments | Auto-deploy from `main` |
| GA4 | Analytics events | `NEXT_PUBLIC_GA_MEASUREMENT_ID` |
| Lemlist | Visitor tracking pixel | `ClientLemlistTracker` component |

---

## 9. Environment & Deployment

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...          # Server-only — API routes for org mutations
NEXT_PUBLIC_GA_MEASUREMENT_ID=...
NEXT_PUBLIC_CTA_WEBHOOK_URL=...
NEXT_PUBLIC_CHATBOT_WEBHOOK_URL=...
```

### Database Environments

| Environment | MCP Tools | Access |
|-------------|-----------|--------|
| Production | `mcp__supabase-vox__*` | Read-only |
| Staging | `mcp__supabase-staging__*` | Full access |

**Workflow**: Develop in staging → Generate migration → Brice executes in production.

### Deployment

- **Production**: Vercel (auto-deploy from `main`)
- **Preview**: Vercel preview deployments on PRs
- **Migrations**: `supabase/migrations/YYYYMMDD_description.sql` → Brice executes

---

## 10. User Flows

### Landing → Demo Request

```
/ (Landing) → Scroll → CTA "Tester nos agents" → /tester-nos-agents
  → Fill form (name, company, phone, email, agents, volume, industry)
  → Submit (n8n webhook: voipia_louis_from_site)
  → Success toast
```

### Login → Dashboard

```
/login → Email/password → Supabase Auth → /dashboard → /dashboard/overview
  → View global KPIs → Filter by date/client/agent type
  → Drill into /dashboard/agents/[id] for per-agent view
  → /dashboard/financial for admin cost analysis
```

### Dashboard Navigation

```
Sidebar:
  Platform
    ├── Vue d'ensemble     → /dashboard/overview
    ├── Agents             → /dashboard/agents
    └── Ma Conso           → /dashboard/consumption
  Mes Agents (AgentTree — collapsible company → agent hierarchy)
    └── [Company] → [Agent] → /dashboard/agents/[agentId]
  Footer
    ├── Parametres          → /dashboard/settings
    └── Deconnexion         → signOut → /login
```

### Call Detail Flow

```
/dashboard/agents/[agentId]/calls → Click call row
  → Modal overlay (intercepting route @modal)
  → OR direct URL → Full page /dashboard/agents/[agentId]/calls/[callId]
```

---

## 11. Known Tech Debt

> Full inventory: `docs/TECH_DEBT.md`

### Critical

- C3: **Unapplied migration** — `20260302_remove_leasing_prorata.sql` exists but is not applied.

### Medium

- M4: **No test coverage** — Vitest + RTL infrastructure exists but zero tests written.
- M10: **Two answered definitions in SQL** — `v_agent_calls_enriched` and `get_admin_calls_paginated` use different outcome exclusion lists.

All other critical/high/medium items have been resolved (Units 1-6). See `docs/TECH_DEBT.md` for full history.

---

## References

- `DESIGN-SPEC.md` — Design system specification (tokens, animation, UX flows, Lighthouse baseline)
- `PRD-saas.md` — Client-ready SaaS PRD (Phase 1+2 scope)
- `API-client-ready.md` — API routes reference for org mutations
- `docs/DATABASE_REFERENCE.md` — Complete database schema (documents v1 — v2 schema differs)
- `docs/ARCHITECTURE.md` — Code architecture and data flow
- `docs/TECH_DEBT.md` — Full tech debt inventory
- `docs/KNOWN_ISSUES.md` — Bug history and solutions
