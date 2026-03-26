import { createClient } from '@/lib/supabase/client'
import type {
  AccessibleAgent,
  AccessibleClient,
  AgentCardData,
  AgentTypeCardData,
  AgentTypePerformance,
  CallExportRow,
  ChartData,
  ClientCardData,
  DashboardFilters,
  KPIMetrics,
  TopClientData,
} from '@/lib/types/dashboard'
import {
  buildCSV,
  type CSVColumn,
  formatBooleanForCSV,
  formatCurrencyForCSV,
  formatDateForCSV,
} from '@/lib/utils'

/**
 * Check if the current user has admin permissions
 * Returns true if user has at least one client with 'admin' permission level
 */
export async function checkIsAdmin(): Promise<boolean> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('user_client_permissions')
    .select('permission_level')
    .eq('permission_level', 'admin')
    .limit(1)

  if (error) {
    console.error('Error checking admin status:', error)
    return false
  }

  return data && data.length > 0
}

/**
 * Fetch all clients accessible by the authenticated user
 * Uses v_user_accessible_clients view with RLS
 */
export async function fetchAccessibleClients(): Promise<AccessibleClient[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('v_user_accessible_clients')
    .select('*')
    .order('client_name')

  if (error) {
    console.error('Error fetching accessible clients:', error)
    throw error
  }

  return data as AccessibleClient[]
}

/**
 * Fetch all agent deployments accessible by the authenticated user
 * Uses v_user_accessible_agents view with RLS
 * @param clientIds - Optional filter by client IDs
 * @param agentTypeName - Optional filter by agent type (louis, arthur, alexandra)
 */
export async function fetchAccessibleAgents(
  clientIds?: string[],
  agentTypeName?: string | null,
): Promise<AccessibleAgent[]> {
  const supabase = createClient()

  let query = supabase
    .from('v_user_accessible_agents')
    .select('*')
    .order('client_name')
    .order('deployment_name')

  if (clientIds && clientIds.length > 0) {
    query = query.in('client_id', clientIds)
  }

  if (agentTypeName) {
    query = query.eq('agent_type_name', agentTypeName)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching accessible agents:', error)
    throw error
  }

  return data as AccessibleAgent[]
}

/**
 * Fetch Global KPI metrics using RPC function
 * Returns current period and previous period comparison
 * @param filters - Dashboard filters (clientIds, deploymentId, agentTypeName, startDate, endDate)
 */
export async function fetchGlobalKPIs(filters: DashboardFilters): Promise<KPIMetrics> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc('get_global_kpis', {
    p_start_date: filters.startDate,
    p_end_date: filters.endDate,
    p_client_ids: filters.clientIds.length > 0 ? filters.clientIds : null,
    p_deployment_id: filters.deploymentId || null,
    p_agent_type_name: filters.agentTypeName || null,
  })

  if (error) {
    console.error('Error fetching global KPIs:', error)
    throw error
  }

  return data as KPIMetrics
}

/**
 * Fetch Global chart data using RPC function
 * Returns call volume by day, outcome distribution, emotion distribution, etc.
 * @param filters - Dashboard filters (clientIds, deploymentId, agentTypeName, startDate, endDate)
 */
export async function fetchGlobalChartData(filters: DashboardFilters): Promise<ChartData> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc('get_global_chart_data', {
    p_start_date: filters.startDate,
    p_end_date: filters.endDate,
    p_client_ids: filters.clientIds.length > 0 ? filters.clientIds : null,
    p_deployment_id: filters.deploymentId || null,
    p_agent_type_name: filters.agentTypeName || null,
  })

  if (error) {
    console.error('Error fetching global chart data:', error)
    throw error
  }

  return data as ChartData
}

/**
 * Fetch top clients by performance
 * Uses get_top_clients RPC function with date filtering
 * @param filters - Dashboard filters
 * @param limit - Maximum number of clients to return (default: 10)
 */
export async function fetchTopClients(
  filters: DashboardFilters,
  limit: number = 10,
): Promise<TopClientData[]> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc('get_top_clients', {
    p_start_date: filters.startDate,
    p_end_date: filters.endDate,
    p_client_ids: filters.clientIds.length > 0 ? filters.clientIds : null,
    p_agent_type_name: filters.agentTypeName || null,
    p_limit: limit,
  })

  if (error) {
    console.error('Error fetching top clients:', error)
    throw error
  }

  return (data || []) as TopClientData[]
}

/**
 * Fetch agent type performance comparison
 * Uses get_agent_type_performance RPC function with date filtering
 * @param filters - Dashboard filters
 */
export async function fetchAgentTypePerformance(
  filters: DashboardFilters,
): Promise<AgentTypePerformance[]> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc('get_agent_type_performance', {
    p_start_date: filters.startDate,
    p_end_date: filters.endDate,
    p_client_ids: filters.clientIds.length > 0 ? filters.clientIds : null,
  })

  if (error) {
    console.error('Error fetching agent type performance:', error)
    throw error
  }

  return (data || []) as AgentTypePerformance[]
}

/**
 * Fetch client card data with aggregated metrics for the dashboard
 * Uses RPC function get_client_cards_data
 * @param filters - Dashboard filters (startDate, endDate, optional clientIds)
 */
