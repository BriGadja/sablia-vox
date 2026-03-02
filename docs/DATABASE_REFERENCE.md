# Database Reference — Complete Schema

> Comprehensive reference for the Sablia Vox database. Last updated: 2026-03-02.

---

## Environments

| Environment | MCP Tools | Access |
|-------------|-----------|--------|
| Production | `mcp__supabase-vox__*` | Read-only for Claude |
| Staging | `mcp__supabase-staging__*` | Full access |

**Workflow**: Develop in staging → Generate migration file → Brice executes in production.

---

## Entity Relationships

```
auth.users
  └─1:N─► user_client_permissions ◄─N:1─► clients
                                            └─1:N─► agent_deployments ◄─N:1─► agent_types
                                                      ├─1:N─► agent_calls
                                                      ├─1:N─► agent_sms
                                                      └─1:N─► agent_emails
```

---

## Tables

### `agent_calls`

Main table storing all call data from AI voice agents.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID | NO | Primary key |
| `deployment_id` | UUID | NO | FK → `agent_deployments.id` |
| `started_at` | TIMESTAMPTZ | NO | Call start time |
| `ended_at` | TIMESTAMPTZ | YES | Call end time |
| `duration_seconds` | NUMERIC | YES | Call duration |
| `phone_number` | TEXT | YES | Contact phone |
| `first_name` | TEXT | YES | Contact first name |
| `last_name` | TEXT | YES | Contact last name |
| `email` | TEXT | YES | Contact email |
| `outcome` | TEXT | YES | Call result (lowercase) |
| `call_status` | TEXT | YES | Legacy — trigger syncs to `outcome` |
| `emotion` | TEXT | YES | Detected emotion |
| `sentiment_analysis` | TEXT | YES | Legacy — trigger syncs to `emotion` |
| `call_quality_score` | NUMERIC | YES | 0–100 quality score from Dipler |
| `call_quality_analysis` | TEXT | YES | Detailed text quality analysis |
| `total_cost` | NUMERIC | YES | Provider cost (EUR) |
| `stt_cost` | NUMERIC | YES | STT component cost |
| `tts_cost` | NUMERIC | YES | TTS component cost |
| `llm_cost` | NUMERIC | YES | LLM component cost |
| `telecom_cost` | NUMERIC | YES | Telecom component cost |
| `dipler_commission` | NUMERIC | YES | Dipler platform commission |
| `client_rate_per_min` | NUMERIC | YES | Snapshot of deployment cost_per_min at call time |
| `billed_cost` | NUMERIC | YES | Auto-computed: `(duration_seconds/60) * client_rate_per_min` |
| `avg_llm_latency_ms` | NUMERIC(10,2) | YES | Average LLM latency |
| `min_llm_latency_ms` | INTEGER | YES | Min LLM latency |
| `max_llm_latency_ms` | INTEGER | YES | Max LLM latency |
| `avg_tts_latency_ms` | NUMERIC(10,2) | YES | Average TTS latency |
| `min_tts_latency_ms` | INTEGER | YES | Min TTS latency |
| `max_tts_latency_ms` | INTEGER | YES | Max TTS latency |
| `avg_total_latency_ms` | NUMERIC(10,2) | YES | Average total latency |
| `min_total_latency_ms` | INTEGER | YES | Min total latency |
| `max_total_latency_ms` | INTEGER | YES | Max total latency |
| `conversation_id` | TEXT | YES | External conversation ID |
| `call_sid` | TEXT | YES | Twilio Call SID |
| `llm_model` | TEXT | YES | LLM model used |
| `tts_provider` | TEXT | YES | TTS provider name |
| `stt_provider` | TEXT | YES | STT provider name |
| `direction` | TEXT | YES | `inbound` or `outbound` |
| `recording_url` | TEXT | YES | Call recording URL |
| `transcript` | TEXT | YES | Full transcript |
| `transcript_summary` | TEXT | YES | AI-generated summary |
| `metadata` | JSONB | YES | Flexible data (appointment times, latencies, etc.) |
| `created_at` | TIMESTAMPTZ | NO | Record creation |
| `updated_at` | TIMESTAMPTZ | NO | Record update |

