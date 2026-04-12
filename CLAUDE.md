@/home/sablia/workspace/CLAUDE.md

# NOTE: .claude/rules/ and .claude/skills/ are symlinked to the hub workspace.
# Edits to these files from this repo will modify the shared originals.

# CLAUDE.md - Sablia Vox

**Voice AI Agent Platform** — `vox.sablia.io` | Full docs: [`PRD.md`](PRD.md)

## Quick Reference
| Key | Value |
|-----|-------|
| Domain | vox.sablia.io |
| Stack | Next.js 16 / React 19 / TypeScript / Supabase / shadcn/ui / Tailwind |
| Dev | `npm run dev` → http://localhost:3000 |
| Lint | `npm run lint` (Biome) |
| Format | `npm run format` (Biome) |
| Type-check | `npm run type-check` |
| Test | `npm test` (Vitest) |
| Build | `npm run build` |

## Critical Rules
1. ALWAYS use Server Components by default — add `'use client'` only when needed
2. NEVER use `any` type — define interfaces in `types/` or `lib/types/`
3. NEVER `pkill node` or `taskkill /IM node.exe` (kills Claude Code)
4. NEVER create files at project root (except config) — use `app/`, `components/`, `lib/`
5. Before starting dev server: check port 3000 is free, kill only the exact PID

## Architecture
- App Router: `app/` (layouts, pages, route handlers)
- Components: `components/` (shared) | `components/ui/` (shadcn)
- Lib: `lib/` (supabase clients, queries, hooks, utilities, types)
  - `lib/queries/` — Supabase data fetching functions
  - `lib/hooks/` — TanStack Query hooks + URL state parsers (main hooks directory)
  - `lib/types/` — TypeScript type definitions (dashboard, financial, consumption, etc.)
- Types: `types/` (root — only chatbot types and gtag declarations)
- Hooks: `hooks/` (root — only `useIsMobile` from shadcn)

## Code Patterns

### Supabase Server Client
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options))
        },
      },
    }
  )
}
```

### Dashboard Page Pattern
```typescript
// page.tsx (Server) — auth guard + Suspense wrapper
// *Client.tsx (Client) — useDashboardFilters() + useGlobalKPIs(filters) + render
// All data fetching via TanStack Query hooks in lib/hooks/
// All Supabase calls via browser client in lib/queries/
```

## Database

**Supabase project**: sablia-voice (v2) — `mgsfrhirsvqbyjagrswt`
| Resource | MCP Tools |
|----------|-----------|
| Production DB | `mcp__supabase-vox__*` |

### Data Access Pattern
All data fetching via 5 RPCs (org-scoped via JWT `app_metadata.org_id`):
- `get_dashboard_kpis(start, end, deployment?, template?)` → JSONB
- `get_call_volume_by_day(start, end, deployment?, template?)` → TABLE
- `get_outcome_distribution(start, end, deployment?, template?)` → TABLE
- `get_agent_cards_data(start?, end?, template?)` → TABLE
- `get_calls_page(start, end, deployment?, template?, outcome?, direction?, phone?, limit?, offset?)` → JSONB

3 views: `v_dashboard_calls`, `v_user_accessible_agents`, `v_agent_30d_stats`

### KPI Formulas (DO NOT GET WRONG)
```sql
Answer Rate      = answered_calls / total_calls × 100
Conversion Rate  = conversions / total_calls × 100
-- Conversions are template-type-aware:
--   setter: outcome = 'appointment_scheduled'
--   secretary: outcome IN ('info_provided', 'question_answered')
--   transfer: outcome = 'transferred'
```

### Auth
- Custom access token hook injects `org_id` into JWT from `user_org_memberships`
- `lib/auth.ts` → `getOrgId()` extracts org_id from session JWT
- RLS on all tables scopes data to user's org automatically

## Domain Reference
### Outcomes (20-value enum)
**Success**: `appointment_scheduled`, `transferred`, `info_provided`, `question_answered`
**Pending**: `callback_requested`
**Not reached**: `voicemail`, `no_answer`, `busy`, `too_short`, `not_available`
**Negative**: `not_interested`, `do_not_call`, `appointment_refused`, `rejected`
**Error**: `call_failed`, `invalid_number`, `error`, `canceled`, `spam`, `wrong_number`

### Template Types
- `setter` (Violet `#8B5CF6`) — appointment scheduling
- `secretary` (Blue `#3B82F6`) — reception/inquiry handling
- `transfer` (Orange `#FB923C`) — call transfer/redirection

### Emotions
`positive`, `neutral`, `negative`, `unknown`

### Design Tokens
- Background: Dark gradient (black → purple-950/20 → black)
- Cards: Glassmorphism (`bg-white/5`, `border-white/10`)
- Accent: Violet/Purple (`#8B5CF6`)

## Routes
### Public
`/` (landing), `/tester-nos-agents` (demo form), `/login`

### Auth
`/auth/callback`, `/auth/confirm`, `/auth/error`, `/auth/reset-password`, `/auth/update-password`

### Dashboard
`/dashboard` (→ redirects to overview), `/dashboard/overview`, `/dashboard/agents`, `/dashboard/agents/[agentId]`, `/dashboard/agents/[agentId]/calls`, `/dashboard/agents/[agentId]/calls/[callId]`, `/dashboard/settings`

## Testing
- Framework: Vitest + React Testing Library
- Co-locate tests: `component.test.tsx` next to `component.tsx`
- Mock Supabase: `vi.mock('@/lib/supabase/server')` + `test/mocks/supabase.ts`
- Run: `npm test` (unit) | `/e2e-test sablia-vox` (browser)

## Active Project: Client-Ready SaaS (vox-saas-master)

Master plan: `plans/vox-saas-master.md` (challenged GO, 2026-04-12)
PRD: `PRD-saas.md` (Phase 1+2 scope)

**6 units**: Tech Debt → Design System → Auth & Settings → Landing & Onboarding → Customer Success → Polish
**Next**: `/plan vox-saas-tech-debt` (Unit 1)

Key challenge fixes baked into plan:
- `inviteUserByEmail()` requires service_role API route (not anon key)
- `token_hash` email template for invite links (corporate scanner protection)
- Resend custom SMTP mandatory (Supabase built-in: 2 emails/hour)
- `user_metadata.onboarded_at` via `updateUser()` (cannot modify auth.users schema)
- INP < 200ms (FID deprecated), CSS-based page transitions (AnimatePresence exit broken in App Router)
- `improvement_suggestions` table must be created (doesn't exist in v2)

## Documentation
- [`PRD.md`](PRD.md) — Full product reference document (platform, dashboard, agents)
- [`PRD-saas.md`](PRD-saas.md) — Client-ready SaaS PRD (Phase 1+2: client readiness + customer success)
- [`docs/LANDING-PRD.md`](docs/LANDING-PRD.md) — Landing page redesign spec (public homepage)
- `docs/ARCHITECTURE.md` — Code architecture and data flow
- `docs/DATABASE_REFERENCE.md` — Complete database schema (NOTE: documents v1 — v2 schema differs, verify against live DB)
- `docs/TECH_DEBT.md` — Tech debt inventory (drives refactoring)
- `docs/KNOWN_ISSUES.md` — Bug history and solutions
