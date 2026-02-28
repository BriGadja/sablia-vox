/**
 * Column configuration for Admin Calls Table
 * Defines columns, groups, and default visibility
 */

import type { AdminCallsColumnDef, AdminCallsColumnGroup } from '@/lib/types/adminCalls'

// All column definitions
export const COLUMN_DEFINITIONS: AdminCallsColumnDef[] = [
  // Core columns (always available)
  {
    key: 'started_at',
    label: 'Date/Heure',
    sortable: true,
    width: '140px',
    align: 'left',
    group: 'core',
    defaultVisible: true,
  },
  {
    key: 'client_name',
    label: 'Client',
    sortable: true,
    width: '150px',
    align: 'left',
    group: 'core',
    defaultVisible: true,
  },
  {
    key: 'deployment_name',
    label: 'Agent',
    sortable: true,
    width: '130px',
    align: 'left',
    group: 'core',
    defaultVisible: true,
  },
  {
    key: 'contact',
    label: 'Contact',
    sortable: false,
    width: '160px',
    align: 'left',
    group: 'core',
    defaultVisible: true,
  },
  {
    key: 'phone_number',
    label: 'Téléphone',
    sortable: false,
    width: '120px',
    align: 'left',
    group: 'core',
    defaultVisible: true,
  },
  // Duration (in core group)
  {
    key: 'duration_seconds',
    label: 'Durée',
    sortable: true,
    width: '80px',
    align: 'right',
    group: 'core',
    defaultVisible: true,
  },

  // Media columns (after duration)
  {
    key: 'recording_url',
    label: 'Audio',
    sortable: false,
    width: '70px',
    align: 'center',
    group: 'media',
    defaultVisible: true,
  },
  {
    key: 'transcript',
    label: 'Transcript',
    sortable: false,
    width: '90px',
    align: 'center',
    group: 'media',
    defaultVisible: true,
  },

  // Outcome columns
  {
    key: 'outcome',
    label: 'Résultat',
    sortable: true,
    width: '120px',
    align: 'center',
    group: 'outcome',
    defaultVisible: true,
  },
  {
    key: 'emotion',
    label: 'Émotion',
    sortable: true,
    width: '90px',
    align: 'center',
    group: 'outcome',
    defaultVisible: true,
  },
  {
    key: 'answered',
    label: 'Décroché',
    sortable: false,
    width: '80px',
    align: 'center',
    group: 'outcome',
    defaultVisible: false,
  },
  {
    key: 'appointment_scheduled',
    label: 'RDV',
    sortable: false,
    width: '60px',
    align: 'center',
    group: 'outcome',
    defaultVisible: false,
  },
  // Quality
  {
    key: 'call_quality_score',
    label: 'Score',
    sortable: true,
    width: '70px',
    align: 'center',
    group: 'outcome',
    defaultVisible: false,
  },

  // Latencies - LLM
  {
    key: 'avg_llm_latency_ms',
    label: 'LLM Moy',
    sortable: true,
    width: '90px',
    align: 'right',
    group: 'latencies',
    defaultVisible: false,
  },
  {
    key: 'min_llm_latency_ms',
    label: 'LLM Min',
    sortable: false,
    width: '80px',
    align: 'right',
    group: 'latencies',
    defaultVisible: false,
  },
  {
    key: 'max_llm_latency_ms',
    label: 'LLM Max',
    sortable: false,
    width: '80px',
    align: 'right',
    group: 'latencies',
    defaultVisible: false,
  },

  // Latencies - TTS
  {
    key: 'avg_tts_latency_ms',
    label: 'TTS Moy',
    sortable: true,
    width: '90px',
    align: 'right',
    group: 'latencies',
    defaultVisible: false,
  },
  {
    key: 'min_tts_latency_ms',
    label: 'TTS Min',
    sortable: false,
    width: '80px',
    align: 'right',
    group: 'latencies',
    defaultVisible: false,
  },
  {
    key: 'max_tts_latency_ms',
    label: 'TTS Max',
    sortable: false,
    width: '80px',
    align: 'right',
    group: 'latencies',
    defaultVisible: false,
  },

  // Latencies - Total
  {
    key: 'avg_total_latency_ms',
    label: 'Total Moy',
    sortable: true,
    width: '90px',
    align: 'right',
    group: 'latencies',
    defaultVisible: false,
  },
  {
    key: 'min_total_latency_ms',
    label: 'Total Min',
    sortable: false,
    width: '80px',
    align: 'right',
    group: 'latencies',
    defaultVisible: false,
  },
  {
    key: 'max_total_latency_ms',
    label: 'Total Max',
    sortable: false,
    width: '80px',
    align: 'right',
    group: 'latencies',
    defaultVisible: false,
  },

  // Costs
  {
    key: 'total_cost',
    label: 'Coût Total',
    sortable: true,
    width: '100px',
    align: 'right',
    group: 'costs',
    defaultVisible: true,
  },
  {
    key: 'stt_cost',
    label: 'STT',
    sortable: false,
    width: '80px',
    align: 'right',
    group: 'costs',
    defaultVisible: false,
  },
  {
    key: 'tts_cost',
    label: 'TTS',
    sortable: false,
    width: '80px',
    align: 'right',
    group: 'costs',
    defaultVisible: false,
  },
  {
    key: 'llm_cost',
    label: 'LLM',
    sortable: false,
    width: '80px',
    align: 'right',
    group: 'costs',
    defaultVisible: false,
  },
  {
    key: 'telecom_cost',
    label: 'Telecom',
    sortable: false,
    width: '80px',
    align: 'right',
    group: 'costs',
    defaultVisible: false,
  },
  {
    key: 'dipler_commission',
    label: 'Commission',
    sortable: false,
    width: '90px',
    align: 'right',
    group: 'costs',
    defaultVisible: false,
  },

  // Technical
  {
    key: 'direction',
    label: 'Direction',
    sortable: false,
    width: '90px',
    align: 'center',
    group: 'technical',
    defaultVisible: false,
  },
  {
    key: 'llm_model',
    label: 'Modèle LLM',
    sortable: false,
    width: '120px',
    align: 'left',
    group: 'technical',
    defaultVisible: false,
  },
  {
    key: 'tts_provider',
    label: 'TTS Provider',
    sortable: false,
    width: '120px',
    align: 'left',
    group: 'technical',
    defaultVisible: false,
  },
  {
    key: 'conversation_id',
    label: 'Conv. ID',
    sortable: false,
    width: '180px',
    align: 'left',
    group: 'technical',
    defaultVisible: false,
  },
  {
    key: 'call_sid',
    label: 'Call SID',
    sortable: false,
    width: '180px',
    align: 'left',
    group: 'technical',
    defaultVisible: false,
  },
]

