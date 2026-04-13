# Vox E2E Bugfix Plan

**Date**: 2026-04-13
**Context**: vox-saas-master 6/6 units complete. E2E test: 8/10 pass, 5 bugs found.
**Confidence**: 9/10 — all root causes verified in code

## Executive Summary

Fix 5 bugs found during E2E testing of vox.sablia.io. Issues range from P1 (Settings broken) to P3 (cosmetic). All root causes identified with exact file locations and fixes.

## Phase Status
| Phase | Name | Tasks |
|-------|------|-------|
| A | Settings org_id fix (P1) | 4 |
| B | Pie chart NaN% + untranslated outcomes (P2) | 4 |
| C | Breadcrumb i18n + image warning (P3) | 3 |

---

## Phase A: Settings org_id Fix (P1)

**Root cause (2 bugs, same cause)**: `org_id` is injected into the JWT ONLY by `custom_access_token_hook` (migration `20260402120000`). It is NOT stored in `auth.users.raw_app_meta_data` — the invite process (`inviteUserByEmail()`) doesn't pass `app_metadata: { org_id }`.

1. **Team members (Equipe)**: `useOrgMembers.ts:13` uses client-side `getSession()` which may have stale JWT. Sends `.eq('org_id', undefined)` → PostgREST `org_id=eq.undefined` → returns empty.
2. **Org form empty**: `page.tsx:16` uses `getUser().app_metadata.org_id` which reads `raw_app_meta_data` (DB) — org_id is NOT there. Returns undefined → org fetch skipped → form shows empty.

**Fix strategy**: Use `getOrgId()` from `lib/auth.ts` (reads JWT via server-side `getSession()` — safe in SSR, cookie-validated). Pass orgId from server to client, eliminating client-side session resolution.

**Also affected**: `requireAdmin()` in `lib/api-auth.ts:29` uses same broken `getUser()` pattern — flag as follow-up TODO (out of scope for this plan, but production risk).

**Note**: `lib/hooks/useOrgInfo.ts` has the same pattern but **has zero imports** (dead code) — skip fixing it; delete if desired during execution.

**Fix strategy**: The server component (`page.tsx`) already resolves `orgId` via `getUser()`. Pass it to the client component, which forwards it to hooks. Remove client-side session resolution from hooks.

### Tasks
- [x] A1: Fix `page.tsx` to use `getOrgId()` instead of `getUser().app_metadata.org_id`
  - `app/dashboard/settings/page.tsx:16` — replace `(user.app_metadata as Record<string, string> | undefined)?.org_id` with `await getOrgId(supabase)` (import from `@/lib/auth`)
  - `app/dashboard/settings/page.tsx:28` — add `orgId={orgId}` prop to `SettingsClient`
  - `app/dashboard/settings/SettingsClient.tsx:64-67` — add `orgId: string | null` to `SettingsClientProps`

- [x] A2: Modify `useOrgMembers()` to accept `orgId` parameter
  - `lib/hooks/useOrgMembers.ts` — change signature to `useOrgMembers(orgId: string | null)`
  - Remove client-side `getSession()` resolution (lines 9-13)
  - Add `enabled: !!orgId` to prevent query when orgId is null
  - Update `.eq('org_id', orgId!)` (safe because of enabled guard)

- [x] A3: Pass `orgId` through `TeamTab` component
  - `SettingsClient.tsx:106-108` — pass `orgId` to `TeamTab`
  - `SettingsClient.tsx:266-267` — update `TeamTab` to accept `orgId` prop and pass to `useOrgMembers(orgId)`

- [x] A4: Delete dead `useOrgInfo()` hook (0 imports — verified by challenge agents)
  - `lib/hooks/useOrgInfo.ts` — delete the file (no component imports it)
  - Verify with `grep -r 'useOrgInfo' --include='*.tsx' --include='*.ts'` that only the definition exists

### Technical Details

```typescript
// page.tsx — AFTER fix (use getOrgId from lib/auth.ts)
import { checkIsAdminServer, getOrgId } from '@/lib/auth'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const isAdmin = await checkIsAdminServer()
  const orgId = await getOrgId(supabase) // reads JWT claims via getSession() — has org_id from hook

  let org: OrgProfile | null = null
  if (orgId) {
    const { data } = await supabase.from('organizations').select('...')
    org = data as OrgProfile | null
  }

  return <SettingsClient org={org} orgId={orgId} isAdmin={isAdmin} />
}
```

