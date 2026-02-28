# Database Reference - Complete Schema

This document provides a comprehensive reference for the Sablia Vox database schema, including all tables, views, functions, and their relationships.

---

## Database Environments

### Production Database (`mcp__supabase-vox__*`)

- **Purpose**: Live production data used by real customers
- **Access**: Read-only for Claude
- **Modifications**: Via migration files only (executed manually by user)

### Staging Database (`mcp__supabase-staging__*`)

- **Purpose**: Testing and development environment
- **Access**: Full read/write for Claude
- **Modifications**: Direct SQL execution allowed

---

## Core Tables

### `agent_calls`

Main table storing all call data from AI voice agents.

**Columns**:

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID | NO | Primary key |
| `deployment_id` | UUID | NO | Links to `agent_deployments` |
| `started_at` | TIMESTAMP | NO | Call start time |
| `ended_at` | TIMESTAMP | YES | Call end time |
| `outcome` | TEXT | YES | Call result (lowercase) |
| `duration_seconds` | NUMERIC | YES | Call duration in seconds |
| `cost` | NUMERIC | YES | Call cost in EUR |
| `metadata` | JSONB | YES | Additional call metadata |
| `first_name` | TEXT | YES | Contact first name |
| `last_name` | TEXT | YES | Contact last name |
| `phone_number` | TEXT | YES | Contact phone number |
| `email` | TEXT | YES | Contact email |
| `emotion` | TEXT | YES | Detected emotion |
| `created_at` | TIMESTAMP | NO | Record creation timestamp |
| `updated_at` | TIMESTAMP | NO | Record update timestamp |

**Indexes**:
```sql
CREATE INDEX idx_agent_calls_deployment_id ON agent_calls(deployment_id);
CREATE INDEX idx_agent_calls_started_at ON agent_calls(started_at);
CREATE INDEX idx_agent_calls_outcome ON agent_calls(outcome);
```

**Outcome Values** (lowercase):
- `'appointment_scheduled'` - RDV pris
- `'appointment_refused'` - RDV refusé
- `'voicemail'` - Messagerie
- `'not_interested'` - Pas intéressé
- `'callback_requested'` - Rappel demandé
- `'too_short'` - Appel trop court
- `'call_failed'` - Échec d'appel
- `'no_answer'` - Pas de réponse
- `'busy'` - Occupé
- `'not_available'` - Non disponible
- `'error'` - Erreur système

**Emotion Values**:
- `'positive'` - Émotion positive
- `'neutral'` - Émotion neutre
- `'negative'` - Émotion négative
- `'unknown'` - Émotion inconnue/non détectée

**Metadata Fields** (JSONB):
```json
{
  "appointment_scheduled_at": "2024-01-15T10:30:00Z",
  "appointment_location": "Bureau client",
  "appointment_notes": "Appel de suivi nécessaire",
  "call_recording_url": "https://...",
  "transcript": "Bonjour, je suis Louis...",
  "sentiment_score": 0.85,
  "custom_field_1": "value1",
  "custom_field_2": "value2"
}
```

---

### `agent_deployments`

Agent instances deployed for clients. Each client can have multiple deployments of the same or different agent types.

**Columns**:

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID | NO | Primary key |
| `name` | TEXT | NO | Deployment name |
| `slug` | TEXT | YES | URL-friendly identifier |
| `client_id` | UUID | NO | Links to `clients` table |
| `agent_type_id` | UUID | NO | Links to `agent_types` table |
| `status` | TEXT | NO | Deployment status |
| `config` | JSONB | YES | Agent configuration |
| `created_at` | TIMESTAMP | NO | Record creation timestamp |
| `updated_at` | TIMESTAMP | NO | Record update timestamp |

**Indexes**:
```sql
CREATE INDEX idx_agent_deployments_client_id ON agent_deployments(client_id);
CREATE INDEX idx_agent_deployments_agent_type_id ON agent_deployments(agent_type_id);
CREATE INDEX idx_agent_deployments_status ON agent_deployments(status);
```

