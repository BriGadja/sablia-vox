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
2. NEVER use `any` type — define interfaces in `types/`
3. NEVER `pkill node` or `taskkill /IM node.exe` (kills Claude Code)
4. NEVER create files at project root (except config) — use `app/`, `components/`, `lib/`
5. Before starting dev server: check port 3000 is free, kill only the exact PID

## Architecture
- App Router: `app/` (layouts, pages, route handlers)
- Components: `components/` (shared) | `components/ui/` (shadcn)
- Lib: `lib/` (supabase clients, queries, utilities)
- Types: `types/` (shared TypeScript interfaces)
- Hooks: `hooks/` (custom React hooks)

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

### Data Fetching (Server Component)
```typescript
import { createClient } from '@/lib/supabase/server'

export default async function Page() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('calls').select('*').order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return <div>{/* render data */}</div>
}
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
`appointment_scheduled`, `appointment_refused`, `voicemail`, `not_interested`, `callback_requested`, `too_short`, `call_failed`, `no_answer`, `busy`, `error`

### Design Tokens
- Background: Dark gradient (black → purple-950/20 → black)
- Cards: Glassmorphism (`bg-white/5`, `border-white/10`)
- Accent: Violet/Purple (`#8B5CF6`)

## Routes
### Public
`/` (landing), `/tester-nos-agents` (demo form), `/login`

### Dashboard
`/dashboard`, `/dashboard/agents`, `/dashboard/agents/[agentId]`, `/dashboard/clients`, `/dashboard/clients/[clientId]`, `/dashboard/financial`, `/dashboard/consumption`, `/dashboard/admin/calls`, `/dashboard/performance`

## Testing
- Framework: Vitest + React Testing Library
- Co-locate tests: `component.test.tsx` next to `component.tsx`
- Mock Supabase: `vi.mock('@/lib/supabase/server')` + `test/mocks/supabase.ts`
- Run: `npm test` (unit) | `/e2e-test sablia-vox` (browser)

## Documentation
- [`PRD.md`](PRD.md) — Full product reference document
- `docs/DATABASE_REFERENCE.md` — Complete database schema
- `docs/KNOWN_ISSUES.md` — Bug history and solutions
