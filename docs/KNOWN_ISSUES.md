# Known Issues & Solutions

This document tracks the history of bugs encountered in the Sablia Vox project, along with their root causes and solutions. This helps prevent regression and provides context for future development.

---

## Table of Contents

1. [Bug: RDV Count Incorrect (118 instead of 13)](#bug-rdv-count-incorrect-118-instead-of-13)
2. [Bug: Conversion Rate > 100%](#bug-conversion-rate--100)
3. [Bug: Louis Dashboard Shows Arthur Data](#bug-louis-dashboard-shows-arthur-data)
4. [Bug: Duplicate Keys in Filters](#bug-duplicate-keys-in-filters)

---

## Bug: RDV Count Incorrect (118 instead of 13)

**Status**: ✅ SOLVED

**Date Discovered**: 2024-01-20

**Severity**: 🔴 CRITICAL - Incorrect business metrics

### Problem Description

The dashboard showed **118 RDV (appointments scheduled)** instead of the real **13 RDV**. This represented an 808% error, completely invalidating the KPI metrics and misleading business decisions.

### Root Cause

The `appointment_scheduled` calculated field in `v_agent_calls_enriched` was using the JSONB `?` operator to check for the existence of the `appointment_scheduled_at` key in metadata:

```sql
-- ❌ WRONG CODE
appointment_scheduled = (metadata ? 'appointment_scheduled_at')
```

**Why this is wrong**:
- The `?` operator checks if the **KEY exists**, not if it has a **value**
- Many calls had `metadata.appointment_scheduled_at` set to `null` or empty string
- These calls were incorrectly counted as "appointment scheduled"

**Example of problematic data**:
```json
{
  "outcome": "voicemail",
  "metadata": {
    "appointment_scheduled_at": null  // ← Key exists but value is null
  }
}
```

This call was counted as an appointment because the key existed, even though:
1. The outcome was `voicemail` (not `appointment_scheduled`)
2. The metadata value was `null`

### Solution

Use ONLY the `outcome` field to determine if an appointment was scheduled:

```sql
-- ✅ CORRECT CODE
appointment_scheduled = (outcome = 'appointment_scheduled')
```

**Why this is correct**:
- The `outcome` field is the source of truth for call results
- It's always set correctly by the n8n workflow
- No ambiguity or null values

### Migration Applied

**File**: `supabase/migrations/20240120_fix_appointment_scheduled_logic.sql`

```sql
-- Migration: Fix appointment_scheduled calculation
-- Date: 2024-01-20
-- Author: Claude
--
-- Changes:
-- 1. Changed appointment_scheduled from metadata check to outcome check
-- 2. Removed dependency on metadata.appointment_scheduled_at
-- 3. Now uses ONLY outcome = 'appointment_scheduled'

DROP VIEW IF EXISTS v_agent_calls_enriched;

CREATE VIEW v_agent_calls_enriched AS
SELECT
  ac.*,
  (
    ac.outcome NOT IN (
      'voicemail',
      'call_failed',
      'no_answer',
      'busy',
      'not_available',
      'error'
    )
    AND ac.outcome IS NOT NULL
  ) AS answered,
  (ac.outcome = 'appointment_scheduled') AS appointment_scheduled  -- ✅ CORRECT
FROM agent_calls ac;

GRANT SELECT ON v_agent_calls_enriched TO authenticated;

-- Verification query
-- SELECT COUNT(*) FROM v_agent_calls_enriched WHERE appointment_scheduled = true;
-- Expected: 13 (not 118)
```

### Verification

After migration:
```sql
SELECT COUNT(*) AS appointment_count
FROM v_agent_calls_enriched
WHERE appointment_scheduled = true;

-- Result: 13 ✅ (was 118 ❌)
```

### Lessons Learned

1. **Always use the source of truth** - The `outcome` field is authoritative, not derived metadata
2. **Beware of JSONB operators** - `?` checks key existence, not value truthiness
3. **Test with real data** - Verify calculations against known ground truth
4. **Document assumptions** - Clear comments on why a calculation is done a certain way

### Prevention

- ✅ Added comments in view definition explaining the logic
- ✅ Documented in CLAUDE.md to prevent future mistakes
- ✅ Created verification queries in migration files

---

## Bug: Conversion Rate > 100%

**Status**: ✅ SOLVED

**Date Discovered**: 2024-01-20

**Severity**: 🟠 HIGH - Incorrect business metrics

### Problem Description

The dashboard showed conversion rates of **200%+**, which is mathematically impossible. A conversion rate should always be ≤ 100%.

### Root Cause

The conversion rate formula was dividing appointments by **total calls** instead of **answered calls**:

```sql
-- ❌ WRONG FORMULA
conversion_rate = (appointments / total_calls) × 100
```

**Why this is wrong**:
- If you have 10 total calls, 5 answered, and 8 appointments, you get 80% (seems fine)
- But if you have 10 total calls, 5 answered, and 12 appointments, you get 120% (impossible!)
- The issue is that appointments should be a subset of **answered calls**, not total calls

**Example**:
```
Total Calls: 100
Answered Calls: 50
Appointments: 40

Wrong formula: 40 / 100 = 40% ❌ (misleading)
Correct formula: 40 / 50 = 80% ✅ (accurate)
```

### Solution

Divide appointments by **answered calls** (not total calls):

```sql
-- ✅ CORRECT FORMULA
conversion_rate = (appointments / ANSWERED_calls) × 100
```

**Why this is correct**:
- Appointments can only come from calls that were answered
- Voicemails, errors, etc. should not be in the denominator
- This gives the true "call-to-appointment" conversion rate

### Migration Applied

**File**: `supabase/migrations/20240120_fix_kpi_logic_v2.sql`

```sql
-- Migration: Fix conversion rate calculation
-- Date: 2024-01-20
-- Author: Claude
--
-- Changes:
-- 1. Changed conversion_rate from appointments/total_calls to appointments/answered_calls
-- 2. Added NULLIF to prevent division by zero
-- 3. Now conversion rate can never exceed 100%

DROP FUNCTION IF EXISTS get_kpi_metrics(date, date, uuid, uuid, text);

CREATE FUNCTION get_kpi_metrics(
  p_start_date date,
  p_end_date date,
  p_client_id uuid DEFAULT NULL,
  p_deployment_id uuid DEFAULT NULL,
  p_agent_type_name text DEFAULT NULL
)
RETURNS json AS $$
DECLARE
  v_result json;
BEGIN
  SELECT json_build_object(
    'total_calls', COUNT(*),
    'answered_calls', COUNT(*) FILTER (WHERE answered = true),
    'appointments_scheduled', COUNT(*) FILTER (WHERE appointment_scheduled = true),
    'answer_rate',
      ROUND(
        COUNT(*) FILTER (WHERE answered = true)::numeric /
        NULLIF(COUNT(*), 0) * 100,
        2
      ),
    'conversion_rate',
      ROUND(
        COUNT(*) FILTER (WHERE appointment_scheduled = true)::numeric /
        NULLIF(COUNT(*) FILTER (WHERE answered = true), 0) * 100,  -- ✅ CORRECT
        2
      )
  ) INTO v_result
  FROM v_agent_calls_enriched vac
  JOIN agent_deployments ad ON vac.deployment_id = ad.id
  JOIN agent_types at ON ad.agent_type_id = at.id
  WHERE vac.started_at BETWEEN p_start_date AND p_end_date
    AND (p_agent_type_name IS NULL OR at.name = p_agent_type_name)
    AND (p_client_id IS NULL OR ad.client_id = p_client_id)
    AND (p_deployment_id IS NULL OR vac.deployment_id = p_deployment_id);

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION get_kpi_metrics(date, date, uuid, uuid, text) TO authenticated;

-- Verification query
-- SELECT * FROM get_kpi_metrics('2024-01-01', '2024-01-31', NULL, NULL, 'louis');
-- Expected: conversion_rate <= 100
```

### Verification

After migration:
```sql
SELECT
  COUNT(*) AS total_calls,
  COUNT(*) FILTER (WHERE answered = true) AS answered_calls,
  COUNT(*) FILTER (WHERE appointment_scheduled = true) AS appointments,
  ROUND(
    COUNT(*) FILTER (WHERE appointment_scheduled = true)::numeric /
    NULLIF(COUNT(*) FILTER (WHERE answered = true), 0) * 100,
    2
  ) AS conversion_rate
FROM v_agent_calls_enriched;

-- Result: conversion_rate = 12.46% ✅ (was 200%+ ❌)
```

### Lessons Learned

1. **Understand the denominator** - Always think about what the percentage is "out of"
2. **Validate business logic** - Conversion rates > 100% are a red flag
3. **Use NULLIF** - Prevent division by zero errors
4. **Document formulas** - Clear comments on what each calculation means

### Prevention

- ✅ Added comments in RPC function explaining the formula
- ✅ Documented in CLAUDE.md with "Common Pitfalls to Avoid"
- ✅ Created verification queries in migration files

---

## Bug: Louis Dashboard Shows Arthur Data

**Status**: ✅ SOLVED

**Date Discovered**: 2024-01-20

**Severity**: 🟠 HIGH - Data isolation failure

### Problem Description

The **Louis Dashboard** (`/dashboard/louis`) was displaying data from **Arthur agents**, mixing the two agent types and showing incorrect metrics.

### Root Cause

The RPC functions (`get_kpi_metrics`, `get_chart_data`) were not filtering by `agent_type_name`. They returned data for ALL agent types, regardless of which dashboard was being viewed.

```typescript
// ❌ WRONG CODE (frontend)
const { data } = await supabase.rpc('get_kpi_metrics', {
  p_start_date: filters.startDate,
  p_end_date: filters.endDate,
  p_client_id: filters.clientId || null,
  p_deployment_id: filters.deploymentId || null,
  // ❌ Missing p_agent_type_name parameter!
});
```

```sql
-- ❌ WRONG CODE (SQL)
-- Function didn't have p_agent_type_name parameter
CREATE FUNCTION get_kpi_metrics(
  p_start_date date,
  p_end_date date,
  p_client_id uuid DEFAULT NULL,
  p_deployment_id uuid DEFAULT NULL
  -- ❌ Missing p_agent_type_name parameter!
)
```

### Solution

1. **Add `p_agent_type_name` parameter** to all RPC functions
2. **Filter by agent type** in the WHERE clause
3. **Pass agent type from frontend** when calling RPC

```typescript
// ✅ CORRECT CODE (frontend)
const { data } = await supabase.rpc('get_kpi_metrics', {
  p_start_date: filters.startDate,
  p_end_date: filters.endDate,
  p_client_id: filters.clientId || null,
  p_deployment_id: filters.deploymentId || null,
  p_agent_type_name: 'louis',  // ✅ CRITICAL: Filters by agent type
});
```

```sql
-- ✅ CORRECT CODE (SQL)
CREATE FUNCTION get_kpi_metrics(
  p_start_date date,
  p_end_date date,
  p_client_id uuid DEFAULT NULL,
  p_deployment_id uuid DEFAULT NULL,
  p_agent_type_name text DEFAULT NULL  -- ✅ Added parameter
)
RETURNS json AS $$
BEGIN
  SELECT json_build_object(...)
  FROM v_agent_calls_enriched vac
  JOIN agent_deployments ad ON vac.deployment_id = ad.id
  JOIN agent_types at ON ad.agent_type_id = at.id
  WHERE vac.started_at BETWEEN p_start_date AND p_end_date
    AND (p_agent_type_name IS NULL OR at.name = p_agent_type_name)  -- ✅ Filter by agent type
    -- ... other filters
END;
$$ LANGUAGE plpgsql;
```

### Migration Applied

**File**: `supabase/migrations/20240120_add_agent_type_filter_to_kpi_functions.sql`

```sql
-- Migration: Add agent_type_name filter to KPI functions
-- Date: 2024-01-20
-- Author: Claude
--
-- Changes:
-- 1. Added p_agent_type_name parameter to get_kpi_metrics()
-- 2. Added p_agent_type_name parameter to get_chart_data()
-- 3. Added WHERE clause to filter by agent type
-- 4. Now Louis dashboard shows ONLY Louis data, Arthur shows ONLY Arthur data

-- Drop existing functions
DROP FUNCTION IF EXISTS get_kpi_metrics(date, date, uuid, uuid);
DROP FUNCTION IF EXISTS get_chart_data(date, date, uuid, uuid);

-- Recreate with agent_type_name parameter
CREATE FUNCTION get_kpi_metrics(
  p_start_date date,
  p_end_date date,
  p_client_id uuid DEFAULT NULL,
  p_deployment_id uuid DEFAULT NULL,
  p_agent_type_name text DEFAULT NULL
)
RETURNS json AS $$
-- ... (implementation with filter)
$$ LANGUAGE plpgsql;

CREATE FUNCTION get_chart_data(
  p_start_date date,
  p_end_date date,
  p_client_id uuid DEFAULT NULL,
  p_deployment_id uuid DEFAULT NULL,
  p_agent_type_name text DEFAULT NULL
)
RETURNS json AS $$
-- ... (implementation with filter)
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION get_kpi_metrics(date, date, uuid, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_chart_data(date, date, uuid, uuid, text) TO authenticated;

-- Verification queries
-- SELECT * FROM get_kpi_metrics('2024-01-01', '2024-01-31', NULL, NULL, 'louis');
-- Should return ONLY Louis data
```

### Verification

After migration:
```sql
-- Verify Louis data
SELECT * FROM get_kpi_metrics('2024-01-01', '2024-01-31', NULL, NULL, 'louis');
-- Result: Contains only calls from Louis agents ✅

-- Verify Arthur data
SELECT * FROM get_kpi_metrics('2024-01-01', '2024-01-31', NULL, NULL, 'arthur');
-- Result: Contains only calls from Arthur agents ✅
```

### Lessons Learned

1. **Agent isolation is critical** - Each dashboard should only show data for its agent type
2. **Always filter by agent type** - When querying agent_calls, JOIN to agent_types and filter
3. **Test with mixed data** - Have both Louis and Arthur data to verify isolation
4. **Parameter validation** - Ensure frontend always passes required parameters

### Prevention

- ✅ Added `p_agent_type_name` to all dashboard RPC functions
- ✅ Documented in CLAUDE.md: "MUST pass p_agent_type_name to all RPC calls"
- ✅ Created verification queries for each agent type

---

## Bug: Duplicate Keys in Filters

**Status**: ✅ SOLVED

**Date Discovered**: 2024-01-21

**Severity**: 🟡 MEDIUM - React errors

### Problem Description

React was throwing console errors about **duplicate keys** in the ClientAgentFilter component:

```
Warning: Encountered two children with the same key, `uuid-123`.
Keys should be unique so that components maintain their identity across updates.
```

This didn't break functionality but polluted the console and indicated a data quality issue.

### Root Cause

The database views (`v_user_accessible_agents`) were returning **duplicate rows** for some agent deployments. This happened when:
1. Multiple JOINs created cartesian products
2. RLS policies were applied inconsistently
3. User had multiple permission levels for the same client

**Example problematic query**:
```sql
-- ❌ Returns duplicates
SELECT ad.*
FROM agent_deployments ad
JOIN user_client_permissions ucp1 ON ad.client_id = ucp1.client_id
JOIN user_client_permissions ucp2 ON ad.client_id = ucp2.client_id
WHERE ucp1.user_id = auth.uid()
  AND ucp2.user_id = auth.uid();

-- Result: Same deployment appears twice if user has 2 permission records
```

### Solution

**Option 1: Fix in SQL** (preferred for performance)
```sql
-- ✅ CORRECT: Use DISTINCT
SELECT DISTINCT ad.*
FROM agent_deployments ad
JOIN user_client_permissions ucp ON ad.client_id = ucp.client_id
WHERE ucp.user_id = auth.uid();
```

**Option 2: Fix in Frontend** (quick fix)
```typescript
// ✅ CORRECT: Deduplicate in frontend
const uniqueAgents = agents.reduce((acc, agent) => {
  if (!acc.find(a => a.id === agent.id)) {
    acc.push(agent);
  }
  return acc;
}, [] as Agent[]);
```

### Implementation

We used **Option 2** (frontend deduplication) for immediate fix:

**File**: `components/dashboard/Filters/ClientAgentFilter.tsx`

```typescript
// Deduplicate agents to avoid React duplicate key errors
const uniqueAgents = useMemo(() => {
  return agents.reduce((acc, agent) => {
    if (!acc.find(a => a.id === agent.id)) {
      acc.push(agent);
    }
    return acc;
  }, [] as Agent[]);
}, [agents]);

// Use uniqueAgents in the select options
{uniqueAgents.map(agent => (
  <option key={agent.id} value={agent.id}>
    {agent.name} - {agent.client_name}
  </option>
))}
```

### Verification

After fix:
```
Console: No more duplicate key warnings ✅
UI: Filter dropdown works correctly ✅
```

### Lessons Learned

1. **Check for duplicates** - Use DISTINCT or deduplicate when JOINing multiple tables
2. **RLS can create duplicates** - Multiple permission records can cause cartesian products
3. **Frontend as safety net** - Even if SQL is fixed, frontend deduplication prevents issues
4. **Use useMemo** - Deduplicate once and cache the result

### Prevention

- ✅ Added deduplication logic in frontend filters
- ✅ Documented in CLAUDE.md: "Properly deduplicated to avoid React duplicate key errors"
- ✅ Consider updating views with DISTINCT in future migration

---

## Common Patterns & Anti-Patterns

### Anti-Pattern: Metadata Key Checks

**❌ WRONG**:
```sql
-- Checks if KEY exists, not if value is truthy
WHERE metadata ? 'appointment_scheduled_at'
```

**✅ CORRECT**:
```sql
-- Use the source of truth field
WHERE outcome = 'appointment_scheduled'
```

### Anti-Pattern: Wrong Denominator

**❌ WRONG**:
```sql
-- Conversion rate can exceed 100%
conversion_rate = (appointments / total_calls) × 100
```

**✅ CORRECT**:
```sql
-- Conversion rate is always <= 100%
conversion_rate = (appointments / answered_calls) × 100
```

### Anti-Pattern: Missing Agent Type Filter

**❌ WRONG**:
```typescript
// Returns data for ALL agent types
supabase.rpc('get_kpi_metrics', { ...filters });
```

**✅ CORRECT**:
```typescript
// Returns data ONLY for Louis
supabase.rpc('get_kpi_metrics', {
  ...filters,
  p_agent_type_name: 'louis',
});
```

### Anti-Pattern: No Deduplication

**❌ WRONG**:
```typescript
// May contain duplicates
agents.map(agent => <option key={agent.id}>{agent.name}</option>)
```

**✅ CORRECT**:
```typescript
// Deduplicate first
const uniqueAgents = agents.reduce((acc, agent) => {
  if (!acc.find(a => a.id === agent.id)) acc.push(agent);
  return acc;
}, []);
uniqueAgents.map(agent => <option key={agent.id}>{agent.name}</option>)
```

---

## Testing Checklist

When making changes to KPI calculations or dashboard queries:

- [ ] Verify total_calls matches database count
- [ ] Verify answered_calls ≤ total_calls
- [ ] Verify appointments ≤ answered_calls
- [ ] Verify answer_rate ≤ 100%
- [ ] Verify conversion_rate ≤ 100%
- [ ] Verify Louis dashboard shows ONLY Louis data
- [ ] Verify Arthur dashboard shows ONLY Arthur data
- [ ] Check console for duplicate key warnings
- [ ] Test with filters (date range, client, agent)
- [ ] Test with empty data (no division by zero errors)

---

## Related Documentation

- **CLAUDE.md**: Main documentation with critical rules
- **Database Reference**: `docs/DATABASE_REFERENCE.md` - Complete schema
- **Dashboard Architecture**: `features/Dashboard/ARCHITECTURE.md` - Dashboard structure and data flow