```typescript
// useOrgMembers.ts — AFTER fix (accepts orgId parameter, no session resolution)
export function useOrgMembers(orgId: string | null) {
  return useQuery<OrgMember[]>({
    queryKey: ['org-members', orgId],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('user_org_memberships')
        .select(
          'id, user_id, org_id, permission_level, is_default, created_at, users(email, full_name, role, avatar_url)',
        )
        .eq('org_id', orgId!)
        .order('created_at')
      if (error) throw error
      return data as unknown as OrgMember[]
    },
    enabled: !!orgId,
    staleTime: 3600000,
  })
}
```

```typescript
// SettingsClient.tsx — prop change
interface SettingsClientProps {
  org: OrgProfile | null
  orgId: string | null
  isAdmin: boolean
}
```

### Verification Constraints
| Type | Target | Assertion | Method |
|------|--------|-----------|--------|
| contains | lib/hooks/useOrgMembers.ts | No getSession call | `! grep -q 'getSession' /home/sablia/workspace/projects/internal/websites/sablia-vox/lib/hooks/useOrgMembers.ts` |
| contains | lib/hooks/useOrgMembers.ts | Has enabled guard | `grep -q 'enabled' /home/sablia/workspace/projects/internal/websites/sablia-vox/lib/hooks/useOrgMembers.ts` |
| contains | app/dashboard/settings/SettingsClient.tsx | orgId in props interface | `grep -q 'orgId' /home/sablia/workspace/projects/internal/websites/sablia-vox/app/dashboard/settings/SettingsClient.tsx` |
| contains | app/dashboard/settings/page.tsx | Uses getOrgId instead of getUser for org_id | `grep -q 'getOrgId' /home/sablia/workspace/projects/internal/websites/sablia-vox/app/dashboard/settings/page.tsx` |

---

## Phase B: Pie Chart NaN% + Untranslated Outcomes (P2)

### Bug B1: NaN% in pie chart legends

**Root cause**: The `get_outcome_distribution` RPC already filters `c.outcome IS NOT NULL` (verified in migration). So the NaN% for outcomes is NOT from null data — it's more likely from entries with unrecognized outcome values (`information_provided`, `transfer_completed`) where `OUTCOME_CONFIG[item.outcome]` returns undefined, and the legend renders the raw string as name. The NaN% for emotions could be from null emotion values reaching the client (the query in `fetchEmotionDistribution` filters `.not('emotion', 'is', null)` but the component doesn't guard against it).

For both charts: add null filtering as a safety layer AND add the missing outcome translations (root fix for outcomes).

Specifically in `OutcomeBreakdown.tsx:28`: `config?.label || item.outcome` — when `item.outcome` is null, `config` is undefined, so this evaluates to `null`. The `total` includes these counts, but the legend entry may not correctly reference the value.

**Fix**: Filter out null outcomes/emotions before building chartData. Also add a guard in percentage computation.

### Bug B2: Untranslated outcome values

**Root cause**: `lib/constants.ts` OUTCOME_CONFIG doesn't include `information_provided` and `transfer_completed`. These are non-standard variants of `info_provided` and `transferred` that exist in the DB. The fallback `config?.label || item.outcome` renders the raw English string.

**Fix**: Add these as aliases in OUTCOME_CONFIG.

### Tasks
- [x] B1: Filter null outcomes in OutcomeBreakdown
  - `components/dashboard/Charts/OutcomeBreakdown.tsx:23` — add `item.outcome != null` to filter
  - Guard percentage computation in `renderLegend` and `renderCustomLabel`

- [x] B2: Filter null emotions in EmotionDistribution (safety layer)
  - `components/dashboard/Charts/EmotionDistribution.tsx:41` — add `item.emotion != null` to filter
  - Guard percentage computation in `renderLegend` and `renderCustomLabel`

- [x] B3: Add `information_provided` and `transfer_completed` to OUTCOME_CONFIG
  - `lib/constants.ts` — add entries mapping to same config as `info_provided` and `transferred`