**Status Values**:
- `'active'` - Deployment is active and running
- `'paused'` - Deployment is temporarily paused
- `'archived'` - Deployment is archived (no longer in use)

**Config Fields** (JSONB):
```json
{
  "voice_id": "fr-FR-Standard-A",
  "max_calls_per_day": 100,
  "working_hours": {
    "start": "09:00",
    "end": "18:00"
  },
  "custom_prompts": {
    "greeting": "Bonjour, je suis Louis...",
    "closing": "Merci et à bientôt !"
  }
}
```

---

### `agent_types`

Types of AI agents (Louis, Arthur, Alexandra).

**Columns**:

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID | NO | Primary key |
| `name` | TEXT | NO | Agent type name (lowercase) |
| `display_name` | TEXT | NO | Agent display name |
| `description` | TEXT | YES | Agent description |
| `status` | TEXT | NO | Agent type status |
| `created_at` | TIMESTAMP | NO | Record creation timestamp |
| `updated_at` | TIMESTAMP | NO | Record update timestamp |

**Agent Types**:

| Name | Display Name | Description |
|------|--------------|-------------|
| `louis` | Louis | Rappel automatique / Reminders |
| `arthur` | Arthur | Réactivation clients / Reactivation |
| `alexandra` | Alexandra | Réception 24/7 / Reception |

**Status Values**:
- `'active'` - Agent type is active and available
- `'inactive'` - Agent type is inactive (not available for new deployments)

---

### `clients`

Customer companies using Sablia Vox agents.

**Columns**:

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID | NO | Primary key |
| `name` | TEXT | NO | Company name |
| `industry` | TEXT | YES | Industry sector |
| `status` | TEXT | NO | Client status |
| `created_at` | TIMESTAMP | NO | Record creation timestamp |
| `updated_at` | TIMESTAMP | NO | Record update timestamp |

**Industry Values** (examples):
- `'real_estate'` - Immobilier
- `'automotive'` - Automobile
- `'insurance'` - Assurance
- `'retail'` - Commerce de détail
- `'saas'` - SaaS/Logiciel
- `'other'` - Autre

**Status Values**:
- `'active'` - Client is active
- `'inactive'` - Client is inactive
- `'trial'` - Client is in trial period

---

### `user_client_permissions`

Row Level Security (RLS) permissions mapping. Links users to clients they can access.

**Columns**:

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID | NO | Primary key |
| `user_id` | UUID | NO | Links to `auth.users` |
| `client_id` | UUID | NO | Links to `clients` |
| `permission_level` | TEXT | NO | Permission level |
| `created_at` | TIMESTAMP | NO | Record creation timestamp |
| `updated_at` | TIMESTAMP | NO | Record update timestamp |

**Permission Levels**:
- `'read'` - Read-only access (view dashboards)
- `'write'` - Read/write access (view + modify deployments)
- `'admin'` - Full access (view + modify + delete)

**RLS Policies**:
- Users can only see clients they have permissions for
- Users can only see agent deployments belonging to their accessible clients
- Users can only see agent calls from their accessible deployments

---

## Enriched Views

### `v_agent_calls_enriched`

Main view with calculated fields for easier querying. Used by all dashboard queries.

**Base Query**:
```sql
CREATE VIEW v_agent_calls_enriched AS
SELECT
  ac.*,
  -- Calculated boolean fields
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
  (ac.outcome = 'appointment_scheduled') AS appointment_scheduled
FROM agent_calls ac;
```

**Calculated Fields**:

| Field | Type | Description | Calculation |
|-------|------|-------------|-------------|
| `answered` | BOOLEAN | Call was answered (NOT voicemail/error) | `outcome NOT IN ('voicemail', 'call_failed', ...) AND outcome IS NOT NULL` |
| `appointment_scheduled` | BOOLEAN | RDV was scheduled | `outcome = 'appointment_scheduled'` |

**CRITICAL**: Do NOT use `metadata ? 'appointment_scheduled_at'` to check for appointments!
- The `?` operator checks if the **KEY exists**, not if it has a **value**
- This caused the bug where 118 voicemail calls were counted as RDV instead of the real 13

