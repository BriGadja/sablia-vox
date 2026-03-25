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
| Environment | MCP Tools | Access |
|-------------|-----------|--------|
| Production | `mcp__supabase-vox__*` | Read-only |
| Staging | `mcp__supabase-staging__*` | Full access |

### KPI Formulas (DO NOT GET WRONG)
```sql
Answer Rate      = answered_calls / total_calls × 100
Conversion Rate  = appointments / ANSWERED_calls × 100  -- NOT total_calls!
Cost per RDV     = total_cost / appointments
```

### Pitfalls
- `metadata ? 'key'` checks key **existence**, not value → use `outcome = 'appointment_scheduled'`
- Conversion rate denominator is **answered_calls**, not total_calls
- Voicemail is NOT answered

## Domain Reference
### Outcomes (lowercase)
`appointment_scheduled`, `appointment_refused`, `voicemail`, `not_interested`, `callback_requested`, `too_short`, `call_failed`, `no_answer`, `busy`, `not_available`, `invalid_number`, `do_not_call`, `error`, `canceled`, `rejected`

### Emotions
`positive`, `neutral`, `negative`, `unknown`

### Design Tokens
- Background: Dark gradient (black → purple-950/20 → black)
- Cards: Glassmorphism (`bg-white/5`, `border-white/10`)
- Accent: Violet/Purple (`#8B5CF6`)
- Agent Louis: `#3B82F6` (Blue)
- Agent Arthur: `#FB923C` (Orange)
- Agent Alexandra: `#10B981` (Green)

## Routes
### Public
`/` (landing), `/tester-nos-agents` (demo form), `/login`

### Auth
`/auth/callback`, `/auth/confirm`, `/auth/error`, `/auth/reset-password`, `/auth/update-password`

### Dashboard
`/dashboard` (→ redirects to overview), `/dashboard/overview`, `/dashboard/agents`, `/dashboard/agents/[agentId]`, `/dashboard/agents/[agentId]/calls`, `/dashboard/agents/[agentId]/calls/[callId]`, `/dashboard/clients` (admin), `/dashboard/clients/[clientId]` (admin), `/dashboard/financial` (admin), `/dashboard/consumption`, `/dashboard/admin/calls` (admin), `/dashboard/performance`, `/dashboard/settings` (placeholder)

## Testing
- Framework: Vitest + React Testing Library
- Co-locate tests: `component.test.tsx` next to `component.tsx`
- Mock Supabase: `vi.mock('@/lib/supabase/server')` + `test/mocks/supabase.ts`
- Run: `npm test` (unit) | `/e2e-test sablia-vox` (browser)

## Documentation
- [`PRD.md`](PRD.md) — Full product reference document
- `docs/ARCHITECTURE.md` — Code architecture and data flow
- `docs/DATABASE_REFERENCE.md` — Complete database schema
- `docs/TECH_DEBT.md` — Tech debt inventory (drives refactoring)
- `docs/KNOWN_ISSUES.md` — Bug history and solutions
