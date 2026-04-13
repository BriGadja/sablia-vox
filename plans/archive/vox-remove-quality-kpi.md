# Vox - Remove "Qualité Moyenne" KPI

## Executive Summary
Remove the "Qualité Moyenne" KPI card from all dashboard views. The metric (avg quality score 0-100) is no longer relevant since it was changed to a note over 5 and voicemails skew results. Also clean up the per-call `call_quality_score` column from the admin calls table.

## Phase Status
| Phase | Name | Tasks |
|-------|------|-------|
| A | Remove KPI & cleanup | 6 |

## Phase A: Remove KPI & Cleanup

### Tasks
- [ ] A1: Remove "Qualité Moyenne" entry from `overviewKPIs` array in `components/dashboard/KPIGrid.tsx:166-172`
- [ ] A2: Remove `avg_quality_score` from type `KPIPeriod` in `lib/types/dashboard.ts:65`
- [ ] A3: Remove `call_quality_score` column from AdminCalls:
  - `components/dashboard/AdminCalls/columnConfig.ts:124-127` (column definition)
  - `components/dashboard/AdminCalls/columnConfig.ts:353` (from preset columns array)
  - `components/dashboard/AdminCalls/AdminCallsTable.tsx:199-203` (render case)
  - `lib/queries/adminCalls.ts:100` (export column entry)
  - `lib/types/adminCalls.ts:32` (type field)
  - `lib/types/dashboard.ts:312` (`CallExportRow` type field)
- [ ] A4: Update comment on line 136 of KPIGrid.tsx — remove "Qualité" from the funnel description
- [ ] A5: Remove dead `'score'` format from `KPICard.tsx` — delete `case 'score'` handler and remove `'score'` from the format union type
- [ ] A6: Update overview grid layout in `KPIGrid.tsx:354-358`:
  - Split the shared ternary: `louis`/`louis-nestenn` keep `lg:grid-cols-6`, `overview` gets `lg:grid-cols-5`, others keep `lg:grid-cols-4`
  - Update comment at line 347: "Use 5 KPIs for Overview"
  - Update comment at line 354: split "6 for Louis/Louis-Nestenn/Overview" → "6 for Louis/Louis-Nestenn, 5 for Overview"
  - Add `'lg:grid-cols-5'` to safelist in `tailwind.config.ts:10` (JIT may not detect it in a ternary string)

### Technical Details
- `overviewKPIs` array: simply delete the object at lines 166-172
- The `avg_quality_score` field in `KPIPeriod` type can be removed — it's only consumed in KPIGrid
- `call_quality_score` in AdminCalls is a per-call column shown in the admin table — remove the column definition, render case, type field, and preset reference
- No Supabase migration needed — the DB columns stay, we just stop displaying them

## Validation Strategy

**Type**: automated
**Confidence before validation**: 9

### Acceptance Criteria
- [ ] No references to `avg_quality_score` remain in any `.tsx`/`.ts` file
- [ ] No "Qualité Moyenne" string in the codebase
- [ ] No references to `call_quality_score` remain in any `.tsx`/`.ts` file
- [ ] `npm run type-check` passes
- [ ] `npm run build` passes (or pre-existing errors only)

### Validation Steps
| # | Method | What it checks | Pass condition |
|---|--------|---------------|----------------|
| 1 | grep | No remaining `avg_quality_score` usage in tsx/ts | 0 matches |
| 2 | grep | No "Qualité Moyenne" string | 0 matches |
| 3 | script | `npm run type-check` | Exit 0 |
| 4 | script | `npm run build` | Exit 0 (or only pre-existing errors) |

### Validation Scripts
```bash
# Check no remaining references
grep -r "avg_quality_score" --include="*.ts" --include="*.tsx" . && echo "FAIL" || echo "PASS"
grep -r "Qualité Moyenne" --include="*.ts" --include="*.tsx" . && echo "FAIL" || echo "PASS"
grep -r "call_quality_score" --include="*.ts" --include="*.tsx" . && echo "FAIL" || echo "PASS"
npm run type-check
```

### Iteration Protocol
If validation fails:
1. Check type errors from removing the field
2. Fix any remaining references
3. Re-run type-check

## Challenge Gate
- [ ] Plan challengé via /challenge

### [Archived] Challenge Report — Round 1 (2026-03-06 — REVISE)

**Round**: 1
**Date**: 2026-03-06
**Document**: `.claude/plans/vox-remove-quality-kpi.md`

