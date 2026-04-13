# Sablia Vox — Customer Success Features Plan

## Executive Summary

Unit 5 of vox-saas-master. Builds the customer-facing features that demonstrate ongoing value: polished audio player with track/speed controls, transcript display with parsed speaker labels, per-agent consumption dashboard with Supabase RPC, quality trend chart, and improvement suggestions section. All new UI uses the motion primitives from DESIGN-SPEC (created as Phase A prerequisite since `components/motion/` is currently empty).

**Master plan**: `plans/vox-saas-master.md` (challenged GO, 2026-04-12)
**PRD**: `projects/internal/websites/sablia-vox/PRD-saas.md` (US-12 through US-17)
**Design spec**: `projects/internal/websites/sablia-vox/DESIGN-SPEC.md`
**Research**: `research/plan/2026-04-13-vox-saas-customer-success.md`

**Confidence**: 8/10 — all DB tables exist and have RLS, data patterns verified, clear specs. Risk: recording URL format inconsistency (partial vs pre-signed) and empty improvement_suggestions table (display-only).

## Phase Status
| Phase | Name | Tasks |
|-------|------|-------|
| A | Motion Primitives | 3 |
| B | Audio Player & Transcript | 5 |
| C | Consumption Dashboard | 5 |
| D | Quality Trend & Suggestions | 4 |
| E | Integration & Validation | 3 |

---

## Phase A: Motion Primitives

Skill: `/execute` (direct implementation)

Creates the 6 animation primitives specified in DESIGN-SPEC §2.5. These are consumed by all subsequent phases.

### Tasks
- [x] A1: Create `FadeIn`, `SlideUp`, `SlideIn`, `ScaleIn` primitives in `components/motion/` — each as a separate file using `import * as m from 'motion/react-m'` (tree-shakeable, namespace import). Import tokens from `lib/motion-tokens.ts`. All must be `'use client'`, hydration-safe (initial state matches SSR), GPU-only properties (transform + opacity)
- [x] A2: Create `StaggerChildren` (container + item pattern) and `FadeInWhenVisible` (intersection observer via `whileInView`) primitives. StaggerChildren uses `stagger.default` (0.05s = 50ms). FadeInWhenVisible uses `viewport={{ once: true, margin: '-80px' }}`. Note: verify `whileInView` works with `domAnimation` feature set during implementation — if it requires `domMax`, use conditional import or fallback to CSS-based intersection observer
- [x] A3: Create barrel export `components/motion/index.ts` and verify all 6 primitives import cleanly. Run `npm run type-check` to confirm no type errors

### Technical Details

**FadeIn** (`components/motion/fade-in.tsx`):
```typescript
'use client'
import * as m from 'motion/react-m'
import { duration, ease } from '@/lib/motion-tokens'

interface FadeInProps {
  children: React.ReactNode
  delay?: number
  duration?: number
  className?: string
}

export function FadeIn({ children, delay = 0, duration: dur = duration.normal, className }: FadeInProps) {
  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: dur, delay, ease: ease.default }}
      className={className}
    >
      {children}
    </m.div>
  )
}
```

**SlideUp**: `initial={{ opacity: 0, y: 16 }}`, `animate={{ opacity: 1, y: 0 }}`
**SlideIn**: `direction` prop → `x: direction === 'left' ? -24 : 24` → `x: 0`
**ScaleIn**: `initial={{ opacity: 0, scale: 0.9 }}` with `scale` prop override
**StaggerChildren**: Container with `staggerChildren` in `transition.staggerChildren`, children wrapped in `m.div` with slide-up variant
**FadeInWhenVisible**: `whileInView` instead of `animate`, `viewport={{ once: true, margin: '-80px' }}`

**Import pattern**: New primitives use `import * as m from 'motion/react-m'` (tree-shakeable namespace import — NOT `import { m }`). `m.div`, `m.span`, etc. Existing code still uses `motion` from `motion/react` — migration is Unit 6 scope.

**LazyMotion dependency**: `m` components from `motion/react-m` require a `LazyMotion` ancestor to render animations. `MotionProvider` (in `components/providers/motion-provider.tsx`) wraps the entire app via `app/providers.tsx` → `app/layout.tsx`, so all dashboard routes are covered. If any Unit 5 primitive is ever used outside this tree (e.g., in a standalone page), it must be wrapped in its own `LazyMotion`.

