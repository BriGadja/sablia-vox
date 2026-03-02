# Architecture Reference — Sablia Vox

> Technical architecture, file structure, data flow, and code patterns. Last updated: 2026-03-02.

---

## 1. File Structure

```
sablia-vox/
├── app/                         # Next.js App Router
│   ├── layout.tsx               # Root layout (Inter font, providers, AuthHashHandler, Toaster)
│   ├── page.tsx                 # Landing page (/)
│   ├── providers.tsx            # TanStack QueryClient (1h stale time)
│   ├── globals.css              # Tailwind base + CSS variables
│   ├── robots.ts                # Robots.txt config
│   ├── sitemap.ts               # Sitemap config
│   ├── auth/                    # Auth routes (callback, confirm, error, reset, update)
│   ├── login/                   # Login page
│   ├── tester-nos-agents/       # Demo request page
│   └── dashboard/               # Dashboard (all authenticated)
│       ├── layout.tsx           # Auth guard + admin check + AppSidebar
│       ├── page.tsx             # Redirects to /overview
│       ├── overview/            # Global dashboard
│       ├── agents/              # Agent list + [agentId] detail + calls
│       ├── clients/             # Client list + [clientId] detail (admin)
│       ├── financial/           # Financial dashboard (admin)
│       ├── consumption/         # User consumption view
│       ├── performance/         # Performance analytics
│       ├── admin/calls/         # Admin call explorer
│       ├── settings/            # Settings placeholder
│       └── @modal/              # Intercepting route for call detail modal
├── components/                  # React components
│   ├── landing/                 # Landing sections (server components)
│   ├── dashboard/               # Dashboard components (client components)
│   │   ├── Charts/              # Recharts visualizations
│   │   ├── Cards/               # Entity cards
│   │   ├── Filters/             # Date/client/agent filters
│   │   ├── Financial/           # Financial dashboard
│   │   ├── AdminCalls/          # Admin calls table
│   │   ├── Consumption/         # Consumption KPIs
│   │   └── Sidebar/             # AppSidebar, AgentTree, UserSwitcher
│   ├── shared/                  # HeaderV2, AudioPlayer, Button, Card
│   ├── ui/                      # shadcn/ui + CTAForms, ContactModal
│   ├── chatbot/                 # Chatbot widget + hooks
│   ├── auth/                    # LoginForm, LogoutButton, AuthHashHandler
│   ├── animations/              # FadeIn, RippleBackground, WaveBackground
│   └── tracking/                # Lemlist tracker
├── lib/                         # Business logic layer
│   ├── supabase/                # Supabase clients (server.ts, client.ts)
│   ├── queries/                 # Data fetching functions (Supabase RPCs + table queries)
│   ├── hooks/                   # TanStack Query hooks + URL state parsers
│   ├── types/                   # TypeScript type definitions
│   ├── data/                    # Static data (FAQs, integrations)
│   ├── analytics/               # GA4 event helpers
│   ├── seo/                     # JSON-LD structured data
│   ├── utils.ts                 # General utilities (cn, CSV, formatting)
│   └── constants.ts             # App-wide constants
├── hooks/                       # Root-level hooks (useIsMobile — shadcn)
├── contexts/                    # React contexts (ChatbotContext)
├── types/                       # Root-level type declarations (chatbot, gtag)
├── test/                        # Test infrastructure (mocks, custom render)
├── public/                      # Static assets (logos, audio demos, favicons)
├── supabase/migrations/         # 64 SQL migration files
├── docs/                        # Documentation
└── scripts/                     # Backup scripts
```

---

## 2. Data Flow Architecture

### Pattern: Server Auth → Client Data Fetching

Every dashboard page follows this pattern:

```
┌─────────────────────────────────┐
│ page.tsx (Server Component)     │
│  1. getUser() → auth check      │
│  2. <Suspense> wrapper          │
│  3. Render *Client component    │
└──────────────┬──────────────────┘
               │ props (userId, agentId, etc.)
               ▼
┌─────────────────────────────────┐
│ *Client.tsx (Client Component)  │
│  1. useDashboardFilters()       │  ← URL state (nuqs)
│  2. useGlobalKPIs(filters)      │  ← TanStack Query hook
│  3. Render KPIGrid, Charts      │
└──────────────┬──────────────────┘
               │ query function call
               ▼
┌─────────────────────────────────┐
│ lib/hooks/use*.ts               │
│  useQuery({                     │
│    queryKey: [...],             │
│    queryFn: () => fetchFn()     │  ← TanStack Query (1h stale)
│  })                             │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│ lib/queries/*.ts                │
│  supabase.rpc('get_*', params)  │  ← Supabase browser client
│  supabase.from('table').select  │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│ Supabase PostgreSQL             │
│  RLS enforced via auth.uid()    │
│  RPC functions with is_admin()  │
└─────────────────────────────────┘
```