- [x] B4: Verify non-standard outcomes in CallDetailContent, CallsListClient, and KPI RPCs
  - These files also reference `OUTCOME_CONFIG` — verify the non-standard outcomes render correctly there too (badge display, not just charts)
  - **KPI impact** (challenge finding): check if `get_dashboard_kpis` RPC counts `information_provided` as a conversion for secretary templates and `transfer_completed` for transfer templates. If not, conversion rates may undercount. Note: RPC fix is a DB migration — flag for follow-up if needed, don't block this plan

### Technical Details

```typescript
// OutcomeBreakdown.tsx — filter fix
return data
  .filter((item) => item.outcome != null && item.count > 0)
  .map((item) => { ... })
```

```typescript
// lib/constants.ts — add aliases
information_provided: {
  label: 'Info donnée',
  group: 'success',
  className: 'bg-green-500/20 text-green-400',
},
transfer_completed: {
  label: 'Transféré',
  group: 'success',
  className: 'bg-green-500/20 text-green-400',
},
```

### Verification Constraints
| Type | Target | Assertion | Method |
|------|--------|-----------|--------|
| contains | components/dashboard/Charts/OutcomeBreakdown.tsx | Filters null outcomes | `grep -q 'outcome != null\|outcome !== null' /home/sablia/workspace/projects/internal/websites/sablia-vox/components/dashboard/Charts/OutcomeBreakdown.tsx` |
| contains | components/dashboard/Charts/EmotionDistribution.tsx | Filters null emotions | `grep -q 'emotion != null\|emotion !== null' /home/sablia/workspace/projects/internal/websites/sablia-vox/components/dashboard/Charts/EmotionDistribution.tsx` |
| contains | lib/constants.ts | Has information_provided entry | `grep -q 'information_provided' /home/sablia/workspace/projects/internal/websites/sablia-vox/lib/constants.ts` |
| contains | lib/constants.ts | Has transfer_completed entry | `grep -q 'transfer_completed' /home/sablia/workspace/projects/internal/websites/sablia-vox/lib/constants.ts` |

---

## Phase C: Breadcrumb i18n + Image Warning (P3)

### Bug C1: Consumption breadcrumb in English

**Root cause**: `components/dashboard/DynamicBreadcrumb.tsx:18-24` — `routeLabels` map doesn't include `consumption`. The fallback (line 42) capitalizes the URL segment: `segment.charAt(0).toUpperCase() + segment.slice(1)` → "Consumption".

**Fix**: Add `consumption: 'Consommation'` to `routeLabels`.

### Bug C2: Console image warning on every page

**Root cause**: `app/layout.tsx:68-72` — metadata `icons.apple` is set to `/favicon.svg`. Apple touch icons must be PNG (Safari ignores SVG). The webmanifest references `android-chrome-192x192.png` and `android-chrome-512x512.png` which exist. The warning is likely from Next.js or the browser trying to use the SVG as an apple-touch-icon.

**Fix**: Point `apple` to a PNG icon. The `android-chrome-192x192.png` already exists and can be used for this purpose.

### Tasks
- [x] C1: Add `consumption` to breadcrumb routeLabels
  - `components/dashboard/DynamicBreadcrumb.tsx:18-24` — add `consumption: 'Consommation'`

- [x] C2: Fix apple touch icon to use PNG
  - `app/layout.tsx:68-72` — change `apple: '/favicon.svg'` to `apple: '/android-chrome-192x192.png'`

- [x] C3: Verify no other missing breadcrumb translations
  - Check all dashboard routes against `routeLabels` map — ensure all route segments have translations

### Technical Details

```typescript
// DynamicBreadcrumb.tsx — add entry
const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  agents: 'Agents',
  overview: "Vue d'ensemble",
  calls: 'Appels',
  settings: 'Paramètres',
  consumption: 'Consommation',  // <-- add this
}
```

```typescript
// app/layout.tsx — fix apple icon
icons: {
  icon: '/favicon.svg',
  shortcut: '/favicon.svg',
  apple: '/android-chrome-192x192.png',  // <-- PNG, not SVG
},
```

### Verification Constraints
| Type | Target | Assertion | Method |
|------|--------|-----------|--------|
| contains | components/dashboard/DynamicBreadcrumb.tsx | Has consumption translation | `grep -q 'consumption' /home/sablia/workspace/projects/internal/websites/sablia-vox/components/dashboard/DynamicBreadcrumb.tsx` |
| contains | app/layout.tsx | Apple icon is PNG | `grep -q 'android-chrome' /home/sablia/workspace/projects/internal/websites/sablia-vox/app/layout.tsx` |
| file-exists | public/android-chrome-192x192.png | PNG icon exists | `test -f /home/sablia/workspace/projects/internal/websites/sablia-vox/public/android-chrome-192x192.png` |

