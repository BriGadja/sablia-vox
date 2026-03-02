# PRD — Sablia Vox

> Single source of truth for the Sablia Vox platform. Last updated: 2026-03-02.

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
- **Sablia team** (admin) — Full dashboard access, financial data, client management
- **Clients** (read-only) — View their own agent performance and consumption data

---

## 2. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.x |
| Language | TypeScript | 5.x |
| Runtime | React | 19.x |
| Styling | Tailwind CSS | 3.4.x |
| Animations | Framer Motion | 11.x |
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
| `/dashboard/clients` | Clients | Client company cards with metrics | Yes (layout gate) |
| `/dashboard/clients/[clientId]` | Detail Client | Per-client KPIs, charts, agent cards | Yes |
| `/dashboard/financial` | Dashboard Financier | Leasing/consumption toggle, revenue/cost/margin, invoices, client breakdown | Yes (RPC-enforced) |
| `/dashboard/consumption` | Ma Consommation | User's consumption KPIs, charts, monthly comparison (no margin data) | No |
| `/dashboard/performance` | Performance | Advanced analytics, top clients, agent type comparison | No |
| `/dashboard/admin/calls` | Historique Appels (Admin) | Full call browser with filters, pagination, CSV export, transcript modal | Yes (explicit gate) |
| `/dashboard/settings` | Parametres | Placeholder — no functionality implemented | No |

### Special Routes

| Route | Type | Purpose |
|-------|------|---------|
| `/dashboard/@modal/(.)agents/[agentId]/calls/[callId]` | Intercepting parallel route | Shows call detail as modal overlay on client-side navigation |

---

## 4. User Roles & Access Control

### Role Model

Roles are stored in `user_client_permissions` table. A user can have permissions for multiple clients.

| Permission Level | Dashboard | Client Data | Financial | Admin Features |
|-----------------|-----------|-------------|-----------|---------------|
| `read` | Own clients' data | Read-only | No | No |
| `admin` | All data | All clients | Yes | Yes (calls, view-as-user) |

**Admin detection**: Any `user_client_permissions` row with `permission_level = 'admin'` for the user.

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
| Client management | `/dashboard/clients`, `[clientId]` | Admin-only client list and detail with drill-down |
| Financial dashboard | `/dashboard/financial` | Leasing/consumption toggle, revenue/cost/margin, invoices, client breakdown, drill-down modals |
| Consumption view | `/dashboard/consumption` | User-facing consumption KPIs and charts (no margin data) |
| Performance analytics | `/dashboard/performance` | Top clients, agent type comparison, advanced KPIs |
| Admin calls explorer | `/dashboard/admin/calls` | Full call browser with filters, sort, pagination, CSV export, transcript modal |
| CSV export | Overview, Performance, Admin Calls | Export filtered call data to CSV |
| Chatbot widget | Global (landing) | n8n webhook-powered chatbot with session persistence |
| URL-based filters | All dashboard pages | Date range, client, agent, agent type filters persisted in URL via nuqs |
| Admin view-as-user | Sidebar | Admins can impersonate any user to see their view |
| Agent tree sidebar | Dashboard sidebar | Collapsible company → agent hierarchy navigation |
| Lemlist tracking | Global | Visitor tracking pixel |

### Not Implemented

| Feature | Route | Status |
|---------|-------|--------|
| Settings | `/dashboard/settings` | Placeholder UI only — no functionality |

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
│   ├── Charts/        # Recharts visualizations (16 files)
│   ├── Cards/         # Agent, client, agent type cards
│   ├── Filters/       # DateRangeFilter, ClientAgentFilter
│   ├── Financial/     # Financial dashboard (KPI grids, charts, tables, modals)
│   ├── AdminCalls/    # Admin calls table, filters, transcript modal
│   ├── Consumption/   # Consumption KPI grid
│   ├── Sidebar/       # AppSidebar, AgentTree, UserSwitcher
│   └── (shared)       # KPICard, KPIGrid, Modal, PageHeader, ExportCSVButton
├── shared/            # HeaderV2, AudioPlayer, Button, Card
├── ui/                # shadcn/ui primitives + CTAPopupForm, CTAStaticForm, ContactModal
├── chatbot/           # ChatbotWidget + hooks (useChatbot, useWebhook, useSessionStorage)
├── auth/              # LoginForm, LogoutButton, AuthHashHandler
├── animations/        # FadeIn, RippleBackground, WaveBackground
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

### UI Patterns

- **Glassmorphism cards**: `bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl`
- **Gradients**: `bg-gradient-to-br from-purple-500 to-purple-600`
- **Animations**: Framer Motion for page transitions, hover effects, loading states
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
NEXT_PUBLIC_GA_MEASUREMENT_ID=...
```

No `SUPABASE_SERVICE_ROLE_KEY` — all auth runs through anon key with RLS.

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
  Financier (admin only)
    └── Dashboard Financier → /dashboard/financial
  Administration (admin only)
    └── Historique Appels   → /dashboard/admin/calls
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

1. **AgentTree sidebar links to dead route** — Links to `/dashboard/agent/[id]` (singular) instead of `/dashboard/agents/[id]` (plural). Sidebar agent navigation is entirely broken.
2. **ESLint + Biome dual config** — `.eslintrc.json` still exists alongside Biome. Two linters, conflicting configs.
3. **react-query-devtools in production deps** — Ships DevTools panel to production bundle.
4. **Hardcoded webhook URLs** — CTA forms hardcode `voipia_louis_from_site` n8n webhook URL.

### High

5. **VoIPIA references** — Landing page content, CTA forms, financial filters still reference "VoIPIA".
6. **Duplicate CTA forms** — `CTAPopupForm.tsx` (484 lines) and `CTAStaticForm.tsx` (404 lines) are near-identical.
7. **Duplicate ConsumptionKPIGrid** — Two components with same name in `Financial/` and `Consumption/`, different types.
8. **Financial page has no admin gate** — Relies solely on RPC enforcement; non-admins see empty UI.
9. **Inconsistent admin check** — Three different implementations of `checkIsAdmin()`.

### Medium

10. **~13 dead files/exports** — Components, charts, queries that are never imported.
11. **Systemic `any` types in Recharts** — ~20 instances across chart components.
12. **No test coverage** — Test infrastructure exists but zero tests written.
13. **Stale sitemap/robots** — Reference removed routes.

---

## References

- `docs/DATABASE_REFERENCE.md` — Complete database schema
- `docs/ARCHITECTURE.md` — Code architecture and data flow
- `docs/TECH_DEBT.md` — Full tech debt inventory
- `docs/KNOWN_ISSUES.md` — Bug history and solutions
- `docs/MIGRATION_BEST_PRACTICES.md` — Migration guidelines
