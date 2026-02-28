# PRD — Sablia Vox

> Single source of truth for the Sablia Vox platform. Last updated: 2026-02-06.

---

## 1. Product Vision & Target Audience

**Sablia Vox** is a B2B SaaS platform that deploys AI voice agents for automated lead follow-up and sales qualification.

**Core product — Louis**: An AI agent that instantly calls back new leads (<60 seconds), qualifies them via natural conversation, books appointments directly in client calendars, and sends confirmation SMS.

**Business model**: Monthly subscription + consumption-based billing (per minute/SMS).

**Target market**: French B2B companies needing automated lead follow-up without hiring SDRs — real estate, automotive, insurance, SaaS.

**Domain**: `vox.sablia.io`

---

## 2. Tech Stack & Architecture

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + Framer Motion |
| UI | shadcn/ui + custom components |
| Database | Supabase (PostgreSQL) |
| State | React Query (TanStack) |
| Auth | Supabase Auth |
| Voice AI | Dipler + n8n workflows |
| Analytics | Vercel Analytics + GA4 |
| Hosting | Vercel |
| URL State | nuqs |
| Notifications | sonner |

---

## 3. Route Map

### Public Pages

| Route | Purpose |
|-------|---------|
| `/` | Landing page — value proposition, how it works, FAQ |
| `/tester-nos-agents` | Demo request form |
| `/login` | Authentication (Supabase Auth) |

### Dashboard (Authenticated)

| Route | Purpose |
|-------|---------|
| `/dashboard` | Main dashboard overview |
| `/dashboard/agents` | Agent deployments list |
| `/dashboard/agents/[agentId]` | Agent detail + calls |
| `/dashboard/agents/[agentId]/calls` | Call history |
| `/dashboard/agents/[agentId]/calls/[callId]` | Call detail |
| `/dashboard/clients` | Client companies list |
| `/dashboard/clients/[clientId]` | Client detail |
| `/dashboard/financial` | Financial analytics (admin) |
| `/dashboard/consumption` | User consumption tracking |
| `/dashboard/admin/calls` | Admin calls explorer |
| `/dashboard/performance` | Performance analytics |

---

## 4. Database Schema & RLS

### Environments

| Environment | MCP Tools | Access |
|-------------|-----------|--------|
| Production | `mcp__supabase-vox__*` | Read-only |
| Staging | `mcp__supabase-staging__*` | Full access |

**Workflow**: Develop in staging → Generate migration → Brice executes in production.

### Core Tables

```
clients                    → Customer companies
  └── agent_deployments    → Agent instances per client
        └── agent_calls    → Individual call records

agent_types                → louis, arthur, alexandra
user_client_permissions    → RLS: who can see what
```

### Key Views

| View | Purpose |
|------|---------|
| `v_agent_calls_enriched` | Calls with calculated `answered` and `appointment_scheduled` booleans |
| `v_user_accessible_clients` | RLS-filtered clients |
| `v_user_accessible_agents` | RLS-filtered deployments |

### RPC Functions

| Function | Purpose |
|----------|---------|
| `get_kpi_metrics(start, end, client?, deployment?, agent_type?)` | Dashboard KPIs |
| `get_chart_data(...)` | Chart data (volume, outcomes, emotions) |
| `get_agent_type_cards_data(...)` | Aggregated metrics by agent type |
| `get_client_cards_data(...)` | Aggregated metrics by client |

### Critical KPI Formulas

```sql
Answer Rate      = answered_calls / total_calls × 100
Conversion Rate  = appointments / ANSWERED_calls × 100  -- NOT total_calls!
Cost per RDV     = total_cost / appointments
```

**Pitfalls**:
- `metadata ? 'key'` checks key existence, not value — use `outcome = 'appointment_scheduled'`
- Conversion rate denominator is **answered_calls**, not total_calls
- Voicemail is NOT answered (`outcome='voicemail'` → `answered=false`)

### Outcome Values (lowercase)

`appointment_scheduled`, `appointment_refused`, `voicemail`, `not_interested`, `callback_requested`, `too_short`, `call_failed`, `no_answer`, `busy`, `error`

### Emotions

`positive`, `neutral`, `negative`, `unknown`

**Full schema**: `docs/DATABASE_REFERENCE.md`

---

## 5. Component Hierarchy & Design System

### Component Structure

```
components/
├── landing/           # Landing page sections (home only)
│   ├── HeroHomeV2, HowItWorksV2, DashboardShowcase
│   ├── IntegrationsTriple, SDRComparison, CustomDevelopment
│   ├── FAQAccordion, FloatingCTA
├── dashboard/         # Dashboard components
│   ├── Charts/        # Recharts visualizations
│   ├── Cards/         # KPI and info cards
│   ├── Filters/       # Date, client, agent filters
│   ├── Financial/     # Financial dashboard
│   └── Sidebar/       # Navigation with AgentTree
├── shared/            # Shared (HeaderV2, Button, Card)
├── ui/                # shadcn/ui + custom UI
├── chatbot/           # Chatbot widget
├── auth/              # Auth components
└── tracking/          # Analytics tracking
```

