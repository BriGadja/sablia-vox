import { createClient } from '@/lib/supabase/client'
import type {
  AccessibleAgent,
  AgentCardData,
  CallExportRow,
  CallVolumeData,
  DashboardFilters,
  EmotionData,
  KPIMetrics,
  OutcomeData,
} from '@/lib/types/dashboard'
import {
  buildCSV,
  type CSVColumn,
  formatBooleanForCSV,
  formatCurrencyForCSV,
  formatDateForCSV,
} from '@/lib/utils'

/**
 * Check if the current user has admin permissions (browser-side)
 * Queries user_org_memberships for 'admin' permission level, scoped by RLS
 * Server-side variant: checkIsAdminServer() in lib/auth.ts
 */
export async function checkIsAdmin(): Promise<boolean> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('user_org_memberships')
    .select('permission_level')
    .eq('permission_level', 'admin')
    .limit(1)

  if (error) {
    console.error('Error checking admin status:', error)
    return false
  }

  return (data?.length ?? 0) > 0
}

/**
 * Fetch all agent deployments accessible by the authenticated user
 * Uses v_user_accessible_agents view (RLS scoped by JWT org_id)
 */
export async function fetchAccessibleAgents(
  templateType?: string | null,
): Promise<AccessibleAgent[]> {
  const supabase = createClient()

  let query = supabase
    .from('v_user_accessible_agents')
    .select('*')
    .order('template_type')
    .order('deployment_name')

  if (templateType) {
    query = query.eq('template_type', templateType)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching accessible agents:', error)
    throw error
  }

  return data as AccessibleAgent[]
}

/**
 * Fetch dashboard KPIs using v2 RPC
 * Returns current period and previous period comparison
 * org_id is implicit from JWT — never passed explicitly
 */
export async function fetchDashboardKPIs(filters: DashboardFilters): Promise<KPIMetrics> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc('get_dashboard_kpis', {
    p_start_date: filters.startDate,
    p_end_date: filters.endDate,
    p_deployment_id: filters.deploymentId || null,
    p_template_type: filters.templateType || null,
  })

  if (error) {
    console.error('Error fetching dashboard KPIs:', error)
    throw error
  }

  return data as KPIMetrics
}

/**
 * Fetch call volume by day using v2 RPC
 */
export async function fetchCallVolumeByDay(filters: DashboardFilters): Promise<CallVolumeData[]> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc('get_call_volume_by_day', {
    p_start_date: filters.startDate,
    p_end_date: filters.endDate,
    p_deployment_id: filters.deploymentId || null,
    p_template_type: filters.templateType || null,
  })

  if (error) {
    console.error('Error fetching call volume:', error)
    throw error
  }

  // Map 'day' → 'date' to match CallVolumeData interface (RPC returns 'day')
  return (data || []).map((item: Record<string, unknown>) => ({
    date: item.day as string,
    total_calls: item.total_calls as number,
    answered_calls: item.answered_calls as number,
    outbound_calls: item.outbound_calls as number,
    inbound_calls: item.inbound_calls as number,
    conversions: item.conversions as number,
  })) as CallVolumeData[]
}

/**
 * Fetch outcome distribution using v2 RPC
 */
export async function fetchOutcomeDistribution(filters: DashboardFilters): Promise<OutcomeData[]> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc('get_outcome_distribution', {
    p_start_date: filters.startDate,
    p_end_date: filters.endDate,
    p_deployment_id: filters.deploymentId || null,
    p_template_type: filters.templateType || null,
  })

  if (error) {
    console.error('Error fetching outcome distribution:', error)
    throw error
  }

  return (data || []) as OutcomeData[]
}

/**
 * Fetch agent cards data using v2 RPC
 */
export async function fetchAgentCardsData(filters: DashboardFilters): Promise<AgentCardData[]> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc('get_agent_cards_data', {
    p_start_date: filters.startDate,
    p_end_date: filters.endDate,
    p_template_type: filters.templateType || null,
  })

  if (error) {
    console.error('Error fetching agent cards data:', error)
    throw error
  }

  return (data || []) as AgentCardData[]
}