**Outcome Values** (lowercase):
`appointment_scheduled`, `appointment_refused`, `voicemail`, `not_interested`, `callback_requested`, `too_short`, `call_failed`, `no_answer`, `busy`, `not_available`, `invalid_number`, `do_not_call`, `error`, `canceled`, `rejected`

**Emotion Values**: `positive`, `neutral`, `negative`, `unknown`

**Triggers**:
- `trg_sync_outcome_emotion` — BEFORE INSERT/UPDATE: copies `call_status` → `outcome` and `sentiment_analysis` → `emotion` if target columns are empty
- `trigger_set_agent_call_billing` — BEFORE INSERT/UPDATE of `duration_seconds`/`client_rate_per_min`: auto-computes billing fields

**Indexes**:
```sql
idx_agent_calls_deployment_id          (deployment_id)
idx_agent_calls_started_at             (started_at)
idx_agent_calls_outcome                (outcome)
idx_agent_calls_deployment_started_at  (deployment_id, started_at DESC)
idx_agent_calls_avg_llm_latency        (partial, NOT NULL)
idx_agent_calls_avg_tts_latency        (partial, NOT NULL)
idx_agent_calls_started_latency        (started_at DESC, deployment_id, partial)
idx_agent_calls_billing_lookup         (deployment_id, started_at, partial duration > 0)
idx_agent_calls_quality_analysis_fts   (GIN full-text, French, partial)
idx_agent_calls_has_analysis           (started_at DESC, partial)
idx_agent_calls_metadata_appointment   (GIN on metadata->'appointment_scheduled_at')
```

---

### `agent_deployments`

Agent instances deployed per client.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID | NO | Primary key |
| `name` | TEXT | NO | Deployment name |
| `slug` | TEXT | YES | URL-friendly identifier |
| `client_id` | UUID | NO | FK → `clients.id` |
| `agent_type_id` | UUID | NO | FK → `agent_types.id` |
| `status` | TEXT | NO | `active`, `paused`, `archived` |
| `config` | JSONB | YES | Agent configuration |
| `leasing` | NUMERIC | YES | Monthly subscription fee (EUR) |
| `cost_per_min` | NUMERIC | YES | Price per minute (EUR) |
| `cost_per_sms` | NUMERIC | YES | Price per SMS (EUR) |
| `cost_per_email` | NUMERIC(10,4) | YES | Price per email (EUR), default 0 |
| `deployed_at` | TIMESTAMPTZ | YES | First deployment date |
| `created_at` | TIMESTAMPTZ | NO | Record creation |
| `updated_at` | TIMESTAMPTZ | NO | Record update |

---

### `agent_types`

Types of AI agents.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID | NO | Primary key |
| `name` | TEXT | NO | Lowercase: `louis`, `arthur`, `alexandra` |
| `display_name` | TEXT | NO | Display: `Louis`, `Arthur`, `Alexandra` |
| `description` | TEXT | YES | Agent description |
| `status` | TEXT | NO | `active`, `inactive` |
| `created_at` | TIMESTAMPTZ | NO | Record creation |
| `updated_at` | TIMESTAMPTZ | NO | Record update |

---

### `clients`

Customer companies.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID | NO | Primary key |
| `name` | TEXT | NO | Company name |
| `industry` | TEXT | YES | Industry sector |
| `webhook_url` | TEXT | YES | Client webhook URL |
| `status` | TEXT | NO | `active`, `inactive`, `trial` |
| `created_at` | TIMESTAMPTZ | NO | Record creation |
| `updated_at` | TIMESTAMPTZ | NO | Record update |

---

### `user_client_permissions`

RLS mapping: users → clients.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID | NO | Primary key |
| `user_id` | UUID | NO | FK → `auth.users.id` |
| `client_id` | UUID | NO | FK → `clients.id` |
| `permission_level` | TEXT | NO | `read`, `write`, `admin` |
| `created_at` | TIMESTAMPTZ | NO | Record creation |
| `updated_at` | TIMESTAMPTZ | NO | Record update |

---

### `agent_sms`

