// Dashboard Types & Interfaces
// Centralized type definitions for the multi-agent dashboard system

/**
 * Dashboard filters for querying data
 */
export interface DashboardFilters {
  clientIds: string[] // Array of client UUIDs
  deploymentId?: string | null // Single agent deployment UUID (optional)
  agentTypeName?: 'louis' | 'arthur' | 'alexandra' | null
  startDate: string // ISO 8601 date (YYYY-MM-DD)
  endDate: string // ISO 8601 date (YYYY-MM-DD)
}

/**
 * KPI Metrics structure (return from RPC functions)
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
  appointments_scheduled: number
  answer_rate: number // 0-100
  conversion_rate: number // 0-100
  avg_duration: number // seconds
  total_cost: number // EUR
  cost_per_appointment: number // EUR

  // Louis-specific KPIs
  refused_appointments?: number
  acceptance_rate?: number // 0-100
  callbacks_requested?: number
  qualified_leads?: number

  // Louis-Nestenn specific KPIs (qualification, not RDV)
  contact_rate?: number // 0-100 (contacted / total)
  transfers_requested?: number // Main success metric for Nestenn
  qualification_rate?: number // 0-100 (qualified / answered)
  contacted_calls?: number
  voicemails?: number
  no_answers?: number
  not_interested?: number
  sms_sent?: number
  cost_per_transfer?: number // EUR

  // Arthur-specific KPIs
  total_prospects?: number
  active_sequences?: number
  reactivation_rate?: number // 0-100
  avg_attempts?: number
  cost_per_conversion?: number // EUR

  // Global-specific KPIs
  active_agents?: number
  agents_called_today?: number

  // Overview-specific KPIs
  avg_quality_score?: number // 0-100 (call_quality_score average)
}

/**
 * Chart data structure from RPC functions
 */
export interface ChartData {
  call_volume_by_day: CallVolumeData[]
  outcome_distribution: OutcomeData[]
  emotion_distribution?: EmotionData[]
  agent_type_performance?: AgentTypePerformance[]
  top_clients?: TopClientData[]
  voicemail_by_agent?: VoicemailByAgentData[]
  // Louis-Nestenn specific charts
  duration_by_outcome?: DurationByOutcomeData[]
  funnel_data?: FunnelData
  by_owner?: OwnerPerformanceData[]
}

/**
 * Owner (agent immobilier) performance data for Nestenn dashboard
 */
export interface OwnerPerformanceData {
  owner: string
  total_calls: number
  rdv_count: number
  conversion_rate: number
}

/**
 * Duration by outcome data (for Louis-Nestenn horizontal bar chart)
 */
export interface DurationByOutcomeData {
  outcome: string
  avg_duration: number // seconds
  count: number
  color: string
}

/**
 * Funnel data for Louis-Nestenn
 */
export interface FunnelData {
  total_calls: number
  contacted: number
  answered: number
  qualified: number
}

/**
 * Call volume data point (for line chart)
 */
export interface CallVolumeData {
  date: string // YYYY-MM-DD
  total_calls: number
  answered_calls: number
  appointments: number

  // Breakdown by agent type (Global dashboard only)
  louis_calls?: number
  arthur_calls?: number

  // Louis-Nestenn specific
  transfers?: number // Transfers requested (success metric)
}

/**
 * Outcome distribution data point (for donut chart)
 */
export interface OutcomeData {
  outcome: string
  count: number
  percentage: number // 0-100
  total_cost?: number
  avg_duration?: number
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
 * Voicemail by agent data point (for horizontal bar chart)
 */
export interface VoicemailByAgentData {
  agent: string
  rate: number // 0-100
}

/**
 * Agent type performance comparison (for bar chart)
 */
export interface AgentTypePerformance {
  agent_type: 'louis' | 'arthur' | 'alexandra'
  display_name: string
  total_deployments: number
  total_clients: number
  total_calls: number
  calls_last_7d: number
  answer_rate: number // 0-100
  conversion_rate: number // 0-100
  avg_duration: number // seconds
  total_cost: number // EUR
  cost_per_appointment: number // EUR
}

/**
 * Top client data (for table)
 */
export interface TopClientData {
  client_id: string
  client_name: string
  industry: string | null
  total_agents: number
  total_calls: number
  answered_calls: number
  appointments: number
  conversion_rate: number // 0-100
  total_cost: number // EUR
  cost_per_appointment: number // EUR
  last_call_at: string | null
}

/**
 * Client accessible by user (for navigation dropdown)
 */
export interface AccessibleClient {
  client_id: string
  client_name: string
  industry: string | null
  user_id: string
  permission_level: 'read' | 'write' | 'admin'
  total_agents: number
  active_agents: number
  agent_types_count: number
  agent_types_list: string[]
}

/**
 * Agent deployment accessible by user (for navigation dropdown)
 */
export interface AccessibleAgent {
  deployment_id: string
  deployment_name: string
  slug: string
  client_id: string
  client_name: string
  agent_type_id: string
  agent_type_name: 'louis' | 'arthur' | 'alexandra'
  agent_display_name: string
  deployment_status: 'active' | 'paused' | 'archived'
  user_id: string
  permission_level: 'read' | 'write' | 'admin'
  last_call_at: string | null
  total_calls_last_30d: number
}

/**
 * Agent performance data (for table)
 */
export interface AgentPerformanceData {
  deployment_id: string
  agent_name: string
  slug: string
  client_id: string
  client_name: string
  total_calls: number
  answered_calls: number
  appointments: number
  voicemail_calls?: number
  answer_rate: number // 0-100
  conversion_rate: number // 0-100
  avg_duration: number // seconds
  total_cost: number // EUR
  cost_per_appointment: number // EUR
  last_call_at: string | null