---

## Documentation Sources & Targets

| Document | Role | Update scope |
|----------|------|-------------|
| `lib/hooks/useOrgMembers.ts` | Source | — |
| `lib/hooks/useOrgInfo.ts` | Source | — |
| `app/dashboard/settings/SettingsClient.tsx` | Source | — |
| `app/dashboard/settings/page.tsx` | Source | — |
| `components/dashboard/Charts/OutcomeBreakdown.tsx` | Source | — |
| `components/dashboard/Charts/EmotionDistribution.tsx` | Source | — |
| `lib/constants.ts` | Source | — |
| `components/dashboard/DynamicBreadcrumb.tsx` | Source | — |
| `app/layout.tsx` | Source | — |
| `docs/KNOWN_ISSUES.md` | Target | Phase C — document resolved E2E bugs |

---

## Validation Strategy

**Type**: mixed (automated + visual)
**Confidence before validation**: 9/10

### Acceptance Criteria
- [x] AC-1: `npm run type-check` passes with zero errors | Type: binary | Verify: `cd /home/sablia/workspace/projects/internal/websites/sablia-vox && npm run type-check`
- [x] AC-2: `npm run lint` passes with zero errors | Type: binary | Verify: `cd /home/sablia/workspace/projects/internal/websites/sablia-vox && npm run lint`
- [x] AC-3: `npm run build` succeeds | Type: binary | Verify: `cd /home/sablia/workspace/projects/internal/websites/sablia-vox && npm run build`
- [ ] AC-4: Settings page loads without `org_id=eq.undefined` console errors | Type: binary | Verify: browser test on deployed site
- [ ] AC-5: Pie chart legends show valid percentages (no NaN%) | Type: binary | Verify: browser test on deployed site
- [ ] AC-6: Outcome labels show French translations (no raw English) | Type: binary | Verify: browser test — check for `information_provided` / `transfer_completed`
- [ ] AC-7: Consumption breadcrumb shows "Consommation" | Type: binary | Verify: browser test on `/dashboard/consumption`
- [ ] AC-8: No "source isn't a valid image" console warning | Type: binary | Verify: browser console check on deployed site

### Validation Steps
| # | Method | What it checks | Pass condition |
|---|--------|---------------|----------------|
| 1 | `npm run type-check` | Type safety | Exit 0, no errors |
| 2 | `npm run lint` | Biome lint | Exit 0, no errors |
| 3 | `npm run build` | Build integrity | Exit 0, no errors |
| 4 | Browser — Settings/Equipe tab | Team members load | Members list visible, no console error |
| 5 | Browser — Overview page | Pie charts | No NaN% in legends |
| 6 | Browser — Overview page outcomes | French labels | No raw English outcome values |
| 7 | Browser — Consumption page | Breadcrumb | Shows "Consommation" |
| 8 | Browser — Any page console | Image warning | No "source isn't a valid image" |

### Iteration Protocol
If validation fails:
1. Identify which acceptance criteria failed
2. Fix the root cause (do NOT patch around it)
3. Re-run all validation steps
4. Repeat until all criteria pass

---

## Follow-up TODOs (out of scope)
- **`requireAdmin()` uses `getUser().app_metadata.org_id`** — same broken pattern as page.tsx. Works for Brice (may have org_id in raw_app_meta_data from manual setup) but will 403 for invited users. Fix: use `getOrgId()` or `getSession()`. Affects all admin API routes.
- **KPI RPC conversion counting**: `get_dashboard_kpis` only counts `info_provided` and `transferred` as conversions — not the aliases `information_provided` and `transfer_completed`. If these represent real outcomes, conversion rates are undercounted. Fix: add aliases to RPC WHERE clause (DB migration).
- **RPC-level null filtering**: `get_outcome_distribution` already has `WHERE outcome IS NOT NULL` but the client-side filter is a safety layer. Consider auditing all RPCs for consistent null handling.