SMS messages sent via agents.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID | NO | Primary key |
| `deployment_id` | UUID | NO | FK → `agent_deployments.id` (CASCADE) |
| `call_id` | UUID | YES | FK → `agent_calls.id` (SET NULL) |
| `prospect_id` | UUID | YES | FK → `agent_arthur_prospects.id` |
| `sequence_id` | UUID | YES | FK → `agent_arthur_prospect_sequences.id` |
| `phone_number` | TEXT | NO | E.164 format |
| `first_name` | TEXT | YES | Contact first name |
| `last_name` | TEXT | YES | Contact last name |
| `message_content` | TEXT | NO | Full SMS text |
| `message_type` | TEXT | NO | `transactional`, `marketing`, `notification`, `appointment_reminder` |
| `character_count` | INTEGER | NO | GENERATED from `LENGTH(message_content)` |
| `provider` | TEXT | NO | Default `twilio` |
| `provider_message_sid` | TEXT | YES | Twilio Message SID (UNIQUE) |
| `provider_status` | TEXT | YES | `queued`, `sending`, `sent`, `delivered`, `undelivered`, `failed`, `unknown` |
| `status` | TEXT | YES | Simplified: `sent`, `delivered`, `failed` |
| `sent_at` | TIMESTAMPTZ | NO | Send time |
| `delivered_at` | TIMESTAMPTZ | YES | Delivery time (Twilio webhook) |
| `failed_at` | TIMESTAMPTZ | YES | Failure time |
| `failure_reason` | TEXT | YES | Failure description |
| `provider_cost` | NUMERIC(10,4) | YES | Twilio cost (EUR) |
| `voipia_margin` | NUMERIC(10,4) | YES | Margin added (legacy column name) |
| `billed_cost` | NUMERIC(10,4) | NO | GENERATED: `provider_cost + voipia_margin` |
| `currency` | TEXT | NO | Default `EUR` |
| `workflow_id` | TEXT | YES | n8n workflow ID |
| `workflow_execution_id` | TEXT | YES | n8n execution ID |
| `metadata` | JSONB | YES | Default `{}` |
| `created_at` | TIMESTAMPTZ | NO | Record creation |
| `updated_at` | TIMESTAMPTZ | NO | Auto-updated by trigger |

**Trigger**: `agent_sms_updated_at` — BEFORE UPDATE, updates `updated_at`.

---

### `agent_emails`

Email messages sent via agents. Referenced in financial views and invoice functions.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `deployment_id` | UUID | FK → `agent_deployments.id` |
| `sent_at` | TIMESTAMPTZ | Send time |
| `failed_at` | TIMESTAMPTZ | Failure time (nullable) |
| `billed_cost` | NUMERIC | Revenue to Sablia |
| `provider_cost` | NUMERIC | Provider cost |

**Note**: No migration file exists in `supabase/migrations/` for this table — it may predate the current migration set.

---

### `agent_arthur_prospects` / `agent_arthur_prospect_sequences`

Arthur-specific prospect and sequence tables. Referenced as FK targets in `agent_sms`. No migration files in the current set.

---

## Views

### `v_agent_calls_enriched`

Adds computed boolean columns to `agent_calls`.

```sql
SELECT ac.*,
  (ac.outcome NOT IN ('voicemail', 'no_answer', 'busy', 'call_failed',
    'invalid_number', 'error', 'canceled', 'rejected')
   AND ac.outcome IS NOT NULL) AS answered,
  (ac.outcome = 'appointment_scheduled') AS appointment_scheduled
FROM agent_calls ac;
```

**CRITICAL**: Never use `metadata ? 'appointment_scheduled_at'` — it checks key existence, not value. This caused a bug where 118 voicemails were counted as appointments.

---

### `v_user_accessible_clients`

RLS-filtered clients for the current user.

Returns: `client_id`, `client_name`, `industry`, `user_id`, `permission_level`, `total_agents`, `active_agents`, `agent_types_count`, `agent_types_list`

---

### `v_user_accessible_agents`

RLS-filtered agent deployments for the current user.

Returns: `deployment_id`, `deployment_name`, `slug`, `client_id`, `client_name`, `agent_type_id`, `agent_type_name`, `agent_display_name`, `deployment_status`, `user_id`, `permission_level`, `last_call_at`, `total_calls_last_30d`

---

### `v_financial_metrics_enriched`

Daily aggregated financial view combining calls + SMS + emails + pro-rated leasing.

One row per `(deployment_id, metric_date)`.