### Verifier Results

| # | Hypothesis | Source | Status | Note |
|---|------------|--------|--------|------|
| 1 | "Qualité Moyenne" at KPIGrid.tsx:166-172 | KPIGrid.tsx | pass | Exact match |
| 2 | `avg_quality_score` at dashboard.ts:65 | dashboard.ts | pass | Exact match |
| 3 | columnConfig.ts:124-127 | columnConfig.ts | warning | Actually spans 124-133, minor line offset |
| 4 | Preset at columnConfig.ts:353 | columnConfig.ts | pass | Exact match |
| 5 | Render case at AdminCallsTable.tsx:199-203 | AdminCallsTable.tsx | warning | Extends to line 205, minor |
| 6 | Export column at adminCalls.ts:100 | adminCalls.ts | pass | Exact match |
| 7 | Type field at adminCalls.ts:32 | adminCalls.ts | pass | Exact match |
| 8 | Comment at KPIGrid.tsx:136 | KPIGrid.tsx | pass | Exact match |
| 9 | `avg_quality_score` only consumed in KPIGrid | Grep all .ts/.tsx | pass | Confirmed |
| 10 | No Supabase migration needed | Architecture analysis | pass | Correct — DB column stays |
| 11 | Plan calls type `PeriodData` | dashboard.ts | **fail** | Actual type name is `KPIPeriod`, not `PeriodData` |
| 12 | `CallExportRow` at dashboard.ts:312 also has `call_quality_score` | dashboard.ts | **warning** | Not mentioned in plan — harmless but incomplete |

### Devil's Advocate Results

| # | Argument | Severity | Mitigation |
|---|----------|----------|------------|
| 1 | `CallExportRow` in `dashboard.ts:312` still has `call_quality_score` — not in plan scope | MINOR | Add to A3 or explicitly exclude from acceptance criteria |
| 2 | `get_global_kpis` RPC still computes `avg_quality_score` — orphaned computation | MINOR | Future cleanup — not blocking since field is optional |
| 3 | `'score'` format in KPICard.tsx becomes dead code after removal | MINOR | Add cleanup sub-task: remove `case 'score'` and `'score'` from format union in KPICard.tsx |
| 4 | Validation scripts only grep `avg_quality_score`, not `call_quality_score` | RISK | Add `call_quality_score` grep to validation scripts |

### External Scout Results

| # | Insight | Impact on plan |
|---|---------|----------------|
| 1 | Removing TS type fields that Supabase still returns is safe — extra fields silently ignored | Low — confirms approach |
| 2 | Check CSS grid: if fixed `grid-cols-N`, removing a card leaves empty slot | Low — verify grid class adjusts |
| 3 | Best practice: remove UI only, leave data pipeline untouched | Low — plan already does this |

### Counter-Arguments

1. **[FAIL]** Plan references type `PeriodData` but actual type is `KPIPeriod` — would confuse execution
2. **[RISK]** Validation scripts missing `call_quality_score` grep — incomplete verification
3. **[MINOR]** Dead `'score'` format handler in KPICard.tsx after removal
4. **[MINOR]** `CallExportRow` at dashboard.ts:312 not addressed

### Verdict: **REVISE**

One factual error (wrong type name) and incomplete validation. No blocking issues but should fix before execution.

**Actions applied (all resolved):**
- [x] Fix A2: change `PeriodData` → `KPIPeriod` (correct type name)
- [x] Add A5: remove `'score'` format case from `KPICard.tsx` and from the format union type
- [x] Add validation grep for `call_quality_score` in validation scripts
- [x] Verify grid layout doesn't break (5 cards instead of 6 in overview) — grid uses responsive `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`, 5 cards will flow naturally

### [Archived] Challenge Report — Round 2 (2026-03-06 — REVISE)

**Round**: 2
**Date**: 2026-03-06

