# Architecture Reference — Sablia Vox

> Technical architecture, file structure, data flow, and code patterns. Last updated: 2026-04-13.

---

## 1. File Structure

```
sablia-vox/
├── app/                         # Next.js App Router
│   ├── layout.tsx               # Root layout (Inter font, providers, AuthHashHandler, Toaster)
│   ├── page.tsx                 # Landing page (/)
│   ├── providers.tsx            # TanStack QueryClient (1h stale time)
│   ├── globals.css              # Tailwind base + CSS variables + page-fade-in animation
│   ├── robots.ts                # Robots.txt config
│   ├── sitemap.ts               # Sitemap config
│   ├── api/org/                 # API routes — org mutations (admin-only, service_role)
│   ├── auth/                    # Auth routes (callback, confirm, error, reset, update)
│   ├── login/                   # Login page
│   ├── tester-nos-agents/       # Demo request page
│   └── dashboard/               # Dashboard (all authenticated)
│       ├── layout.tsx           # Auth guard + admin check + AppSidebar
│       ├── page.tsx             # Redirects to /overview
│       ├── overview/            # Global dashboard
│       ├── agents/              # Agent list + [agentId] detail + calls
│       ├── consumption/         # User consumption view
│       ├── settings/            # Org profile, member management, suggestions
│       └── @modal/              # Intercepting route for call detail modal
├── components/                  # React components
│   ├── landing/                 # Landing sections (server components)
│   ├── dashboard/               # Dashboard components (client components)
│   │   ├── Charts/              # Recharts visualizations
│   │   ├── Cards/               # Agent deployment cards
│   │   ├── CallDetail/          # Shared call detail content + hook (page + modal)
│   │   ├── Filters/             # DateRangeFilter, AgentFilter
│   │   └── Sidebar/             # AppSidebar, AgentTree, UserSwitcher
│   ├── skeletons/               # 7 skeleton loading components (per-route Suspense fallbacks)
│   ├── motion/                  # 6 animation primitives (FadeIn, SlideUp, SlideIn, ScaleIn, etc.)
│   ├── audio/                   # AudioPlayer — seek, speed control, track selector
│   ├── transcript/              # TranscriptDisplay — speaker labels, Agent/Client bubbles
│   ├── shared/                  # HeaderV2, Button, Card
│   ├── ui/                      # shadcn/ui + cta-form/ (CTAFormCore shared extraction)
│   ├── chatbot/                 # Chatbot widget + hooks
│   ├── auth/                    # LoginForm, LogoutButton, AuthHashHandler
│   ├── animations/              # RippleBackground, WaveBackground
│   ├── providers/               # TanStack QueryClientProvider
│   └── tracking/                # Lemlist tracker
├── lib/                         # Business logic layer
│   ├── supabase/                # Supabase clients (server.ts, client.ts, admin.ts)
│   ├── queries/                 # Data fetching functions (Supabase RPCs + table queries)
│   ├── hooks/                   # TanStack Query hooks + URL state parsers
│   ├── types/                   # TypeScript type definitions
│   ├── data/                    # Static data (FAQs, integrations)
│   ├── analytics/               # GA4 event helpers
│   ├── seo/                     # JSON-LD structured data
│   ├── api-auth.ts              # requireAdmin() auth guard + handleApiError()
│   ├── auth.ts                  # Server-side auth helpers (checkIsAdminServer, getOrgId)
│   ├── chart-config.ts          # Shared Recharts axis/tooltip/grid styling
│   ├── motion-tokens.ts         # JS mirror of CSS animation tokens (DESIGN-SPEC §2.5)
│   ├── utils.ts                 # General utilities (cn, CSV, formatting)
│   └── constants.ts             # App-wide constants
├── hooks/                       # Root-level hooks (useIsMobile — shadcn)
├── contexts/                    # React contexts (ChatbotContext)
├── types/                       # Root-level type declarations (chatbot, gtag)
├── test/                        # Test infrastructure (mocks, custom render)
├── public/                      # Static assets (logos, audio demos, favicons)
├── supabase/migrations/         # SQL migration files
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
| `queries/global.ts` | `hooks/useDashboardData.ts` | Overview, Agents, Agent Detail |
| `queries/louis.ts` | `hooks/useDashboardData.ts` | Agent Detail (Louis-specific) |
| `queries/consumption.ts` | `hooks/useUserConsumption.ts`, `hooks/useConsumptionCharts.ts` | Consumption |
| `queries/hierarchy.ts` | `hooks/useAgentHierarchy.ts` | Sidebar (AgentTree) |
| `queries/calls.ts` | (direct import) | Calls List, Call Detail |
| (inline RPC) | `hooks/useLatencyData.ts` | Overview, Agent Detail |

---

## 3. State Management

### URL State (nuqs)

All dashboard filters are persisted in URL query params. Three parser sets:

| Parser Set | File | Params | Used By |
|------------|------|--------|---------|
| `dashboardParsers` | `hooks/dashboardSearchParams.ts` | `startDate`, `endDate`, `deploymentId`, `agentTypeName` | Overview, Agents, Agent Detail, Consumption |

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

**Redirect param**: LoginForm reads `?redirect=` via `useSearchParams()` and validates with URL constructor to prevent open-redirect attacks.

### Auth Flows

| Flow | Entry Point | Mechanism | Destination |
|------|-------------|-----------|-------------|
| Password login | `/login` | `signInWithPassword()` | `/dashboard` (or `?redirect=` URL) |
| Magic link (invite) | Email link | `token_hash` → `/auth/confirm` → `verifyOtp()` | `/auth/update-password` → `/dashboard` |
| Password reset | Email link | `token_hash` → `/auth/confirm` → `verifyOtp()` | `/auth/update-password` → `/dashboard` |
| PKCE callback | Email link | `?code=` → `/auth/callback` → `exchangeCodeForSession()` | `/dashboard` |

**Key design decision**: Email templates use `{{ .TokenHash }}` (not `{{ .ConfirmationURL }}`) to route through the app directly, avoiding the `supabase.co` intermediate URL (better deliverability, corporate scanner protection).

### Admin Check (2 canonical implementations)

| Location | Method | Context |
|----------|--------|---------|
| `lib/auth.ts` → `checkIsAdminServer()` | Server client, creates own Supabase instance | Server Components, API routes |
| `lib/queries/global.ts` → `checkIsAdmin()` | Browser client, RLS-scoped | Client Components |

---

## 5. Component Patterns

### Dashboard Page Template

Every dashboard page follows:

```typescript
// page.tsx (Server Component)
import { DashboardSkeleton } from '@/components/skeletons'