Key columns: `deployment_id`, `metric_date`, `client_id`, `client_name`, `agent_type_id`, `agent_type_name`, `call_count`, `answered_calls`, `appointments_scheduled`, `call_revenue`, `call_provider_cost`, `sms_count`, `sms_revenue`, `sms_provider_cost`, `email_count`, `email_revenue`, `email_provider_cost`, `leasing_revenue_daily`, `total_revenue`, `total_provider_cost`, `total_margin`, `margin_percentage`

---

## RPC Functions

### Dashboard KPIs

| Function | Parameters | Returns | Used By |
|----------|-----------|---------|---------|
| `get_global_kpis` | `p_start_date`, `p_end_date`, `p_client_ids UUID[]`, `p_deployment_id`, `p_agent_type_name` | `{current_period, previous_period}` | Overview, Performance, Client Detail |
| `get_global_chart_data` | same | `{call_volume_by_day, outcome_distribution, emotion_distribution}` | Overview, Performance, Client Detail |
| `get_top_clients` | + `p_limit` | `TopClientData[]` | Performance |
| `get_agent_type_performance` | `p_start_date`, `p_end_date`, `p_client_ids` | `AgentTypePerformance[]` | Overview, Performance |
| `get_client_cards_data` | `p_start_date`, `p_end_date`, `p_client_ids` | `ClientCardData[]` | Clients list |
| `get_agent_cards_data` | `p_start_date`, `p_end_date`, `p_client_ids` | `AgentCardData[]` | Agents list, Client Detail |
| `get_agent_type_cards_data` | `p_start_date`, `p_end_date`, `p_client_ids` | `AgentTypeCardData[]` | Global Dashboard |

### Legacy KPIs (single client/deployment)

| Function | Parameters | Returns | Used By |
|----------|-----------|---------|---------|
| `get_kpi_metrics` | `p_start_date`, `p_end_date`, `p_client_id`, `p_deployment_id`, `p_agent_type_name` | `KPIMetrics` | Agent Detail (Louis) |
| `get_chart_data` | same | `ChartData` | Agent Detail (Louis) |
| `get_louis_nestenn_kpis` | `p_start_date`, `p_end_date`, `p_client_id`, `p_deployment_id` | `KPIMetrics` | Not currently used |
| `get_louis_nestenn_charts` | same | `ChartData` | Not currently used |

### Admin Calls

| Function | Parameters | Returns |
|----------|-----------|---------|
| `get_admin_calls_paginated` | `p_start_date`, `p_end_date`, `p_client_ids`, `p_agent_type_name`, `p_outcomes`, `p_emotion`, `p_direction`, `p_search_text`, `p_sort_column`, `p_sort_direction`, `p_page`, `p_page_size` | `{data, pagination}` |
| `get_admin_calls_export` | same minus pagination | `{data, exportedCount, limitReached}` |

### Financial

| Function | Parameters | Returns |
|----------|-----------|---------|
| `get_financial_kpi_metrics` | `p_start_date`, `p_end_date`, `p_client_id`, `p_agent_type_name`, `p_deployment_id` | `FinancialKPIResponse` |
| `get_financial_drilldown` | + `p_level: 'client'\|'agent_type'\|'deployment'\|'channel'` | Drilldown JSONB |
| `get_financial_timeseries` | + `p_granularity: 'day'\|'week'\|'month'` | `TimeSeriesDataPoint[]` |
| `get_client_deployments_breakdown` | `p_client_id`, `p_start_date`, `p_end_date` | `ClientDeploymentData[]` |
| `get_deployment_channels_breakdown` | `p_deployment_id`, `p_start_date`, `p_end_date` | `DeploymentChannelData[]` |
| `get_cost_breakdown` | `p_start_date`, `p_end_date`, `p_client_id`, `p_agent_type_name`, `p_deployment_id` | `CostBreakdownResponse` |
| `get_leasing_kpi_metrics` | `p_start_date`, `p_end_date` | `LeasingMetrics` |
| `get_consumption_kpi_metrics` | `p_start_date`, `p_end_date` | `ConsumptionMetrics` |
| `get_consumption_pricing_by_agent` | `p_start_date`, `p_end_date`, `p_client_id` | `AgentUnitPricing[]` |
| `get_monthly_invoice_summary` | `p_year INT`, `p_month INT` | `MonthlyInvoiceSummaryResponse` |

### Consumption (User-Facing)