### Design Tokens

| Token | Value |
|-------|-------|
| Background | Dark gradient (black → purple-950/20 → black) |
| Cards | Glassmorphism (`bg-white/5`, `border-white/10`) |
| Accent | Violet/Purple (`#8B5CF6`) |
| Agent: Louis | `#3B82F6` (Blue) |
| Agent: Arthur | `#FB923C` (Orange) |
| Agent: Alexandra | `#10B981` (Green) |
| Font | Inter (variable) |

### Patterns

- **Glassmorphism cards**: `bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl`
- **Gradients**: `bg-gradient-to-br from-purple-500 to-purple-600`
- **Animations**: Framer Motion for page transitions, hover effects, loading states
- **Responsive**: Mobile-first with `sm:`, `md:`, `lg:` breakpoints

---

## 6. External Integrations

| Service | Purpose | Config |
|---------|---------|--------|
| Supabase | Database, Auth, RLS | `.mcp.json`, env vars |
| n8n | Workflow automation, webhooks | `n8n.sablia.io` |
| Dipler | Voice AI engine | Via n8n workflows |
| Vercel | Hosting, analytics | Auto-deploy from main |
| GA4 | Analytics events | `NEXT_PUBLIC_GA_MEASUREMENT_ID` |
| Lemlist | Tracking pixel | `ClientLemlistTracker` component |

---

## 7. Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_GA_MEASUREMENT_ID=...
```

### Deployment

- **Production**: Vercel (auto-deploy from `main`)
- **Preview**: Vercel preview deployments on PRs
- **Migrations**: `supabase/migrations/YYYYMMDD_description.sql` → Brice executes

---

## 8. Feature Inventory

### Live Features

- Landing page with value proposition, comparisons, FAQ
- Demo request form (CTA → n8n webhook)
- Supabase Auth (email/password)
- Global dashboard with KPIs, charts, filters
- Agent-specific dashboards per deployment
- Client management with drill-down
- Financial analytics with cost breakdowns
- Admin calls explorer
- Performance analytics
- CSV export (calls, financial data)
- Chatbot widget
- URL-based filter state (nuqs)

### Deprecated/Removed (this audit)

- `/landingv2` route (duplicate of `/`)
- `/dashboard/agent/[deploymentId]` (replaced by `/dashboard/agents/[agentId]`)
- `components/sections/` (v1 landing)
- `LouisNestennDashboardClient` (dead component)
- ROI Calculator (`calculatorUtils.ts`, `types/calculator.ts`)
- PRPs directory

---

## 9. Known Issues & Tech Debt

### Active Tech Debt

1. **VoIPIA references in landing pages**: `SDRComparison.tsx`, `HowItWorksV2.tsx`, `IntegrationsTriple.tsx`, `FAQAccordion.tsx`, `DashboardShowcase.tsx` still reference "VoIPIA" in client-facing content. Requires business decision on text updates.
2. **VoIPIA references in CTA forms**: `CTAPopupForm.tsx`, `CTAStaticForm.tsx` use webhook URL with `voipia_louis_from_site` and mention "Co-Fondateur VoIPIA".
3. **VoIPIA in financial dashboard**: `ClientBreakdownTable.tsx` filters out "voipia" as internal client by name match.
4. **`package-lock.json`**: Still references `voipia-landing` on lines 2/8 — auto-fixes on `npm install`.
5. **Supabase migrations**: Historical references to "voipia" — preserved as-is (history).
6. **`any` types**: `lib/queries/dashboard.ts:157` uses `any` for Supabase join results (unavoidable without generated types).

### Resolved Issues (see `docs/KNOWN_ISSUES.md`)

1. RDV count incorrect (118 vs 13) — fixed via `outcome` field
2. Conversion rate > 100% — fixed denominator to answered_calls
3. Louis dashboard showing Arthur data — fixed with agent_type filter
4. Duplicate keys in filters — fixed with frontend deduplication

---

## 10. User Flows

### Landing → Demo Request

```
/ (Landing) → Scroll → CTA "Tester nos agents" → /tester-nos-agents
  → Fill form → Submit (n8n webhook) → Success message
  → Optional: Book meeting with Rémi
```

### Login → Dashboard

```
/login → Email/password → Supabase Auth → /dashboard
  → View global KPIs → Filter by date/client/agent
  → Drill into /dashboard/agents/[id] for per-agent view
  → /dashboard/financial for admin cost analysis
```

### Dashboard Navigation

```
Sidebar (AgentTree):
  → Clients grouped by company
    → Each client shows agent deployments
      → Click agent → /dashboard/agents/[agentId]
        → /dashboard/agents/[agentId]/calls → call history
          → /dashboard/agents/[agentId]/calls/[callId] → call detail
```

---

## References

- `docs/DATABASE_REFERENCE.md` — Complete database schema
- `docs/KNOWN_ISSUES.md` — Bug history and solutions
- `docs/MIGRATION_BEST_PRACTICES.md` — Migration guidelines