**Correct Usage**:
```sql
-- ✅ CORRECT
WHERE appointment_scheduled = true

-- ❌ WRONG (checks key existence, not value)
WHERE metadata ? 'appointment_scheduled_at'
```

---

### `v_user_accessible_clients`

Clients accessible by the authenticated user (RLS applied).

**Base Query**:
```sql
CREATE VIEW v_user_accessible_clients AS
SELECT c.*
FROM clients c
JOIN user_client_permissions ucp ON c.id = ucp.client_id
WHERE ucp.user_id = auth.uid();
```

**Usage**:
```sql
-- Get all clients accessible by current user
SELECT * FROM v_user_accessible_clients;
```

---

### `v_user_accessible_agents`

Agent deployments accessible by the authenticated user (RLS applied).

**Base Query**:
```sql
CREATE VIEW v_user_accessible_agents AS
SELECT ad.*
FROM agent_deployments ad
JOIN user_client_permissions ucp ON ad.client_id = ucp.client_id
WHERE ucp.user_id = auth.uid();
```

**Usage**:
```sql
-- Get all agent deployments accessible by current user
SELECT * FROM v_user_accessible_agents;
```

---

## RPC Functions

### `get_kpi_metrics(...)`

Returns KPI metrics with current vs previous period comparison.

**Signature**:
```sql
CREATE FUNCTION get_kpi_metrics(
  p_start_date DATE,
  p_end_date DATE,
  p_client_id UUID DEFAULT NULL,
  p_deployment_id UUID DEFAULT NULL,
  p_agent_type_name TEXT DEFAULT NULL
) RETURNS JSON
```

**Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `p_start_date` | DATE | YES | Start date of period |
| `p_end_date` | DATE | YES | End date of period |
| `p_client_id` | UUID | NO | Filter by specific client |
| `p_deployment_id` | UUID | NO | Filter by specific deployment |
| `p_agent_type_name` | TEXT | NO | Filter by agent type (louis, arthur, alexandra) |

**Returns**:
```json
{
  "total_calls": 1234,
  "answered_calls": 987,
  "appointments_scheduled": 123,
  "voicemails": 200,
  "answer_rate": 80.06,
  "conversion_rate": 12.46,
  "avg_duration_seconds": 185.5,
  "total_cost": 1234.56,
  "cost_per_appointment": 10.04,
  "previous_total_calls": 1100,
  "previous_answered_calls": 850,
  "previous_appointments_scheduled": 100,
  "previous_answer_rate": 77.27,
  "previous_conversion_rate": 11.76
}
```

**Critical Formulas**:
```sql
-- Answer Rate = (answered_calls / total_calls) × 100
answer_rate = (answered_calls::float / NULLIF(total_calls, 0) * 100)::numeric(10,2)

-- Conversion Rate = (appointments / ANSWERED_calls) × 100 (NOT total_calls!)
conversion_rate = (appointments::float / NULLIF(answered_calls, 0) * 100)::numeric(10,2)

-- Cost per Appointment = total_cost / appointments
cost_per_appointment = (total_cost::float / NULLIF(appointments, 0))::numeric(10,2)
```

**Usage**:
```typescript
const { data } = await supabase.rpc('get_kpi_metrics', {
  p_start_date: '2024-01-01',
  p_end_date: '2024-01-31',
  p_client_id: null,
  p_deployment_id: null,
  p_agent_type_name: 'louis', // ← CRITICAL: Filters by agent type
});
```

---

### `get_chart_data(...)`

Returns chart data (call volume, outcomes, emotions, voicemail by agent).

**Signature**:
```sql
CREATE FUNCTION get_chart_data(
  p_start_date DATE,
  p_end_date DATE,
  p_client_id UUID DEFAULT NULL,
  p_deployment_id UUID DEFAULT NULL,
  p_agent_type_name TEXT DEFAULT NULL
) RETURNS JSON
```

**Parameters**: Same as `get_kpi_metrics(...)`