### Verified Hypotheses
| # | Hypothesis | Source | Status | Note |
|---|------------|--------|--------|------|
| 1 | A1: "Qualité Moyenne" at KPIGrid.tsx:166-172 | KPIGrid.tsx | pass | Exact match |
| 2 | A2: `avg_quality_score` at dashboard.ts:65 in `KPIPeriod` | dashboard.ts | pass | Correct type name, exact line |
| 3 | A3: columnConfig.ts:124-127 (column def) | columnConfig.ts | warning | Spans 124-133, minor line offset |
| 4 | A3: columnConfig.ts:353 (preset) | columnConfig.ts | pass | Exact match |
| 5 | A3: AdminCallsTable.tsx:199-203 (render case) | AdminCallsTable.tsx | warning | Extends to line 205, minor |
| 6 | A3: adminCalls.ts:100 (export entry) | adminCalls.ts | pass | Exact match |
| 7 | A3: adminCalls.ts:32 (type field) | adminCalls.ts | pass | Exact match |
| 8 | A4: Comment at KPIGrid.tsx:136 | KPIGrid.tsx | pass | Exact match |
| 9 | A5: `'score'` format union + case handler in KPICard.tsx | KPICard.tsx:10,59-60 | pass | Both present |
| 10 | `avg_quality_score` only consumed in KPIGrid | Grep .ts/.tsx | pass | Only type def + KPIGrid usage |
| 11 | Validation scripts include `call_quality_score` grep | Plan line 56 | pass | Present |
| 12 | Grid class for overview is `lg:grid-cols-4` (Round 1 claim) | KPIGrid.tsx:357 | **fail** | Actual class is `lg:grid-cols-6`. 5 cards in 6-col grid leaves empty slot. |
| 13 | `CallExportRow` at dashboard.ts:312 has `call_quality_score` | dashboard.ts | warning | Not in plan tasks but acceptance criteria grep will flag it |

### Counter-arguments
| # | Argument | Severity | Mitigation |
|---|----------|----------|------------|
| 1 | `CallExportRow` at `dashboard.ts:312` has `call_quality_score` — acceptance criteria (line 39) require 0 references, validation grep will fail | **BLOCKING** | Add removal of `call_quality_score` from `CallExportRow` to task A3 |
| 2 | Overview grid uses `lg:grid-cols-6` — 5 cards in 6-col grid leaves visible empty slot on large screens. Round 1 mitigation cited wrong grid class (`lg:grid-cols-4`) | **RISK** | Add sub-task: change overview grid to `lg:grid-cols-5` (or accept asymmetry) |
| 3 | Comments at KPIGrid.tsx:347 ("Use 6 KPIs for Overview") and :354 ("6 for Louis/Louis-Nestenn/Overview") become stale | MINOR | Add to A4: update these comments too |
| 4 | Execution dependency: A1 must run before A5 (removes consumer of `'score'` format) | MINOR | Natural ordering — no plan change needed, just note |

### External Insights
| # | Insight | Source | Impact on plan |
|---|---------|--------|----------------|
| 1 | TS excess property checks only fire on object literals, not API responses — removing type fields while RPC still returns them is safe | TS Handbook | Confirms approach |
| 2 | Biome/ESLint won't flag dead switch cases, but TS will flag unreachable code if type is narrowed first — bundle A5 atomically | Biome docs | Plan already handles correctly |
| 3 | UI-only removal leaving data pipeline untouched is confirmed best practice | Engineering consensus | Confirms approach |

### Previous Round Actions
| Action | Status |
|--------|--------|
| Fix A2: `PeriodData` → `KPIPeriod` | **Addressed** |
| Add A5: remove `'score'` format | **Addressed** |
| Add validation grep for `call_quality_score` | **Addressed** |
| Verify grid layout doesn't break | **Incorrect** — cited `lg:grid-cols-4`, actual is `lg:grid-cols-6` |

### Verdict: **REVISE**

One BLOCKING issue: `CallExportRow` still has `call_quality_score` which the plan's own validation grep will flag. One RISK: grid class mismatch means 5 cards in a 6-column layout on large screens.