### Query File → Hook → Page Mapping

| Query File | Hook File | Pages |
|------------|-----------|-------|
| `queries/global.ts` | `hooks/useDashboardData.ts` | Overview, Agents, Agent Detail, Client Detail, Performance |
| `queries/louis.ts` | `hooks/useDashboardData.ts` | Agent Detail (Louis-specific) |
| `queries/adminCalls.ts` | `hooks/useAdminCalls.ts` | Admin Calls |
| `queries/financial.ts` | `hooks/useFinancialData.ts` | Financial |
| `queries/consumption.ts` | `hooks/useUserConsumption.ts`, `hooks/useConsumptionCharts.ts` | Consumption |
| `queries/hierarchy.ts` | `hooks/useAgentHierarchy.ts` | Sidebar (AgentTree) |
| `queries/calls.ts` | (direct import) | Calls List, Call Detail |
| `queries/invoice.ts` | `hooks/useMonthlyInvoice.ts` | Financial (invoice tab) |
| (inline RPC) | `hooks/useLatencyData.ts` | Overview, Agent Detail |
| (RPC in hook) | `hooks/useViewAsUser.ts` | Sidebar (UserSwitcher) |

---

## 3. State Management

### URL State (nuqs)

All dashboard filters are persisted in URL query params. Three parser sets:

| Parser Set | File | Params | Used By |
|------------|------|--------|---------|
| `dashboardParsers` | `hooks/dashboardSearchParams.ts` | `startDate`, `endDate`, `clientIds`, `deploymentId`, `agentTypeName`, `viewAsUser` | Overview, Agents, Agent Detail, Clients, Performance, Consumption |
| `adminCallsParsers` | `hooks/adminCallsSearchParams.ts` | `startDate`, `endDate`, `clientIds`, `agentType`, `outcomes`, `emotion`, `direction`, `search`, `sortColumn`, `sortDirection`, `page`, `pageSize` | Admin Calls |
| `financialParsers` | `hooks/financialSearchParams.ts` | `startDate`, `endDate`, `clientId`, `agentTypeName`, `deploymentId`, `viewMode` | Financial |

### TanStack Query

- Global stale time: **1 hour** (set in `providers.tsx`)
- Financial data: **5 minutes**
- Admin calls: **1 minute**
- Agent hierarchy: **5 minutes**
- Cache keys are serialized filter objects (via `serializeQueryKey()`)

### Local State (useState)

Used sparingly for UI-only state:
- Pagination offsets (`CallsListClient`)
- Column visibility (`AdminCallsClient`)
- Modal open/closed state
- Search query text
- Sidebar expansion state (persisted to `localStorage`)

**Exception**: `UserConsumptionDashboardClient` stores dates in local `useState` instead of URL params — inconsistent with other pages.

---

## 4. Authentication System

### Files

| File | Purpose |
|------|---------|
| `middleware.ts` | Global route protection |
| `lib/supabase/server.ts` | Server-side Supabase client (SSR cookies) |
| `lib/supabase/client.ts` | Browser Supabase client |
| `components/auth/LoginForm.tsx` | Login form |
| `components/auth/LogoutButton.tsx` | Logout button |
| `components/auth/AuthHashHandler.tsx` | Hash-fragment token interceptor |

### Middleware Logic

```
Match: ALL routes except static assets
1. Create Supabase SSR client (cookie relay)
2. supabase.auth.getUser() — refreshes expired sessions
3. If /dashboard/* AND no user → redirect /login?redirect=<path>
4. If /login AND user exists → redirect /dashboard
```

**Note**: The `redirect` query param is set but never consumed by `LoginForm` — always redirects to `/dashboard`.

### Admin Check Implementations (3 versions — inconsistency)

| Location | Method | Uses userId | Uses RLS |
|----------|--------|------------|----------|
| `dashboard/layout.tsx` | Server client | Yes | No |
| `admin/calls/page.tsx` | Server client | Yes | No |
| `lib/queries/global.ts` | Browser client | No | Yes |