**Returns**:
```json
{
  "call_volume_by_day": [
    {
      "date": "2024-01-01",
      "total_calls": 50,
      "answered_calls": 40,
      "appointments": 5
    },
    // ... more days
  ],
  "outcome_distribution": [
    {
      "outcome": "appointment_scheduled",
      "count": 123
    },
    {
      "outcome": "voicemail",
      "count": 200
    },
    // ... more outcomes
  ],
  "emotion_distribution": [
    {
      "emotion": "positive",
      "count": 300
    },
    {
      "emotion": "neutral",
      "count": 500
    },
    {
      "emotion": "negative",
      "count": 100
    },
    {
      "emotion": "unknown",
      "count": 334
    }
  ],
  "voicemail_by_agent": [
    {
      "deployment_name": "Louis - Norloc",
      "voicemail_count": 50,
      "total_calls": 200,
      "voicemail_rate": 25.0
    },
    // ... more deployments
  ]
}
```

---

### `get_agent_type_cards_data(...)`

Aggregates metrics by agent TYPE (one card for all Louis, one for all Arthur, etc.).

**Signature**:
```sql
CREATE FUNCTION get_agent_type_cards_data(
  p_start_date DATE,
  p_end_date DATE,
  p_client_ids UUID[] DEFAULT NULL
) RETURNS JSON
```

**Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `p_start_date` | DATE | YES | Start date of period |
| `p_end_date` | DATE | YES | End date of period |
| `p_client_ids` | UUID[] | NO | Filter by specific clients (array) |

**Returns**:
```json
[
  {
    "agent_type_name": "louis",
    "agent_type_display_name": "Louis",
    "total_calls": 1234,
    "answered_calls": 987,
    "appointments_scheduled": 123,
    "answer_rate": 80.06,
    "conversion_rate": 12.46
  },
  {
    "agent_type_name": "arthur",
    "agent_type_display_name": "Arthur",
    "total_calls": 567,
    "answered_calls": 450,
    "appointments_scheduled": 50,
    "answer_rate": 79.36,
    "conversion_rate": 11.11
  }
]
```

**Usage**: Used in Global Dashboard to show aggregate cards by agent type.

---

### `get_client_cards_data(...)`

Aggregates metrics by CLIENT (one card per company).

**Signature**:
```sql
CREATE FUNCTION get_client_cards_data(
  p_start_date DATE,
  p_end_date DATE
) RETURNS JSON
```

**Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `p_start_date` | DATE | YES | Start date of period |
| `p_end_date` | DATE | YES | End date of period |

**Returns**:
```json
[
  {
    "client_id": "uuid-1",
    "client_name": "Norloc",
    "total_calls": 1234,
    "answered_calls": 987,
    "appointments_scheduled": 123,
    "answer_rate": 80.06,
    "conversion_rate": 12.46
  },
  {
    "client_id": "uuid-2",
    "client_name": "Stefano Design",
    "total_calls": 567,
    "answered_calls": 450,
    "appointments_scheduled": 50,
    "answer_rate": 79.36,
    "conversion_rate": 11.11
  }
]
```

**Usage**: Used in Global Dashboard to show aggregate cards by client.

---

## Data Relationships

### Entity Relationship Diagram

```
┌─────────────┐
│ auth.users  │
└──────┬──────┘
       │
       │ 1:N
       │
┌──────▼──────────────────┐
│ user_client_permissions │
└──────┬──────────────────┘
       │
       │ N:1
       │
┌──────▼──────┐       ┌──────────────┐
│   clients   │◄──────┤ agent_types  │
└──────┬──────┘  1:N  └──────┬───────┘
       │                      │
       │ 1:N                  │ 1:N
       │                      │
┌──────▼──────────────────────▼────┐
│      agent_deployments            │
└──────┬───────────────────────────┘
       │
       │ 1:N
       │
┌──────▼──────┐
│ agent_calls │
└─────────────┘
```

### Relationships Explained

**`auth.users` → `user_client_permissions`** (1:N)
- One user can have permissions for multiple clients

**`user_client_permissions` → `clients`** (N:1)
- Multiple permission records can point to the same client

**`clients` → `agent_deployments`** (1:N)
- One client can have multiple agent deployments

