/**
 * Admin Calls Query Functions
 * Supabase RPC calls for admin calls table
 */

import { createClient } from '@/lib/supabase/client'
import type {
  AdminCallRow,
  AdminCallsFilters,
  AdminCallsResponse,
  AdminCallsSort,
} from '@/lib/types/adminCalls'

interface ExportResponse {
  data: AdminCallRow[]
  exportedCount: number
  limitReached: boolean
}

/**
 * Fetch paginated calls for admin table
 */
export async function fetchAdminCallsPaginated(
  filters: AdminCallsFilters,
  sort: AdminCallsSort,
  page: number,
  pageSize: number,
): Promise<AdminCallsResponse> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc('get_admin_calls_paginated', {
    p_start_date: filters.startDate,
    p_end_date: filters.endDate,
    p_client_ids: filters.clientIds.length > 0 ? filters.clientIds : null,
    p_agent_type_name: filters.agentTypeName || null,
    p_outcomes: filters.outcomes.length > 0 ? filters.outcomes : null,
    p_emotion: filters.emotion || null,
    p_direction: filters.direction || null,
    p_search_text: filters.searchText || null,
    p_sort_column: sort.column,
    p_sort_direction: sort.direction,
    p_page: page,
    p_page_size: pageSize,
  })

  if (error) {
    console.error('Error fetching admin calls:', error)
    throw new Error(`Failed to fetch admin calls: ${error.message}`)
  }

  // The RPC returns JSONB, so data is already parsed
  const result = data as AdminCallsResponse
  return result
}

/**
 * Fetch all filtered calls for export (no pagination)
 */
export async function fetchAdminCallsExport(filters: AdminCallsFilters): Promise<ExportResponse> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc('get_admin_calls_export', {
    p_start_date: filters.startDate,
    p_end_date: filters.endDate,
    p_client_ids: filters.clientIds.length > 0 ? filters.clientIds : null,
    p_agent_type_name: filters.agentTypeName || null,
    p_outcomes: filters.outcomes.length > 0 ? filters.outcomes : null,
    p_emotion: filters.emotion || null,
    p_direction: filters.direction || null,
    p_search_text: filters.searchText || null,
  })

  if (error) {
    console.error('Error fetching admin calls for export:', error)
    throw new Error(`Failed to export admin calls: ${error.message}`)
  }

  return data as ExportResponse
}

/**
 * Export calls data to CSV
 */
export function exportCallsToCSV(data: AdminCallRow[], filename: string): void {
  // Define columns for export
  const columns = [
    { key: 'started_at', label: 'Date/Heure' },
    { key: 'client_name', label: 'Client' },
    { key: 'deployment_name', label: 'Agent' },
    { key: 'agent_type_name', label: 'Type Agent' },
    { key: 'first_name', label: 'Prénom' },
    { key: 'last_name', label: 'Nom' },
    { key: 'phone_number', label: 'Téléphone' },
    { key: 'email', label: 'Email' },
    { key: 'outcome', label: 'Résultat' },
    { key: 'emotion', label: 'Émotion' },
    { key: 'answered', label: 'Décroché' },
    { key: 'appointment_scheduled', label: 'RDV Pris' },
    { key: 'duration_seconds', label: 'Durée (s)' },
    { key: 'total_cost', label: 'Coût Total (€)' },
    { key: 'stt_cost', label: 'Coût STT (€)' },
    { key: 'tts_cost', label: 'Coût TTS (€)' },
    { key: 'llm_cost', label: 'Coût LLM (€)' },
    { key: 'telecom_cost', label: 'Coût Telecom (€)' },
    { key: 'avg_llm_latency_ms', label: 'Latence LLM Moy (ms)' },
    { key: 'avg_tts_latency_ms', label: 'Latence TTS Moy (ms)' },
    { key: 'avg_total_latency_ms', label: 'Latence Totale Moy (ms)' },
    { key: 'direction', label: 'Direction' },
    { key: 'llm_model', label: 'Modèle LLM' },
    { key: 'tts_provider', label: 'Fournisseur TTS' },
    { key: 'conversation_id', label: 'ID Conversation' },
    { key: 'call_sid', label: 'Call SID' },
    { key: 'recording_url', label: 'URL Enregistrement' },
    { key: 'transcript_summary', label: 'Résumé' },
  ]

  // Build header row
  const header = columns.map((col) => col.label).join(';')

  // Build data rows
  const rows = data.map((row) => {
    return columns
      .map((col) => {
        const value = row[col.key as keyof AdminCallRow]

        // Format specific types
        if (value === null || value === undefined) {
          return ''
        }
        if (typeof value === 'boolean') {
          return value ? 'Oui' : 'Non'
        }
        if (col.key === 'started_at' && typeof value === 'string') {
          return new Date(value).toLocaleString('fr-FR')
        }
        if ((col.key.includes('cost') || col.key === 'total_cost') && typeof value === 'number') {
          return value.toFixed(4)
        }
        if (typeof value === 'string') {
          // Escape quotes and semicolons for CSV
          return `"${value.replace(/"/g, '""')}"`
        }
        return String(value)
      })
      .join(';')
  })

  // Combine and create blob
  const csvContent = [header, ...rows].join('\n')
  const blob = new Blob(['\ufeff' + csvContent], {
    type: 'text/csv;charset=utf-8;',
  })

  // Trigger download
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Fetch all clients for multi-select filter (admin only)
 */
export async function fetchAllClients(): Promise<Array<{ id: string; name: string }>> {
  const supabase = createClient()

  const { data, error } = await supabase.from('clients').select('id, name').order('name')

  if (error) {
    console.error('Error fetching clients:', error)
    throw new Error(`Failed to fetch clients: ${error.message}`)
  }

  return data || []
}