---

## 5. Component Patterns

### Dashboard Page Template

Every dashboard page follows:

```typescript
// page.tsx (Server Component)
export default async function Page() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <Suspense fallback={<Loading />}>
      <PageClient userId={user.id} />
    </Suspense>
  )
}

// PageClient.tsx (Client Component)
'use client'
export function PageClient({ userId }) {
  const { filters } = useDashboardFilters()
  const { data: kpis } = useGlobalKPIs(filters)
  return <KPIGrid data={kpis} />
}
```

### Most Reused Components

| Component | Used On |
|-----------|---------|
| `DateRangeFilter` | 8 pages |
| `KPIGrid` + `KPICard` | 4 pages |
| `CallVolumeChart` | 4 pages |
| `EmotionDistribution` | 4 pages |
| `PageHeader` | 8 pages |
| `OutcomeBreakdown` | 3 pages |
| `ClientAgentFilter` | 2 pages |
| `ExportCSVButton` | 2 pages |
| `AgentDeploymentCard` | 2 pages |

### Sidebar Navigation

```
SidebarConfig.ts defines nav items:
  Platform section (everyone):     Overview, Agents, Ma Conso
  Mes Agents section (AgentTree):  Dynamic company → agent tree
  Financier section (admin only):  Dashboard Financier
  Administration section (admin):  Historique Appels
  Footer:                          Settings, Logout
```

The `AgentTree` component fetches hierarchy via `useAgentHierarchy` hook → `get_company_agent_hierarchy` RPC. Expansion state persisted in `localStorage`.

---

## 6. Intercepting Route (Modal Pattern)

The call detail page uses Next.js parallel routes for a modal overlay:

```
app/dashboard/
├── @modal/
│   ├── default.tsx                    # Returns null (no modal active)
│   └── (.)agents/[agentId]/calls/[callId]/
│       └── page.tsx                   # Modal overlay (client navigation)
├── agents/[agentId]/calls/[callId]/
│   └── page.tsx                       # Full page (direct URL access)
└── layout.tsx                         # Renders {children} + {modal}
```

**Behavior**:
- Client-side navigation: Opens call detail as a modal overlay
- Direct URL / refresh: Shows full-page call detail
- Both render the same data, but `CallDetailModalContent` is near-duplicated from `CallDetailClient`

---

## 7. Security Layers

| Layer | What it protects | How |
|-------|-----------------|-----|
| Middleware | All `/dashboard/*` routes | `getUser()` → redirect to `/login` |
| Dashboard layout | Dashboard subtree | `getUser()` + admin flag |
| Clients layout | `/dashboard/clients/*` | Admin check → `notFound()` |
| Admin calls page | `/dashboard/admin/calls` | Admin check → redirect |
| Financial RPCs | Financial data | `is_admin()` SQL function |
| RLS policies | All table data | `auth.uid()` → `user_client_permissions` |
| Consumption RPCs | Margin data | Explicitly excludes `provider_cost`, `margin` for non-admins |

---

## 8. Supabase Client Setup

### Server Client (`lib/supabase/server.ts`)

Used in Server Components and Route Handlers. Creates client with `next/headers` cookie store.

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() { return cookieStore.getAll() },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options))
      },
    },
  })
}
```

### Browser Client (`lib/supabase/client.ts`)

Used in all `lib/queries/*` functions (called from client components).

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(url, anonKey)
}
```

**Important**: All data fetching (queries, RPCs) uses the **browser client**, not the server client. Server components only use the server client for `getUser()` auth checks.

---

## 9. Config Files

| File | Purpose | Key Settings |
|------|---------|-------------|
| `next.config.ts` | Framework config | WebP/AVIF images, no powered-by header, compress: true |
| `tailwind.config.ts` | CSS framework | Dark mode (class), agent colors, custom animations, CSS variables |
| `tsconfig.json` | TypeScript | Strict, `@/*` path alias, ES2017 target, bundler resolution |
| `biome.json` | Linter/formatter | 2-space indent, single quotes, no semicolons, 100 char width |
| `vitest.config.mts` | Test runner | jsdom environment, vite-tsconfig-paths |
| `components.json` | shadcn/ui | New York style, CSS variables |
| `.eslintrc.json` | Legacy linter | `next/core-web-vitals` — **should be removed (Biome is primary)** |