/**
 * Fetch emotion distribution from v_dashboard_calls
 * Groups by emotion and counts (client-side aggregation)
 */
export async function fetchEmotionDistribution(filters: DashboardFilters): Promise<EmotionData[]> {
  const supabase = createClient()

  let query = supabase
    .from('v_dashboard_calls')
    .select('emotion')
    .gte('started_at', filters.startDate)
    .lte('started_at', filters.endDate)
    .not('emotion', 'is', null)
    .not('emotion', 'eq', 'unknown')
    .limit(10000)

  if (filters.deploymentId) {
    query = query.eq('deployment_id', filters.deploymentId)
  }

  if (filters.templateType) {
    query = query.eq('template_type', filters.templateType)
  }

  const { data, error } = await query

  if (error) {
    console.error('fetchEmotionDistribution error:', error)
    return []
  }

  const counts: Record<string, number> = {}
  for (const row of data || []) {
    counts[row.emotion] = (counts[row.emotion] || 0) + 1
  }
  const total = Object.values(counts).reduce((s, v) => s + v, 0)
  return Object.entries(counts).map(([emotion, count]) => ({
    emotion: emotion as EmotionData['emotion'],
    count,
    percentage: total > 0 ? (count / total) * 100 : 0,
  }))
}

/**
 * Export calls to CSV using v_dashboard_calls view
 */
export async function exportCallsToCSV(filters: DashboardFilters): Promise<string> {
  const supabase = createClient()

  let query = supabase
    .from('v_dashboard_calls')
    .select(
      'call_id, started_at, ended_at, duration_seconds, outcome, is_answered, direction, call_reason, phone_number, first_name, last_name, contact_email, billed_cost, quality_score, emotion, deployment_name, template_type, is_conversion',
    )
    .gte('started_at', filters.startDate)
    .lte('started_at', filters.endDate)
    .order('started_at', { ascending: false })

  if (filters.deploymentId) {
    query = query.eq('deployment_id', filters.deploymentId)
  }

  if (filters.templateType) {
    query = query.eq('template_type', filters.templateType)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching calls for export:', error)
    throw error
  }

  const columns: CSVColumn<CallExportRow>[] = [
    {
      header: 'Date',
      accessor: (row) => row.started_at,
      format: (v) => formatDateForCSV(v as string),
    },
    { header: 'Agent', accessor: (row) => row.deployment_name },
    { header: 'Type', accessor: (row) => row.template_type },
    { header: 'Direction', accessor: (row) => row.direction },
    { header: 'Prénom', accessor: (row) => row.first_name || '' },
    { header: 'Nom', accessor: (row) => row.last_name || '' },
    { header: 'Téléphone', accessor: (row) => row.phone_number || '' },
    { header: 'Email', accessor: (row) => row.contact_email || '' },
    { header: 'Durée (s)', accessor: (row) => row.duration_seconds || '' },
    {
      header: 'Coût (€)',
      accessor: (row) => row.billed_cost,
      format: (v) => formatCurrencyForCSV(v as number),
    },
    { header: 'Résultat', accessor: (row) => row.outcome || '' },
    { header: 'Émotion', accessor: (row) => row.emotion || '' },
    {
      header: 'Répondu',
      accessor: (row) => row.is_answered,
      format: (v) => formatBooleanForCSV(v as boolean),
    },
    {
      header: 'Conversion',
      accessor: (row) => row.is_conversion,
      format: (v) => formatBooleanForCSV(v as boolean),
    },
    { header: 'Raison', accessor: (row) => row.call_reason || '' },
    {
      header: 'Qualité',
      accessor: (row) => row.quality_score,
      format: (v) => (v != null ? String(v) : ''),
    },
  ]

  return buildCSV(data as CallExportRow[], columns)
}
