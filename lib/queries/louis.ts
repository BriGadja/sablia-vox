import { createClient } from '@/lib/supabase/client'
import type {
  AgentPerformanceData,
  CallExportRow,
  ChartData,
  DashboardFilters,
  KPIMetrics,
} from '@/lib/types/dashboard'

// ============================================================================
// Louis-Nestenn Specific Functions (Qualification, not RDV booking)
// ============================================================================

/**
 * Fetch Louis-Nestenn specific KPI metrics
 * Different from standard Louis: focuses on transfers/qualification, not RDV
 * @param filters - Dashboard filters
 */
export async function fetchLouisNestennKPIs(filters: DashboardFilters): Promise<KPIMetrics> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc('get_louis_nestenn_kpis', {
    p_start_date: filters.startDate,
    p_end_date: filters.endDate,
    p_client_id: filters.clientIds.length === 1 ? filters.clientIds[0] : null,
    p_deployment_id: filters.deploymentId || null,
  })

  if (error) {
    console.error('Error fetching Louis-Nestenn KPIs:', error)
    throw error
  }

  return data as KPIMetrics
}

/**
 * Fetch Louis-Nestenn specific chart data
 * Includes funnel, duration by outcome, etc.
 * @param filters - Dashboard filters
 */
export async function fetchLouisNestennChartData(filters: DashboardFilters): Promise<ChartData> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc('get_louis_nestenn_charts', {
    p_start_date: filters.startDate,
    p_end_date: filters.endDate,
    p_client_id: filters.clientIds.length === 1 ? filters.clientIds[0] : null,
    p_deployment_id: filters.deploymentId || null,
  })

  if (error) {
    console.error('Error fetching Louis-Nestenn chart data:', error)
    throw error
  }

  return data as ChartData
}

// ============================================================================
// Standard Louis Functions (Original RDV-focused)
// ============================================================================

/**
 * Fetch Louis-specific KPI metrics using RPC function
 * Returns current period and previous period comparison
 * @param filters - Dashboard filters
 */
export async function fetchLouisKPIMetrics(filters: DashboardFilters): Promise<KPIMetrics> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc('get_kpi_metrics', {
    p_start_date: filters.startDate,
    p_end_date: filters.endDate,
    p_client_id: filters.clientIds.length === 1 ? filters.clientIds[0] : null,
    p_deployment_id: filters.deploymentId || null,
    p_agent_type_name: 'louis', // CRITICAL: Only show Louis data
  })

  if (error) {
    console.error('Error fetching Louis KPI metrics:', error)
    throw error
  }

  return data as KPIMetrics
}

/**
 * Fetch Louis-specific chart data using RPC function
 * Returns call volume by day, outcome distribution, emotion distribution
 * @param filters - Dashboard filters
 */
export async function fetchLouisChartData(filters: DashboardFilters): Promise<ChartData> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc('get_chart_data', {
    p_start_date: filters.startDate,
    p_end_date: filters.endDate,
    p_client_id: filters.clientIds.length === 1 ? filters.clientIds[0] : null,
    p_deployment_id: filters.deploymentId || null,
    p_agent_type_name: 'louis', // CRITICAL: Only show Louis data
  })

  if (error) {
    console.error('Error fetching Louis chart data:', error)
    throw error
  }

  return data as ChartData
}

/**
 * Fetch Louis agent performance data
 * Uses v_louis_agent_performance view
 * @param filters - Dashboard filters
 */
export async function fetchLouisAgentPerformance(
  filters: DashboardFilters,
): Promise<AgentPerformanceData[]> {
  const supabase = createClient()

  let query = supabase
    .from('v_louis_agent_performance')
    .select('*')
    .gte('started_at', filters.startDate)
    .lte('started_at', filters.endDate)
    .order('total_calls', { ascending: false })

  if (filters.clientIds.length > 0) {
    query = query.in('client_id', filters.clientIds)
  }

  if (filters.deploymentId) {
    query = query.eq('deployment_id', filters.deploymentId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching Louis agent performance:', error)
    throw error
  }

  return data as AgentPerformanceData[]
}

/**
 * Export Louis dashboard data to CSV
 * @param filters - Dashboard filters
 */
export async function exportLouisCallsToCSV(filters: DashboardFilters): Promise<string> {
  const supabase = createClient()

  let query = supabase
    .from('agent_calls')
    .select(`
      *,
      agent_deployments!inner(
        name,
        slug,
        client_id,
        clients(name, industry),
        agent_types!inner(name)
      )
    `)
    .gte('started_at', filters.startDate)
    .lte('started_at', filters.endDate)
    .eq('agent_deployments.agent_types.name', 'louis')
    .order('started_at', { ascending: false })

  if (filters.clientIds.length > 0) {
    query = query.in('agent_deployments.client_id', filters.clientIds)
  }

  if (filters.deploymentId) {
    query = query.eq('deployment_id', filters.deploymentId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching Louis calls for export:', error)
    throw error
  }

  // Convert to CSV
  const headers = [
    'Date',
    'Client',
    'Industry',
    'Agent Louis',
    'First Name',
    'Last Name',
    'Phone',
    'Email',
    'Duration (s)',
    'Cost (€)',
    'Outcome',
    'Emotion',
    'Answered',
    'RDV Scheduled',
    'RDV Accepted',
    'RDV Refused',
    'Callback Requested',
  ]

  const rows = (data as CallExportRow[]).map((call) => [
    new Date(call.started_at).toLocaleString('fr-FR'),
    call.agent_deployments?.clients?.name || '',
    call.agent_deployments?.clients?.industry || '',
    call.agent_deployments?.name || '',
    call.first_name || '',
    call.last_name || '',
    call.phone_number || '',
    call.email || '',
    call.duration_seconds || '',
    call.cost ? call.cost.toFixed(2) : '',
    call.outcome || '',
    call.emotion || '',
    call.answered ? 'Oui' : 'Non',
    call.metadata?.appointment_scheduled_at
      ? new Date(call.metadata.appointment_scheduled_at).toLocaleString('fr-FR')
      : '',
    call.metadata?.appointment_accepted ? 'Oui' : 'Non',
    call.metadata?.appointment_refused ? 'Oui' : 'Non',
    call.metadata?.callback_requested ? 'Oui' : 'Non',
  ])

  const csv = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n')

  // Add BOM for Excel compatibility
  return '\ufeff' + csv
}