export async function fetchClientCardsData(filters: DashboardFilters): Promise<ClientCardData[]> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc('get_client_cards_data', {
    p_start_date: filters.startDate,
    p_end_date: filters.endDate,
    p_client_ids: filters.clientIds.length > 0 ? filters.clientIds : null,
  })

  if (error) {
    console.error('Error fetching client cards data:', error)
    throw error
  }

  return data as ClientCardData[]
}

/**
 * Fetch agent card data with aggregated metrics for the dashboard
 * Uses RPC function get_agent_cards_data
 * @param filters - Dashboard filters (startDate, endDate, optional clientIds)
 */
export async function fetchAgentCardsData(filters: DashboardFilters): Promise<AgentCardData[]> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc('get_agent_cards_data', {
    p_start_date: filters.startDate,
    p_end_date: filters.endDate,
    p_client_ids: filters.clientIds.length > 0 ? filters.clientIds : null,
  })

  if (error) {
    console.error('Error fetching agent cards data:', error)
    throw error
  }

  return data as AgentCardData[]
}

/**
 * Fetch agent type card data with aggregated metrics for ALL deployments of each agent type
 * Uses RPC function get_agent_type_cards_data
 * Returns one card per agent type (e.g., one "Louis" card for all Louis deployments)
 * @param filters - Dashboard filters (startDate, endDate, optional clientIds)
 */
export async function fetchAgentTypeCardsData(
  filters: DashboardFilters,
): Promise<AgentTypeCardData[]> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc('get_agent_type_cards_data', {
    p_start_date: filters.startDate,
    p_end_date: filters.endDate,
    p_client_ids: filters.clientIds.length > 0 ? filters.clientIds : null,
  })

  if (error) {
    console.error('Error fetching agent type cards data:', error)
    throw error
  }

  return data as AgentTypeCardData[]
}

/**
 * Determine the default dashboard destination for a user
 * Returns null if user should see global dashboard
 * Returns agent type name if user should be redirected to specific agent dashboard
 *
 * Logic:
 * - If user has access to >= 2 clients OR >= 2 agents → Global dashboard (null)
 * - If user has access to exactly 1 agent → Redirect to that agent's dashboard
 * - Otherwise → Global dashboard (null) as fallback
 */
export async function getDashboardDestination(): Promise<{
  shouldRedirect: boolean
  agentType?: string
}> {
  try {
    // Fetch accessible clients and agents
    const [clients, agents] = await Promise.all([fetchAccessibleClients(), fetchAccessibleAgents()])

    // If user has 2+ clients or 2+ agents, show global dashboard
    if (clients.length >= 2 || agents.length >= 2) {
      return { shouldRedirect: false }
    }

    // If user has exactly 1 agent, redirect to that agent's dashboard
    if (agents.length === 1) {
      const agentType = agents[0].agent_type_name
      return {
        shouldRedirect: true,
        agentType,
      }
    }

    // Fallback: show global dashboard
    return { shouldRedirect: false }
  } catch (error) {
    console.error('Error determining dashboard destination:', error)
    // On error, default to global dashboard
    return { shouldRedirect: false }
  }
}

/**
 * Export global dashboard data to CSV
 * Uses the generic buildCSV utility for consistent CSV generation
 * @param filters - Dashboard filters
 */
export async function exportGlobalCallsToCSV(filters: DashboardFilters): Promise<string> {
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
        agent_types!inner(name, display_name)
      )
    `)
    .gte('started_at', filters.startDate)
    .lte('started_at', filters.endDate)
    .order('started_at', { ascending: false })

  if (filters.clientIds.length > 0) {
    query = query.in('agent_deployments.client_id', filters.clientIds)
  }

  if (filters.deploymentId) {
    query = query.eq('deployment_id', filters.deploymentId)
  }

  if (filters.agentTypeName) {
    query = query.eq('agent_deployments.agent_types.name', filters.agentTypeName)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching calls for export:', error)
    throw error
  }

  // Define columns using the generic CSV builder
  const columns: CSVColumn<CallExportRow>[] = [
    {
      header: 'Date',
      accessor: (row) => row.started_at,
      format: (v) => formatDateForCSV(v as string),
    },
    { header: 'Client', accessor: (row) => row.agent_deployments?.clients?.name || '' },
    { header: 'Industry', accessor: (row) => row.agent_deployments?.clients?.industry || '' },
    {
      header: 'Agent Type',
      accessor: (row) => row.agent_deployments?.agent_types?.display_name || '',
    },
    { header: 'Agent Name', accessor: (row) => row.agent_deployments?.name || '' },
    { header: 'First Name', accessor: (row) => row.first_name || '' },
    { header: 'Last Name', accessor: (row) => row.last_name || '' },
    { header: 'Phone', accessor: (row) => row.phone_number || '' },
    { header: 'Email', accessor: (row) => row.email || '' },
    { header: 'Duration (s)', accessor: (row) => row.duration_seconds || '' },
    {
      header: 'Cost (€)',
      accessor: (row) => row.cost,
      format: (v) => formatCurrencyForCSV(v as number),
    },
    { header: 'Outcome', accessor: (row) => row.outcome || '' },
    { header: 'Emotion', accessor: (row) => row.emotion || '' },
    {
      header: 'Answered',
      accessor: (row) => row.answered,
      format: (v) => formatBooleanForCSV(v as boolean),
    },
    {
      header: 'RDV Scheduled',
      accessor: (row) => row.metadata?.appointment_scheduled_at,
      format: (v) => formatDateForCSV(v as string),
    },
  ]

  return buildCSV(data as CallExportRow[], columns)
}