## Regression Tests
| Test | Source Plan | Command/Check | Expected |
|------|------------|---------------|----------|
| Type-check clean | vox-saas-master | `npm run type-check` | Exit 0 |
| Lint clean | vox-saas-polish | `npm run lint` | Exit 0 |
| Build succeeds | vox-saas-master | `npm run build` | Exit 0 |

---

## Challenge Gate
- [x] Plan challenged (integrated /plan shadow challenge)

---

## Challenge Report

**Date**: 2026-04-13 | **Rounds**: 1 (+ auto-apply) | **Agents spawned**: 3 | **Verdict**: GO

### Verified Hypotheses (Agent 1 — Verifier)

| # | Claim | Status | Note |
|---|-------|--------|------|
| 1 | `getSession()` may not decode app_metadata correctly | WARN | Imprecise but directionally correct — real issue is JWT-only org_id |
| 2 | Server-resolved orgId is the right fix | PASS | Confirmed — getOrgId() via getSession() is the correct pattern |
| 3 | PostgREST `.eq('org_id', undefined)` → `org_id=eq.undefined` | PASS | Verified with supabase-js 2.102.1 |
| 4 | Apple touch icon must be PNG | PASS | Safari ignores SVG for apple-touch-icon |
| 5 | TanStack Query `enabled: !!orgId` works correctly | PASS | Confirmed for v5 |
| 6 | Recharts `entry.payload.value` is correct path | PASS | Plan doesn't change this — filters upstream |
| 7 | `useOrgInfo` is "used elsewhere" | WARN | **False** — 0 imports. Dead code. Fixed to "delete" in plan |

Full report: `tmp/s-3785498/plan-shadow-vox-e2e-bugfix-agent1-round1.md`

### Counter-Arguments (Agent 2 — Devil's Advocate)

| # | Argument | Severity | Resolution |
|---|----------|----------|------------|
| 1 | useOrgInfo is dead code — A4 fixes unused hook | RISK | **Fixed**: A4 now deletes file instead |
| 2 | Root cause imprecise — getSession DOES work | RISK | **Fixed**: root cause rewritten with JWT-only explanation |
| 3 | OrgEditForm staleness after save | MINOR | Pre-existing, out of scope |
| 4 | EmotionDistribution null filter may be unnecessary | MINOR | Kept as safety layer |
| 5 | RPC `get_outcome_distribution` could be fixed server-side | RISK | Noted as follow-up TODO |
| 6 | Non-standard outcomes may affect KPI RPCs | RISK | **Fixed**: added KPI note to B4 + follow-up TODO |

Full report: `tmp/s-3785498/plan-shadow-vox-e2e-bugfix-agent2-round1.md`

### External Insights (Agent 3 — External Scout)

| # | Insight | Impact | Resolution |
|---|---------|--------|------------|
| 1 | **BLOCKING**: getUser() returns DB record, not JWT claims — org_id is JWT-only | Plan-breaking | **FIXED**: Phase A now uses getOrgId() (reads JWT via getSession()) |
| 2 | getUser() vs getSession() is documented Supabase catch-22 | Confirms #1 | Aligned with lib/auth.ts existing pattern |
| 3 | Recharts NaN in React 19 may be version bug, not just null data | Minor | Filter fix is correct; Recharts upgrade noted if broader NaN persists |
| 4 | Next.js apple icon SVG rejection confirmed | Confirms plan | No change needed |
| 5 | TanStack Query v5 skipToken preferred over enabled for type safety | Minor | enabled pattern is correct; skipToken is optional upgrade |

Full report: `tmp/s-3785498/plan-shadow-vox-e2e-bugfix-agent3-round1.md`

### Iteration History

| Round | Verdict | BLOCKING | Actions Applied | Key Change |
|-------|---------|----------|-----------------|------------|
| 1 | REVISE | 1 | 4 | Fixed org_id source (getOrgId vs getUser), deleted dead useOrgInfo task, added KPI follow-up, rewritten root cause |
| Post-apply | GO | 0 | — | All BLOCKING resolved — structural fix applied |

**Iterations**: 1 (+ auto-apply) | **Total agents spawned**: 3

### Knowledge Harvest
[Knowledge Harvest] 1 finding persisted:
- **getUser() vs getSession() for JWT hook claims**: org_id injected by custom_access_token_hook is JWT-only, not in raw_app_meta_data. Use getSession() (via getOrgId helper) for server-side org_id resolution. getUser() is for identity verification only.