### Verification Constraints
| Type | Target | Assertion | Method |
|------|--------|-----------|--------|
| file-exists | components/motion/fade-in.tsx | FadeIn primitive exists | `test -f projects/internal/websites/sablia-vox/components/motion/fade-in.tsx` |
| count-check | components/motion/ | 7 files (6 primitives + index.ts) | `[ $(ls projects/internal/websites/sablia-vox/components/motion/*.tsx projects/internal/websites/sablia-vox/components/motion/*.ts 2>/dev/null | wc -l) -eq 7 ]` |
| contains | components/motion/index.ts | Exports all 6 primitives | `grep -c 'export' projects/internal/websites/sablia-vox/components/motion/index.ts | grep -q '[6-9]'` |

---

## Phase B: Audio Player & Transcript

Skill: `/frontend-design` or `/execute` (direct implementation)

Extracts AudioPlayer to shared component with polished controls, creates TranscriptDisplay with speaker label parsing. Addresses US-12 and US-13.

### Tasks
- [x] B1: Extract `AudioPlayer` from `CallDetailClient.tsx` and `CallDetailModalContent.tsx` into `components/audio/AudioPlayer.tsx`. Add: clickable seek bar (click to position), playback speed selector (0.75x/1x/1.25x/1.5x/2x), skeleton loading state (shimmer bar while audio loads). Keep the existing glassmorphism styling but use design tokens
- [x] B2: Add track selector dropdown to AudioPlayer — options: Merged (default), User Mic, VAD, Iris. Derive track URLs from base recording URL by replacing `merged_` prefix with `user_mic_`, `vad_`, `iris_`. Handle missing tracks gracefully (fallback to merged if other tracks 404). Add URL validation — if recording_url is a partial path (no `://`), show "Enregistrement indisponible" fallback instead of silent failure
- [x] B3: Create `components/transcript/TranscriptDisplay.tsx` — parse `User :` / `Model :` speaker pattern from transcript text. Strip XML tags (`<lang="fr-FR"/>`, `<pausing />`, `<force />`), filter tool call lines (`(tool call) ...`), group consecutive same-speaker lines. Render as chat-bubble style with speaker labels ("Agent" / "Client") and alternating alignment
- [x] B4: Integrate AudioPlayer and TranscriptDisplay into `CallDetailClient.tsx` — replace inline AudioPlayer, add transcript section below audio. Wrap both in `FadeIn` motion primitive. Add skeleton states for loading
- [x] B5: Update `CallDetailModalContent.tsx` to use shared AudioPlayer component (same extraction as B4 but for the modal intercept route)

### Technical Details

**Transcript parsing** (verified against real DB data):
```typescript
interface TranscriptTurn {
  speaker: 'agent' | 'client'
  text: string
}

function parseTranscript(raw: string): TranscriptTurn[] {
  const lines = raw.split('\n')
  const turns: TranscriptTurn[] = []
  
  for (const line of lines) {
    const match = line.match(/^(User|Model)\s*:\s*(.*)$/)
    if (!match) continue
    
    const speaker = match[1] === 'User' ? 'client' : 'agent'
    let text = match[2]
      .replace(/<[^>]*\/?>/g, '')           // XML tags
      .replace(/\(tool call\)\s*\w+\s*\{[^}]*\}/g, '') // tool calls
      .trim()
    
    if (!text) continue // skip empty lines (tag-only or tool-call-only)
    
    // Group consecutive same-speaker lines
    const last = turns[turns.length - 1]
    if (last && last.speaker === speaker) {
      last.text += ' ' + text
    } else {
      turns.push({ speaker, text })
    }
  }
  return turns
}
```

**Recording URL handling**:
- Pre-signed S3 URLs (`https://dipler-recordings...`): play directly
- Partial paths (no `://`): show fallback state "Enregistrement indisponible — lien expiré"
- Track URL derivation: replace `merged_` → `user_mic_` / `vad_` / `iris_` in the filename portion

**AudioPlayer props**:
```typescript
interface AudioPlayerProps {
  url: string
  className?: string
}
```