**`agent_types` → `agent_deployments`** (1:N)
- One agent type can have multiple deployments across different clients

**`agent_deployments` → `agent_calls`** (1:N)
- One deployment can have many calls

---

## Common Queries

### Get All Calls for Louis in January 2024

```sql
SELECT *
FROM v_agent_calls_enriched vac
JOIN agent_deployments ad ON vac.deployment_id = ad.id
JOIN agent_types at ON ad.agent_type_id = at.id
WHERE at.name = 'louis'
  AND vac.started_at BETWEEN '2024-01-01' AND '2024-01-31'
ORDER BY vac.started_at DESC;
```

### Calculate KPIs Manually

```sql
SELECT
  COUNT(*) AS total_calls,
  COUNT(*) FILTER (WHERE answered = true) AS answered_calls,
  COUNT(*) FILTER (WHERE appointment_scheduled = true) AS appointments,
  ROUND(
    COUNT(*) FILTER (WHERE answered = true)::numeric /
    NULLIF(COUNT(*), 0) * 100,
    2
  ) AS answer_rate,
  ROUND(
    COUNT(*) FILTER (WHERE appointment_scheduled = true)::numeric /
    NULLIF(COUNT(*) FILTER (WHERE answered = true), 0) * 100,
    2
  ) AS conversion_rate
FROM v_agent_calls_enriched vac
JOIN agent_deployments ad ON vac.deployment_id = ad.id
JOIN agent_types at ON ad.agent_type_id = at.id
WHERE at.name = 'louis'
  AND vac.started_at BETWEEN '2024-01-01' AND '2024-01-31';
```

### Get Accessible Clients for Current User

```sql
-- Via view (RLS applied automatically)
SELECT * FROM v_user_accessible_clients;

-- Via JOIN
SELECT c.*
FROM clients c
JOIN user_client_permissions ucp ON c.id = ucp.client_id
WHERE ucp.user_id = auth.uid();
```

### Get Call Volume by Day

```sql
SELECT
  DATE(started_at) AS date,
  COUNT(*) AS total_calls,
  COUNT(*) FILTER (WHERE answered = true) AS answered_calls,
  COUNT(*) FILTER (WHERE appointment_scheduled = true) AS appointments
FROM v_agent_calls_enriched vac
JOIN agent_deployments ad ON vac.deployment_id = ad.id
JOIN agent_types at ON ad.agent_type_id = at.id
WHERE at.name = 'louis'
  AND vac.started_at BETWEEN '2024-01-01' AND '2024-01-31'
GROUP BY DATE(started_at)
ORDER BY DATE(started_at);
```

---

## Migration Best Practices

### Creating Migrations

1. **Always use migration files** - Never ask user to run SQL directly
2. **Use descriptive filenames** - Format: `YYYYMMDD_description.sql`
3. **Include DROP IF EXISTS** - Prevent "function is not unique" errors
4. **Add comments** - Explain what changed and why
5. **Test queries** - Include verification queries at the bottom

### Migration Template

```sql
-- Migration: [Description]
-- Date: YYYY-MM-DD
-- Author: Claude
--
-- Changes:
-- 1. What was changed
-- 2. Why it was changed
-- 3. Expected impact

-- Drop existing functions/views if they exist
DROP FUNCTION IF EXISTS function_name(arg_types);
DROP VIEW IF EXISTS view_name;

-- Create/replace objects
CREATE OR REPLACE VIEW view_name AS ...;
CREATE FUNCTION function_name(...) ...;

-- Grant permissions
GRANT SELECT ON view_name TO authenticated;
GRANT EXECUTE ON FUNCTION function_name(...) TO authenticated;

-- Verification queries (commented out)
-- SELECT * FROM view_name LIMIT 10;
```

---

## Related Documentation

- **Dashboard Architecture**: `features/Dashboard/ARCHITECTURE.md` - Complete dashboard data flow
- **Known Issues**: `docs/KNOWN_ISSUES.md` - Bug history and solutions
- **CLAUDE.md**: Root-level documentation with critical rules and workflows
