/**
 * Types for Admin Calls Table
 * Route: /dashboard/admin/calls
 */

// Main call row type (from agent_calls + joins)
export interface AdminCallRow {
  // Core
  id: string
  deployment_id: string
  started_at: string
  ended_at: string | null
  created_at: string

  // Contact
  first_name: string | null
  last_name: string | null
  email: string | null
  phone_number: string

  // Joined data
  client_id: string
  client_name: string
  agent_type_name: string
  deployment_name: string

  // Outcome
  outcome: string | null
  emotion: 'positive' | 'neutral' | 'negative' | null
  answered: boolean
  appointment_scheduled: boolean
  sentiment_analysis: string | null

  // Duration
  duration_seconds: number | null

  // Latencies - LLM
  avg_llm_latency_ms: number | null
  min_llm_latency_ms: number | null
  max_llm_latency_ms: number | null

  // Latencies - TTS
  avg_tts_latency_ms: number | null
  min_tts_latency_ms: number | null
  max_tts_latency_ms: number | null

  // Latencies - Total
  avg_total_latency_ms: number | null
  min_total_latency_ms: number | null
  max_total_latency_ms: number | null

  // Costs
  total_cost: number | null
  stt_cost: number | null
  tts_cost: number | null
  llm_cost: number | null
  telecom_cost: number | null
  dipler_commission: number | null

  // Technical
  conversation_id: string | null
  call_sid: string | null
  llm_model: string | null
  tts_provider: string | null
  stt_provider: string | null
  direction: 'inbound' | 'outbound' | null

  // Media
  recording_url: string | null
  transcript: string | null
  transcript_summary: string | null

  // Metadata (flexible JSON)
  metadata: Record<string, unknown> | null
}

// Filter state for URL parameters
export interface AdminCallsFilters {
  startDate: string
  endDate: string
  clientIds: string[]
  agentTypeName: string | null
  deploymentId: string | null
  outcomes: string[]
  emotion: 'positive' | 'neutral' | 'negative' | null
  direction: 'inbound' | 'outbound' | null
  searchText: string
}

// Pagination state
export interface AdminCallsPagination {
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

// Sort state
export interface AdminCallsSort {
  column: string
  direction: 'asc' | 'desc'
}

// RPC response type
export interface AdminCallsResponse {
  data: AdminCallRow[]
  pagination: AdminCallsPagination
}

// Column definition for table
export interface AdminCallsColumnDef {
  key: string
  label: string
  sortable: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  group?: string // For grouping columns
  format?: (value: unknown, row: AdminCallRow) => string | React.ReactNode
  defaultVisible?: boolean
}

// Column group configuration
export interface AdminCallsColumnGroup {
  key: string
  label: string
  columns: string[] // Column keys in this group
  collapsible: boolean
  defaultCollapsed: boolean
}

// Column visibility state
export interface ColumnVisibilityState {
  visibleColumns: Set<string>
  collapsedGroups: Set<string>
}

// Outcome type values
export const CALL_OUTCOMES = [
  'appointment_scheduled',
  'appointment_refused',
  'voicemail',
  'not_interested',
  'callback_requested',
  'too_short',
  'call_failed',
] as const

export type CallOutcome = (typeof CALL_OUTCOMES)[number]

// Emotion type values
export const CALL_EMOTIONS = ['positive', 'neutral', 'negative'] as const
export type CallEmotion = (typeof CALL_EMOTIONS)[number]

// Direction type values
export const CALL_DIRECTIONS = ['inbound', 'outbound'] as const
export type CallDirection = (typeof CALL_DIRECTIONS)[number]

// Agent type values
export const AGENT_TYPES = ['louis', 'arthur', 'alexandra'] as const
export type AgentType = (typeof AGENT_TYPES)[number]

// Outcome labels for UI display
export const OUTCOME_LABELS: Record<CallOutcome, string> = {
  appointment_scheduled: 'RDV pris',
  appointment_refused: 'RDV refusé',
  voicemail: 'Messagerie',
  not_interested: 'Pas intéressé',
  callback_requested: 'Rappel demandé',
  too_short: 'Trop court',
  call_failed: 'Échec appel',
}

// Emotion labels for UI display
export const EMOTION_LABELS: Record<CallEmotion, string> = {
  positive: 'Positif',
  neutral: 'Neutre',
  negative: 'Négatif',
}

// Direction labels for UI display
export const DIRECTION_LABELS: Record<CallDirection, string> = {
  inbound: 'Entrant',
  outbound: 'Sortant',
}