  // Arthur-specific
  total_prospects?: number
  prospects_converted?: number
  prospects_active?: number
  reactivation_rate?: number
  active_sequences?: number
  avg_attempts?: number
  cost_per_conversion?: number
}

/**
 * Arthur next call data (for queue table)
 */
export interface ArthurNextCallData {
  sequence_id: string
  prospect_id: string
  external_deal_id: string
  external_user_id: string | null
  first_name: string | null
  last_name: string | null
  phone_number: string
  email: string | null
  company_name: string | null
  prospect_status: string
  sequence_status: string
  deployment_id: string
  agent_name: string
  agent_slug: string
  client_name: string
  current_attempt: number
  max_attempts: number
  next_action_at: string | null
  segment: string | null
  approche_recommandee: string | null
  points_accroche: Record<string, unknown> | null
  delai_contact: string | null
  call_type: 'CALLBACK' | 'ACTIVE' | 'OTHER'
  exceeded_max_attempts: boolean
  urgency_status: 'overdue' | 'urgent' | 'due_today' | 'scheduled'
  last_call_info: {
    call_id: string
    started_at: string
    duration: number
    outcome: string
    answered: boolean
  } | null
}

/**
 * Call data structure for CSV export
 * Used to type the raw Supabase response in export functions
 */
export interface CallExportRow {
  id: string
  started_at: string
  ended_at: string | null
  duration_seconds: number | null
  outcome: string | null
  answered: boolean
  appointment_scheduled: boolean
  emotion: string | null
  emotion_score: number | null
  transcript: string | null
  summary: string | null
  recording_url: string | null
  call_quality_score: number | null
  cost: number | null
  phone_number: string | null
  first_name: string | null
  last_name: string | null
  email: string | null
  metadata: {
    appointment_scheduled_at?: string
    appointment_accepted?: boolean
    appointment_refused?: boolean
    callback_requested?: boolean
    [key: string]: unknown
  } | null
  agent_deployments: {
    name: string
    slug: string
    client_id: string
    clients: {
      name: string
      industry: string | null
    } | null
    agent_types: {
      name: string
      display_name: string
    } | null
  } | null
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

/**
 * Client card data for dynamic dashboard cards
 * Shows aggregated metrics for a specific client
 */
export interface ClientCardData {
  client_id: string
  client_name: string
  industry: string | null
  total_agents: number
  active_agents: number
  total_calls: number
  answered_calls: number
  appointments_scheduled: number
  answer_rate: number // 0-100
  conversion_rate: number // 0-100
  total_cost: number // EUR
  last_call_at: string | null
  agent_types: string[] // ['louis', 'arthur']
}

/**
 * Agent card data for dynamic dashboard cards
 * Shows aggregated metrics for a specific agent deployment
 */
export interface AgentCardData {
  deployment_id: string
  deployment_name: string
  slug: string
  agent_type_name: 'louis' | 'arthur' | 'alexandra'
  agent_display_name: string
  client_name: string
  total_calls: number
  answered_calls: number
  appointments_scheduled: number
  answer_rate: number // 0-100
  conversion_rate: number // 0-100
  avg_duration: number // seconds
  total_cost: number // EUR
  last_call_at: string | null
  deployment_status: 'active' | 'paused' | 'archived'
}

/**
 * Agent type card data for dynamic dashboard cards
 * Shows aggregated metrics for ALL deployments of a specific agent type
 * (e.g., one card for all "Louis" agents, one for all "Arthur" agents)
 */
export interface AgentTypeCardData {
  agent_type_name: 'louis' | 'arthur' | 'alexandra'
  agent_display_name: string
  total_deployments: number // Total number of deployments
  active_deployments: number // Number of active deployments
  total_calls: number
  answered_calls: number
  appointments_scheduled: number
  answer_rate: number // 0-100
  conversion_rate: number // 0-100
  avg_duration: number // seconds
  last_call_at: string | null
}