### Verification Constraints
| Type | Target | Assertion | Method |
|------|--------|-----------|--------|
| file-exists | components/audio/AudioPlayer.tsx | Shared audio player exists | `test -f projects/internal/websites/sablia-vox/components/audio/AudioPlayer.tsx` |
| file-exists | components/transcript/TranscriptDisplay.tsx | Transcript component exists | `test -f projects/internal/websites/sablia-vox/components/transcript/TranscriptDisplay.tsx` |
| contains | CallDetailClient.tsx | Uses shared AudioPlayer import | `grep -q "from '@/components/audio/AudioPlayer'" projects/internal/websites/sablia-vox/app/dashboard/agents/\[agentId\]/calls/\[callId\]/CallDetailClient.tsx` |
| contains | CallDetailModalContent.tsx | Uses shared AudioPlayer import | `grep -q "from '@/components/audio/AudioPlayer'" projects/internal/websites/sablia-vox/app/dashboard/@modal/\(.\)agents/\[agentId\]/calls/\[callId\]/CallDetailModalContent.tsx` |

---

## Phase C: Consumption Dashboard

Skill: `/execute` (direct implementation)

Creates the consumption page from scratch — Supabase RPC, query, hook, types, route, and UI. Addresses US-16 and US-17.

### Tasks
- [ ] C1: Create Supabase migration for `get_consumption_metrics(p_start_date, p_end_date)` RPC. Aggregates per-deployment: call count, total minutes (from `calls.duration_seconds`), billed call cost (from `call_costs.billed_cost`), SMS count + cost (from `sms`). Returns JSONB with `by_deployment` array + `totals`. Org-scoped via JWT `app_metadata.org_id`. Apply migration via `mcp__supabase-sablia__apply_migration` with `project_id: mgsfrhirsvqbyjagrswt` (sablia-voice v2). Also add indexes: `calls(deployment_id, started_at)` and `sms(deployment_id, sent_at)` for RPC performance
- [ ] C2: Create `lib/types/consumption.ts` (types), `lib/queries/consumption.ts` (query wrapper calling the RPC), `lib/hooks/useConsumptionData.ts` (TanStack Query hook — match existing `staleTime` and `refetchInterval` from `useDashboardData.ts`). Follow existing patterns from `lib/queries/global.ts` and `lib/hooks/useDashboardData.ts`
- [ ] C3: Create consumption page route `app/dashboard/consumption/page.tsx` (server component, auth guard) + `app/dashboard/consumption/ConsumptionClient.tsx` (client component). Use nuqs for `startDate` / `endDate` URL params (default: current month). Follow the existing dashboard page pattern: `createLoader` from `nuqs/server` for server-side param parsing in `page.tsx` (see `lib/hooks/dashboardSearchParams.ts` for reference), `useQueryStates` from `nuqs` for client-side state in `ConsumptionClient.tsx`
- [ ] C4: Build consumption UI — per-agent cards with animated progress bars (minutes used / 100 included), overage calculation, SMS count + cost. Total section at bottom: `(agents × €300) + overage + SMS`. Use `StaggerChildren` for agent card list, `FadeIn` for totals. Glassmorphism cards matching design spec
- [ ] C5: Add "Consommation" link to sidebar navigation in `SidebarConfig` under the `Gestion` group (match existing casing — not GESTION). Verify non-admin users can see it (consumption is for all users per DESIGN-SPEC §1.1)

### Technical Details