**Actions applied (all resolved):**
- [x] Add to A3: remove `call_quality_score` from `CallExportRow` in `lib/types/dashboard.ts:312` (fixes #1)
- [x] Add sub-task A6: change overview grid from `lg:grid-cols-6` to `lg:grid-cols-5` in KPIGrid.tsx:357, update comments at lines 347 and 354 (fixes #2, #3)

## Challenge Report

**Date**: 2026-03-06 | **Type**: post-plan | **Round**: 3

### Verified Hypotheses
| # | Hypothesis | Source | Status | Note |
|---|------------|--------|--------|------|
| 1 | A1: "Qualité Moyenne" at KPIGrid.tsx:166-172 | KPIGrid.tsx | pass | Exact match |
| 2 | A2: `avg_quality_score` in `KPIPeriod` at dashboard.ts:65 | dashboard.ts | pass | Exact match |
| 3 | A3: columnConfig.ts:124-127 (column def) | columnConfig.ts | warning | Spans 124-133, minor line offset |
| 4 | A3: columnConfig.ts:353 (preset) | columnConfig.ts | pass | Exact match |
| 5 | A3: AdminCallsTable.tsx:199-203 (render case) | AdminCallsTable.tsx | warning | Extends to 205, minor |
| 6 | A3: adminCalls.ts:100 (export entry) | adminCalls.ts | pass | Exact match |
| 7 | A3: adminCalls.ts:32 (type field) | lib/types/adminCalls.ts | pass | Exact match |
| 8 | A3: dashboard.ts:312 (CallExportRow) | dashboard.ts | pass | Exact match |
| 9 | A4: Comment at KPIGrid.tsx:136 | KPIGrid.tsx | pass | Exact match |
| 10 | A5: `'score'` format union + case in KPICard.tsx | KPICard.tsx:10,59-60 | pass | Both present |
| 11 | A6: Grid class `lg:grid-cols-6` at KPIGrid.tsx:357 | KPIGrid.tsx | pass | Exact match |
| 12 | A6: Comments at lines 347 and 354 mention "6" | KPIGrid.tsx | pass | Both confirmed |
| 13 | `avg_quality_score` only consumed in KPIGrid | grep .ts/.tsx | pass | Only type def + KPIGrid usage |
| 14 | Validation scripts include `call_quality_score` grep | Plan line 58 | pass | Present |
| 15 | No test files reference quality_score | grep *.test.* | pass | Zero matches |

### Counter-arguments
| # | Argument | Severity | Mitigation |
|---|----------|----------|------------|
| 1 | **A6 grid change breaks Louis/Louis-Nestenn.** The ternary at KPIGrid.tsx:355-358 is shared by `louis`, `louis-nestenn`, AND `overview`. Louis and Louis-Nestenn still have 6 KPIs — changing the shared class to `lg:grid-cols-5` misaligns them. Must split the ternary: overview gets `lg:grid-cols-5`, others keep `lg:grid-cols-6`. | **BLOCKING** | Split ternary into 3 branches: louis/louis-nestenn → `lg:grid-cols-6`, overview → `lg:grid-cols-5`, others → `lg:grid-cols-4` |
| 2 | **`lg:grid-cols-5` may not be in Tailwind's scan.** Class is constructed dynamically in a ternary string. JIT should detect it as a complete literal, but verify at build time. If missing, add to safelist in `tailwind.config.ts`. | **RISK** | Verify with `npm run build`. Add to safelist if needed. |
| 3 | Supabase type regeneration could re-introduce `avg_quality_score` in generated types | MINOR | `KPIPeriod` is manual — not affected. Informational only. |
| 4 | Task ordering: A1 must precede A5 (removes consumer before removing format) | MINOR | Already in correct order. No plan change needed. |

### External Insights
| # | Insight | Source | Impact on plan |
|---|---------|--------|----------------|
| 1 | TS excess property checks only fire on object literals, not API responses — safe to remove type fields while RPC still returns them | TS Handbook / Issues #3755, #48162 | Confirms approach |
| 2 | `grid-cols-5` (5 equal columns) works fine in CSS Grid — 5 items in 5 cols = perfect fit | Tailwind docs, CSS-Tricks | Confirms approach (once ternary is split) |
| 3 | Biome has no switch-exhaustiveness rule — bundling union + case removal in A5 is clean | Biome docs | No lint breakage risk |
| 4 | UI-only removal with data pipeline intact is established best practice for phased refactoring | Engineering consensus | Confirms approach |

### Previous Round Actions
| Action | Status |
|--------|--------|
| Add to A3: `CallExportRow` at dashboard.ts:312 | **Addressed** |
| Add A6: grid `lg:grid-cols-6` → `lg:grid-cols-5`, update comments | **Addressed** (but implementation flawed — see #1) |

### Verdict: **REVISE**

One BLOCKING issue: A6's grid class change is applied to a shared ternary branch that also covers Louis and Louis-Nestenn (which keep 6 KPIs). The ternary must be split so only overview gets `lg:grid-cols-5`.

**Actions applied (all resolved):**
- [x] Fix A6: split the ternary at KPIGrid.tsx:355-358 — overview → `lg:grid-cols-5`, louis/louis-nestenn → `lg:grid-cols-6`, others → `lg:grid-cols-4`. Update comments accordingly.
- [x] Add safelist: `lg:grid-cols-5` to `tailwind.config.ts` safelist (JIT detection insurance)