export default async function Page() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <PageClient />
    </Suspense>
  )
}

// PageClient.tsx (Client Component)
'use client'
export function PageClient() {
  const { filters } = useDashboardFilters()
  const { data: kpis, isLoading } = useGlobalKPIs(filters)
  if (isLoading) return <DashboardSkeleton />
  return (
    <div className="animate-[page-fade-in_0.3s_ease-out]">
      <KPIGrid data={kpis} />
    </div>
  )
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
- Both render the same data via shared `CallDetailContent` component in `components/dashboard/CallDetail/`

---

## 7. Security Layers

| Layer | What it protects | How |
|-------|-----------------|-----|
| Middleware | All `/dashboard/*` routes | `getUser()` → redirect to `/login` |
| Dashboard layout | Dashboard subtree | `getUser()` + admin flag |
| API routes | `/api/org/*` mutations | `requireAdmin()` → service_role client |
| RLS policies | All table data | `auth.uid()` → `user_org_memberships` (org-scoped via JWT `app_metadata.org_id`) |
| Consumption RPCs | Margin data | Explicitly excludes `provider_cost`, `margin` for non-admins |

---

## 8. Design System

> Full specification: `DESIGN-SPEC.md`

### Motion Primitives (`components/motion/`)

6 animation components using `motion/react-m` (tree-shakeable, ~3KB):

| Component | Purpose |
|-----------|---------|
| `FadeIn` | Simple opacity entrance |
| `SlideUp` | Translate-Y + fade |
| `SlideIn` | Translate-X + fade (configurable direction) |
| `ScaleIn` | Scale + fade (for modals, cards) |
| `StaggerChildren` | Orchestrated child animations |
| `FadeInWhenVisible` | Viewport-triggered fade (intersection observer) |

JS tokens in `lib/motion-tokens.ts` mirror CSS animation tokens from `DESIGN-SPEC.md` §2.5.

### Glassmorphism Tiers

| Tier | Class | Usage |
|------|-------|-------|
| Surface | `bg-white/5 border-white/10` | Cards, containers |
| Elevated | `bg-white/8 border-white/15 backdrop-blur-xl` | Modals, popovers |
| Interactive | `hover:bg-white/10 transition-colors` | Clickable cards |

### Skeleton Loading (`components/skeletons/`)

7 dedicated skeleton components — one per dashboard route:
`DashboardSkeleton`, `AgentDetailSkeleton`, `AgentsGridSkeleton`, `CallDetailSkeleton`, `ConsumptionSkeleton`, `SettingsSkeleton`, `TableSkeleton`

Used as `<Suspense>` fallbacks and `isLoading` states. All use Tailwind `animate-pulse` with glassmorphism backgrounds.

### Page Transitions

CSS `page-fade-in` keyframe animation (defined in `globals.css`) applied to all dashboard route content wrappers:
```css
@keyframes page-fade-in { from { opacity: 0; translate: 0 4px; } to { opacity: 1; translate: 0 0; } }
```

---

## 9. Supabase Client Setup

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

### Admin Client (`lib/supabase/admin.ts`)

Used in API routes (`app/api/org/`) for mutations that bypass RLS (invite users, update org, manage members). Uses `SUPABASE_SERVICE_ROLE_KEY`.

**Important**: All data fetching (queries, RPCs) uses the **browser client**, not the server client. Server components only use the server client for `getUser()` auth checks. Admin client is used only in API routes for org mutations.

---

## 10. Config Files

| File | Purpose | Key Settings |
|------|---------|-------------|
| `next.config.ts` | Framework config | WebP/AVIF images, no powered-by header, compress: true |
| `tailwind.config.ts` | CSS framework (v4) | Agent colors, custom animations, CSS variables |
| `tsconfig.json` | TypeScript | Strict, `@/*` path alias, ES2017 target, bundler resolution |
| `biome.json` | Linter/formatter | 2-space indent, single quotes, no semicolons, 100 char width |
| `vitest.config.mts` | Test runner | jsdom environment, vite-tsconfig-paths |
| `components.json` | shadcn/ui | New York style, CSS variables |
| `DESIGN-SPEC.md` | Design system | Tokens, animation, UX flows, Lighthouse baseline |