**RPC signature** (adapted from research — simplified):
```sql
CREATE OR REPLACE FUNCTION public.get_consumption_metrics(
  p_start_date date,
  p_end_date   date
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_org_id uuid;
BEGIN
  v_org_id := ((auth.jwt() -> 'app_metadata' ->> 'org_id'))::uuid;
  
  RETURN jsonb_build_object(
    'period', jsonb_build_object('start', p_start_date, 'end', p_end_date),
    'by_deployment', (
      SELECT COALESCE(jsonb_agg(row_data ORDER BY row_data->>'agent_name'), '[]'::jsonb)
      FROM (
        SELECT jsonb_build_object(
          'deployment_id', d.id,
          'agent_name', d.name,
          'template_type', at2.type,
          'call_count', COALESCE(ca.call_count, 0),
          'total_seconds', COALESCE(ca.total_seconds, 0),
          'total_minutes', ROUND(COALESCE(ca.total_seconds, 0)::numeric / 60.0, 2),
          'billed_call_cost', COALESCE(ca.billed_call_cost, 0),
          'sms_count', COALESCE(sa.sms_count, 0),
          'sms_cost', COALESCE(sa.sms_cost, 0),
          'cost_per_min', d.cost_per_min,
          'cost_per_sms', d.cost_per_sms
        ) AS row_data
        FROM agent_deployments d
        JOIN agent_templates at2 ON at2.id = d.template_id
        LEFT JOIN LATERAL (
          SELECT
            COUNT(c.id) AS call_count,
            COALESCE(SUM(c.duration_seconds), 0) AS total_seconds,
            COALESCE(SUM(cc.billed_cost), 0) AS billed_call_cost
          FROM calls c
          LEFT JOIN call_costs cc ON cc.call_id = c.id
          WHERE c.deployment_id = d.id
            AND c.started_at::date BETWEEN p_start_date AND p_end_date
        ) ca ON true
        LEFT JOIN LATERAL (
          SELECT
            COUNT(s.id) AS sms_count,
            COALESCE(SUM(s.cost), 0) AS sms_cost
          FROM sms s
          WHERE s.deployment_id = d.id
            AND s.sent_at::date BETWEEN p_start_date AND p_end_date
        ) sa ON true
        WHERE d.org_id = v_org_id
          AND d.status = 'active'
      ) sub
    )
  );
END;
$$;
```

**TypeScript types** (`lib/types/consumption.ts`):
```typescript
export interface DeploymentConsumption {
  deployment_id: string
  agent_name: string
  template_type: string
  call_count: number
  total_seconds: number
  total_minutes: number
  billed_call_cost: number
  sms_count: number
  sms_cost: number
  cost_per_min: number | null
  cost_per_sms: number | null
}

export interface ConsumptionMetrics {
  period: { start: string; end: string }
  by_deployment: DeploymentConsumption[]
}

export interface ConsumptionFilters {
  startDate: string  // YYYY-MM-DD
  endDate: string    // YYYY-MM-DD
}
```

**Billing constants** (display-side, not in RPC):
```typescript
const MONTHLY_BASE_PER_AGENT = 300    // EUR
const INCLUDED_MINUTES = 100           // per agent
const OVERAGE_RATE = 0.27             // EUR/min
const SMS_RATE = 0.14                 // EUR/SMS (fallback if cost_per_sms null)
```

**nuqs URL state** pattern (matching existing `useDashboardFilters`):
```typescript
import { parseAsString, useQueryStates } from 'nuqs'

const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10)

const [filters, setFilters] = useQueryStates({
  startDate: parseAsString.withDefault(startOfMonth),
  endDate: parseAsString.withDefault(endOfMonth),
})
```

### Verification Constraints
| Type | Target | Assertion | Method |
|------|--------|-----------|--------|
| file-exists | consumption page | Route exists | `test -f projects/internal/websites/sablia-vox/app/dashboard/consumption/page.tsx` |
| file-exists | consumption client | Client component exists | `test -f projects/internal/websites/sablia-vox/app/dashboard/consumption/ConsumptionClient.tsx` |
| file-exists | consumption types | Type definitions exist | `test -f projects/internal/websites/sablia-vox/lib/types/consumption.ts` |
| contains | consumption query | Uses get_consumption_metrics RPC | `grep -q 'get_consumption_metrics' projects/internal/websites/sablia-vox/lib/queries/consumption.ts` |

---

## Phase D: Quality Trend & Suggestions

Skill: `/execute` (direct implementation)

Adds quality trend chart and improvement suggestions section to agent detail page. Addresses US-14 and US-15.

### Tasks
- [ ] D1: Create `lib/queries/agent-insights.ts` with `fetchQualitySnapshots(deploymentId, days)` (direct query on `quality_snapshots` table, RLS handles org scoping) and `fetchSuggestions(deploymentId)` (direct query on `improvement_suggestions`). Create corresponding TanStack Query hooks in `lib/hooks/useAgentInsights.ts`
- [ ] D2: Create `components/dashboard/Charts/QualityTrendChart.tsx` — line chart showing `avg_quality_score` (1-5 scale) over the last 30 days from `quality_snapshots`. Use Recharts (already in project for other charts). Include trend indicator: compare last 7 days avg to previous 7 days avg → up/down/stable arrow. Wrap in `FadeIn`
- [ ] D3: Create `components/dashboard/SuggestionsSection.tsx` — card list showing improvement suggestions with: `suggestion_type` badge, `suggestion_text`, `status` (pending/applied/dismissed), `created_at`. Empty state: "Aucune suggestion pour le moment — les suggestions sont generees automatiquement." Wrap in `StaggerChildren`
- [ ] D4: Integrate QualityTrendChart and SuggestionsSection into `AgentDetailClient.tsx` — add below existing charts grid. Quality chart in full-width section, suggestions in full-width section below. Both with section headers and `FadeIn` entrance