| Function | Parameters | Returns |
|----------|-----------|---------|
| `get_user_consumption_metrics` | `p_start_date`, `p_end_date`, `p_client_id`, `p_view_as_user_id` | `UserConsumptionResponse` (no margin data) |
| `get_consumption_chart_data` | same | `ConsumptionChartData` |
| `get_admin_billing_summary` | `p_current_month_start`, `p_current_month_end` | `AdminBillingSummaryResponse` |

### Latency

| Function | Parameters | Returns |
|----------|-----------|---------|
| `get_latency_metrics` | `p_start_date`, `p_end_date`, `p_deployment_id`, `p_client_id`, `p_agent_type_name` | TABLE of `LatencyMetric` rows |

### Navigation

| Function | Parameters | Returns |
|----------|-----------|---------|
| `get_company_agent_hierarchy` | `p_view_as_user_id` | Company → agent deployment tree |

### Admin / Auth

| Function | Parameters | Returns |
|----------|-----------|---------|
| `get_all_users_for_admin` | none | TABLE `(user_id, email, full_name, accessible_clients, permission_level)` |
| `get_user_client_ids` | `p_user_id UUID` | `UUID[]` |
| `is_admin()` | none (uses `auth.uid()`) | BOOLEAN |

---

## Critical KPI Formulas

```sql
Answer Rate      = answered_calls / total_calls × 100
Conversion Rate  = appointments / ANSWERED_calls × 100  -- NOT total_calls!
Cost per RDV     = total_cost / appointments
```

**Pitfalls**:
- `metadata ? 'key'` checks key **existence**, not value → always use `outcome = 'appointment_scheduled'`
- Conversion rate denominator is **answered_calls**, not total_calls
- Voicemail is NOT answered (`outcome = 'voicemail'` → `answered = false`)

---

## Known Schema Inconsistencies

1. **Two "answered" definitions** — `v_agent_calls_enriched` excludes `['voicemail', 'no_answer', 'busy', 'call_failed', 'invalid_number', 'error', 'canceled', 'rejected']`. `get_admin_calls_paginated` inline SQL excludes only `['voicemail', 'call_failed', 'too_short']`. These lists disagree on `too_short`, `no_answer`, `busy`, `invalid_number`, etc.

2. **`voipia_margin` column name** — `agent_sms.voipia_margin` retains pre-rebrand name. Historical — no functional issue.

3. **Missing migration files** — `agent_emails`, `agent_arthur_prospects`, and `agent_arthur_prospect_sequences` tables have no migration files in `supabase/migrations/`.

4. **Stale types in `lib/types/database.ts`** — Contains legacy types (`Call` with `call_outcome`, `phone`, `agent_id`) that don't match current schema. Active types are in `lib/types/dashboard.ts`.

---

## Migration Files

64 migration files in `supabase/migrations/`. Key milestones:

| Date | Migration | What it does |
|------|-----------|-------------|
| 2024-12 | `admin_calls_rpc` | Admin calls paginated + export RPCs |
| 2025-01 | `create_enriched_view` | `v_agent_calls_enriched` view |
| 2025-01 | `fix_rdv_logic_correct` | Fixed RDV counting (metadata key → outcome value) |
| 2025-01 | `create_dashboard_cards_rpc` | Client + agent cards RPCs |
| 2025-01 | `create_financial_*` | Financial dashboard (view, RPCs, drilldowns) |
| 2025-11 | `create_agent_sms_table` | SMS table with full schema |
| 2025-11 | `create_financial_dashboard` | Rebuilt financial view + RPCs |
| 2025-11 | `add_latency_and_quality_columns` | 9 latency columns + quality analysis |
| 2025-11 | `performance_dashboard_functions` | Global KPIs + chart + top clients RPCs |
| 2025-11 | `add_admin_view_as_user` | Admin user listing + view-as-user RPCs |
| 2025-12 | `fix_user_accessible_views_rls` | Rebuilt accessible client/agent views |
| 2025-12 | `consumption_dashboard_charts` | Consumption chart data RPC |
| 2025-12 | `add_billing_columns` | `client_rate_per_min`, `billed_cost` + billing trigger |
| 2025-12 | `create_monthly_invoice_summary` | Invoice summary RPC |
| 2026-03 | `remove_leasing_prorata` | Simplified invoice (no first-month prorata) — **PENDING** |
