// Dashboard Types — v2 schema (sablia-voice)
// All types match v2 views and RPCs

/**
 * Dashboard filters — v2 uses JWT org_id (no clientIds needed)
 */
export interface DashboardFilters {
  deploymentId?: string | null
  templateType?: string | null // 'setter' | 'secretary' | 'transfer'
  startDate: string // ISO 8601 date (YYYY-MM-DD)
  endDate: string // ISO 8601 date (YYYY-MM-DD)
}

/**
 * KPI Metrics — current vs previous period comparison
 * Returned by get_dashboard_kpis RPC
 */
export interface KPIMetrics {
  current_period: KPIPeriod
  previous_period: KPIPeriod
}

/**
 * KPI values for a specific time period
 */
export interface KPIPeriod {
  total_calls: number
  answered_calls: number
  conversions: number
  answer_rate: number // 0-100
  conversion_rate: number // 0-100 — denominator = décroché count (canonical SSOT)
  avg_duration: number // seconds
  total_billed_cost: number // EUR
  avg_billed_cost: number // EUR per call
  voicemail_count: number
  no_answer_count: number
  quality_score_avg?: number | null // 1.00-5.00, voicemails excluded; nullable when no scored calls
}

/**
 * Call volume data point (for line chart)
 * Returned by get_call_volume_by_day RPC
 * Note: RPC returns 'day' — mapped to 'date' in fetchCallVolumeByDay query layer
 */
export interface CallVolumeData {
  date: string // YYYY-MM-DD
  total_calls: number
  answered_calls: number // canonical décroché (lenient), same value as decroche_calls
  outbound_calls: number
  inbound_calls: number
  conversions: number
  decroche_calls?: number // canonical décroché count, exposed explicitly for client-side conversion_rate computation
  quality_score_avg?: number | null // voicemails excluded
}

/**
 * Outcome distribution data point (for donut chart)
 * Returned by get_outcome_distribution RPC
 */
export interface OutcomeData {
  outcome: string
  count: number
  percentage: number // 0-100
}

/**
 * Emotion distribution data point (for bar chart)
 */
export interface EmotionData {
  emotion: 'positive' | 'neutral' | 'negative' | 'unknown'
  count: number
  percentage: number // 0-100
}

/**
 * Agent accessible by user — from v_user_accessible_agents view
 */
export interface AccessibleAgent {
  deployment_id: string
  deployment_name: string
  slug: string
  template_type: string // 'setter' | 'secretary' | 'transfer'
  template_display_name: string
  deployment_status: 'active' | 'inactive' | 'deploying' | 'error'
  deployment_phone: string | null
  cost_per_min: number | null
  last_call_at: string | null
  total_calls_last_30d: number
}

/**
 * Agent card data — from get_agent_cards_data RPC
 */
export interface AgentCardData {
  deployment_id: string
  deployment_name: string
  slug: string
  template_type: string
  template_display_name: string
  deployment_status: 'active' | 'inactive' | 'deploying' | 'error'
  total_calls: number
  answered_calls: number
  conversions: number
  answer_rate: number // 0-100
  conversion_rate: number // 0-100 — denominator = décroché count (canonical SSOT)
  avg_duration: number // seconds
  total_billed_cost: number // EUR
  quality_score_avg?: number | null // 1.00-5.00, voicemails excluded; nullable
  last_call_at: string | null
}

/**
 * Call data from v_dashboard_calls view — used for list + detail
 */
export interface DashboardCall {
  call_id: string
  org_id: string
  deployment_id: string
  dipler_conversation_id: string | null
  direction: 'outbound' | 'inbound'
  outcome: string | null
  call_status: string | null
  is_answered: boolean
  call_reason: string | null
  attempt_number: number
  started_at: string
  ended_at: string | null
  duration_seconds: number | null
  phone_number: string | null
  provider: string | null
  call_sid: string | null
  transcript: string | null
  summary: string | null
  emotion: string | null
  recording_url: string | null
  context_info: string | null
  billed_cost: number | null
  dipler_cost: number | null
  telecom_cost: number | null
  margin: number | null
  quality_score: number | null
  sentiment: string | null
  is_voicemail: boolean | null
  extracted_data: Record<string, unknown> | null
  tags: string[] | null
  analysis_text: string | null
  avg_llm_ms: number | null
  avg_tts_ms: number | null
  avg_total_ms: number | null
  deployment_name: string
  deployment_slug: string
  deployment_status: string
  deployment_phone: string | null
  cost_per_min: number | null
  template_type: string
  template_display_name: string
  first_name: string | null
  last_name: string | null
  contact_email: string | null
  is_conversion: boolean
  created_at: string
  updated_at: string | null
}

/**
 * Paginated calls response from get_calls_page RPC
 */
export interface CallsPageResponse {
  total: number
  data: DashboardCall[]
}

/**
 * Call data for CSV export — flat structure from v_dashboard_calls
 */
export interface CallExportRow {
  call_id: string
  started_at: string
  ended_at: string | null
  duration_seconds: number | null
  outcome: string | null
  is_answered: boolean
  direction: string
  call_reason: string | null
  phone_number: string | null
  first_name: string | null
  last_name: string | null
  contact_email: string | null
  billed_cost: number | null
  quality_score: number | null
  emotion: string | null
  deployment_name: string
  template_type: string
  is_conversion: boolean
}

/**
 * KPI Card props helper type
 */
export interface KPICardData {
  title: string
  value: number | string
  previousValue?: number | string
  format: 'number' | 'percent' | 'currency' | 'duration'
  unit?: string
  trend?: 'up' | 'down' | 'neutral'
}