### Technical Details

**Quality snapshots query** (RLS org-scoped, no RPC needed):
```typescript
async function fetchQualitySnapshots(deploymentId: string, days = 30) {
  const supabase = createClient()
  const since = new Date()
  since.setDate(since.getDate() - days)
  
  const { data, error } = await supabase
    .from('quality_snapshots')
    .select('snapshot_date, call_count, success_rate, avg_quality_score, conversion_rate')
    .eq('deployment_id', deploymentId)
    .gte('snapshot_date', since.toISOString().slice(0, 10))
    .order('snapshot_date', { ascending: true })
  
  return data ?? []
}
```

**DB schema reference** (verified live):
- `quality_snapshots`: id, deployment_id, org_id, snapshot_date (date), call_count, success_rate, fail_rate, voicemail_rate, avg_duration, avg_quality_score (numeric 1-5), avg_cost, conversion_rate, created_at
- `improvement_suggestions`: id, deployment_id, prompt_version_id, suggestion_type (text), suggestion_text (text), status (text, default 'pending'), reviewed_by, reviewed_at, created_at
- Both tables have RLS policies for org-scoped SELECT + service role ALL

**Quality trend chart config**:
- X-axis: snapshot_date (formatted as "DD/MM")
- Y-axis: avg_quality_score (1-5 scale)
- Reference line at score 3.0 (neutral threshold)
- Color: purple gradient matching design spec accent
- Tooltip: date + score + call count for context

**Suggestions empty state** (0 rows currently — this is expected):
Display empty state card with illustration + message. Data population will come from an n8n workflow (out of scope for this unit).

### Verification Constraints
| Type | Target | Assertion | Method |
|------|--------|-----------|--------|
| file-exists | quality chart | Chart component exists | `test -f projects/internal/websites/sablia-vox/components/dashboard/Charts/QualityTrendChart.tsx` |
| file-exists | suggestions section | Section component exists | `test -f projects/internal/websites/sablia-vox/components/dashboard/SuggestionsSection.tsx` |
| contains | AgentDetailClient.tsx | Imports QualityTrendChart | `grep -q 'QualityTrendChart' projects/internal/websites/sablia-vox/app/dashboard/agents/\[agentId\]/AgentDetailClient.tsx` |
| contains | agent-insights.ts | Queries quality_snapshots | `grep -q 'quality_snapshots' projects/internal/websites/sablia-vox/lib/queries/agent-insights.ts` |

---

## Phase E: Integration & Validation

Skill: `/validate`

Final integration, build verification, and visual check.

### Tasks
- [ ] E1: Run `npm run type-check` + `npm run lint` + `npm run build` — fix any errors. Ensure zero `any` types in new code, Biome lint clean, build succeeds
- [ ] E2: Visual verification in shared browser — navigate through: consumption page (with real data), agent detail (quality chart + suggestions empty state), call detail (audio player + transcript with speaker labels). Verify animations render correctly
- [ ] E3: Verify sidebar navigation — "Consommation" link visible for all users, navigates correctly. Verify consumption page URL params persist on refresh (nuqs)

### Technical Details

**Build verification commands**:
```bash
cd projects/internal/websites/sablia-vox
npm run type-check   # tsc --noEmit
npm run lint         # biome check
npm run build        # next build
```

**Visual verification targets** (shared browser at browser.sablia.io):
1. `/dashboard/consumption` — per-agent cards with progress bars, totals section
2. `/dashboard/agents/{id}` — quality trend chart visible below existing charts, suggestions section with empty state
3. `/dashboard/agents/{id}/calls/{callId}` — polished audio player with speed control, transcript with speaker bubbles