// Column groups configuration
// Order: core → media → outcome (non-collapsible) → latencies → costs → technical (collapsible at end)
export const COLUMN_GROUPS: AdminCallsColumnGroup[] = [
  {
    key: 'core',
    label: 'Informations principales',
    columns: [
      'started_at',
      'client_name',
      'deployment_name',
      'contact',
      'phone_number',
      'duration_seconds',
    ],
    collapsible: false,
    defaultCollapsed: false,
  },
  {
    key: 'media',
    label: 'Médias',
    columns: ['recording_url', 'transcript'],
    collapsible: false,
    defaultCollapsed: false,
  },
  {
    key: 'outcome',
    label: 'Résultats',
    columns: ['outcome', 'emotion', 'answered', 'appointment_scheduled', 'call_quality_score'],
    collapsible: false,
    defaultCollapsed: false,
  },
  {
    key: 'costs',
    label: 'Coûts',
    columns: [
      'total_cost',
      'stt_cost',
      'tts_cost',
      'llm_cost',
      'telecom_cost',
      'dipler_commission',
    ],
    collapsible: true,
    defaultCollapsed: true,
  },
  {
    key: 'latencies',
    label: 'Latences',
    columns: [
      'avg_llm_latency_ms',
      'min_llm_latency_ms',
      'max_llm_latency_ms',
      'avg_tts_latency_ms',
      'min_tts_latency_ms',
      'max_tts_latency_ms',
      'avg_total_latency_ms',
      'min_total_latency_ms',
      'max_total_latency_ms',
    ],
    collapsible: true,
    defaultCollapsed: true,
  },
  {
    key: 'technical',
    label: 'Technique',
    columns: ['direction', 'llm_model', 'tts_provider', 'conversation_id', 'call_sid'],
    collapsible: true,
    defaultCollapsed: true,
  },
]

// Default visible columns
export const DEFAULT_VISIBLE_COLUMNS = COLUMN_DEFINITIONS.filter((col) => col.defaultVisible).map(
  (col) => col.key,
)

// Default collapsed groups
export const DEFAULT_COLLAPSED_GROUPS = COLUMN_GROUPS.filter((group) => group.defaultCollapsed).map(
  (group) => group.key,
)

// Get column definition by key
export function getColumnDef(key: string): AdminCallsColumnDef | undefined {
  return COLUMN_DEFINITIONS.find((col) => col.key === key)
}

// Get columns for a group
export function getGroupColumns(groupKey: string): AdminCallsColumnDef[] {
  const group = COLUMN_GROUPS.find((g) => g.key === groupKey)
  if (!group) return []
  return group.columns
    .map((key) => getColumnDef(key))
    .filter((col): col is AdminCallsColumnDef => col !== undefined)
}