### Verification Constraints
| Type | Target | Assertion | Method |
|------|--------|-----------|--------|
| contains | type-check | Zero type errors | `cd projects/internal/websites/sablia-vox && npx tsc --noEmit 2>&1 | tail -1 | grep -v 'error'` |
| contains | lint | Biome clean | `cd projects/internal/websites/sablia-vox && npx biome check --no-errors-on-unmatched . 2>&1 | grep -v 'Found'` |

---

## Documentation Sources & Targets

| Document | Role | Update scope |
|----------|------|-------------|
| `PRD-saas.md` | Source | — |
| `DESIGN-SPEC.md` | Source | — |
| `API-client-ready.md` | Source | — |
| `plans/vox-saas-master.md` | Source | — |
| `research/plan/2026-04-13-vox-saas-customer-success.md` | Source | — |
| `CLAUDE.md` (project) | Target | Phase E — update routes (consumption), architecture (motion primitives, audio, transcript), active project status |
| `docs/ARCHITECTURE.md` | Target | Phase E — add consumption data flow, audio/transcript component, motion primitives |

## Validation Strategy

**Type**: mixed (automated + visual)
**Confidence before validation**: 8/10

### Acceptance Criteria
- [ ] AC-1: 6 motion primitives exist in `components/motion/` with barrel export | Type: binary | Verify: `ls projects/internal/websites/sablia-vox/components/motion/*.tsx | wc -l` equals 6
- [ ] AC-2: AudioPlayer extracted to shared component, used in both CallDetailClient and modal | Type: binary | Verify: `grep -r "from '@/components/audio/AudioPlayer'" projects/internal/websites/sablia-vox/app/dashboard/ | wc -l` equals 2
- [ ] AC-3: AudioPlayer has playback speed control and track selector | Type: binary | Verify: `grep -q 'playbackRate\|playback.*speed' projects/internal/websites/sablia-vox/components/audio/AudioPlayer.tsx`
- [ ] AC-4: TranscriptDisplay parses speaker labels from transcript text | Type: binary | Verify: `grep -q "User.*Model\|parseTranscript" projects/internal/websites/sablia-vox/components/transcript/TranscriptDisplay.tsx`
- [ ] AC-5: Consumption page route exists with nuqs URL state | Type: binary | Verify: `grep -q 'useQueryStates\|nuqs' projects/internal/websites/sablia-vox/app/dashboard/consumption/ConsumptionClient.tsx`
- [ ] AC-6: `get_consumption_metrics` RPC returns data for valid org | Type: binary | Verify: Supabase SQL `SELECT get_consumption_metrics('2026-04-01'::date, '2026-04-30'::date)` returns non-null
- [ ] AC-7: Quality trend chart renders on agent detail page | Type: binary | Verify: `grep -q 'QualityTrendChart' projects/internal/websites/sablia-vox/app/dashboard/agents/\[agentId\]/AgentDetailClient.tsx`
- [ ] AC-8: Suggestions section with empty state renders on agent detail page | Type: binary | Verify: `grep -q 'SuggestionsSection' projects/internal/websites/sablia-vox/app/dashboard/agents/\[agentId\]/AgentDetailClient.tsx`
- [ ] AC-9: `npm run type-check` and `npm run build` succeed | Type: binary | Verify: `cd projects/internal/websites/sablia-vox && npm run type-check && npm run build`
- [ ] AC-10: UI quality — animations smooth, consumption layout matches PRD wireframe, audio player polished | Type: scored (score >= 7/10) | Verify: visual inspection via shared browser

### Validation Steps
| # | Method | What it checks | Pass condition |
|---|--------|---------------|----------------|
| 1 | `npm run type-check` | Type safety | Zero errors |
| 2 | `npm run lint` | Code quality | Zero errors |
| 3 | `npm run build` | Build success | Exit code 0 |
| 4 | Supabase SQL | RPC works | Returns JSONB with by_deployment array |
| 5 | Playwright / shared browser | Visual verification | All 3 pages render correctly |
| 6 | URL manipulation | nuqs consumption params | Params persist on refresh |

### Iteration Protocol
If validation fails:
1. Identify which acceptance criteria failed
2. Fix the root cause (do NOT patch around it)
3. Re-run all validation steps
4. Repeat until all criteria pass

## Regression Tests

| Test | Source Plan | Command/Check | Expected |
|------|------------|---------------|----------|
| Settings page still works | vox-saas-auth-settings | Navigate to /dashboard/settings | Tabs render, org form works |
| Pricing section intact | vox-saas-landing-onboarding | Navigate to / | Pricing section visible |
| Welcome modal still works | vox-saas-landing-onboarding | Check onboarded_at logic | Modal shows for new users |
| Sidebar navigation | vox-saas-tech-debt | All sidebar links work | No broken nav |
| Build succeeds | All units | `npm run build` | Exit 0 |

## Challenge Gate
- [x] Plan challenged (integrated /plan shadow challenge)

---

## Challenge Report

**Date**: 2026-04-13
**Round**: 3
**Verdict**: **GO**
**Total agents spawned**: 8 (3 Round 1 + 2 Round 2 + 2 Round 3 + 1 skipped Round 3 scout)

### Iteration History

| Round | Verdict | BLOCKING | Actions Applied | Key Change |
|-------|---------|----------|-----------------|------------|
| 1 | REVISE | 2 | 5 | Added LazyMotion dependency note, explicit project_id + indexes for RPC, fixed staleTime convention, sidebar casing, nuqs/server pattern |
| 2 | REVISE | 1 | 3 | Fixed motion import from `import { m }` to `import * as m from 'motion/react-m'`, added whileInView/domAnimation caveat, clarified import pattern |
| 3 | GO | 0 (adjudicated) | 1 | Fixed `createSearchParamsCache` → `createLoader`. DA's `sms` vs `agent_sms` claim dismissed with live DB evidence |

**Iterations**: 3 | **Total agents spawned**: 8

### Verified Hypotheses (Round 3 — 11 claims checked)

| Status | Count | Key Items |
|--------|-------|-----------|
| Pass | 10 | `import * as m from 'motion/react-m'` confirmed, `sms` table exists in v2 (live DB), `sms.cost` column confirmed, `call_costs.billed_cost` + `call_id` FK confirmed, nuqs `useQueryStates`/`parseAsString` match codebase, `quality_snapshots.avg_quality_score` confirmed, `improvement_suggestions` table exists, MotionProvider wraps app tree |
| Info | 1 | `createLoader` preferred over `createSearchParamsCache` (fixed) |
| Fail | 0 | — |

### Counter-arguments (Round 3 — 7 findings)

| Severity | Count | Key Items |
|----------|-------|-----------|
| BLOCKING (dismissed) | 2 | (1) `sms` vs `agent_sms` — false positive, live DB confirms `sms`. (2) `createSearchParamsCache` — fixed to `createLoader` |
| RISK | 2 | (1) `whileInView` under `domAnimation` unverified — plan includes fallback strategy. (2) `quality_snapshots` no local migration — verified against live DB |
| MINOR | 3 | No lucide icon specified for consumption nav, `createClient` import ambiguous in code sample, `call_costs` JOIN consistent with existing RPCs |

### External Insights (Round 1 — 5 insights)

| # | Insight | Impact |
|---|---------|--------|
| 1 | `m` from `motion/react-m` requires LazyMotion wrapper | Addressed — MotionProvider exists, dependency documented |
| 2 | PostgREST LATERAL performance issue exists but plan's raw SQL RPC bypasses it | No change needed — correct approach |
| 3 | Recharts is mature and widely used for line charts in React | Confirms plan choice |
| 4 | Indexes recommended for `calls(deployment_id, started_at)` and `sms(deployment_id, sent_at)` | Added to C1 task |
| 5 | `playbackRate` 0.75x-2x range is safe across all major browsers | Confirms plan choice |

### Deferred Actions
None — all issues resolved during iteration.

### Key Fixes Applied During Challenge
1. **Motion import syntax**: `import { m }` → `import * as m from 'motion/react-m'` (all code samples)
2. **LazyMotion dependency**: Explicit paragraph documenting that `m` components require `LazyMotion` ancestor (MotionProvider covers all dashboard routes)
3. **Migration project_id**: Explicit `project_id: mgsfrhirsvqbyjagrswt` + performance indexes added to C1
4. **nuqs pattern**: `createSearchParamsCache` → `createLoader` to match existing codebase
5. **Sidebar casing**: `GESTION` → `Gestion` to match existing `SidebarConfig`
6. **staleTime**: Changed from hardcoded `3600000` to "match existing convention"
7. **whileInView caveat**: Added runtime verification note + CSS fallback strategy for domAnimation compatibility
