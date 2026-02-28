import { createClient } from '@/lib/supabase/client'
import type { AgentDeploymentListItem, ChartData, Client, KPIMetrics } from '@/lib/types/database'

export async function fetchKPIMetrics(
  startDate: Date,
  endDate: Date,
  clientId?: string | null,
  deploymentId?: string | null,
): Promise<KPIMetrics> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc('get_kpi_metrics', {
    p_start_date: startDate.toISOString(),
    p_end_date: endDate.toISOString(),
    p_client_id: clientId || null,
    p_deployment_id: deploymentId || null, // ⚠️ CHANGED: p_agent_id → p_deployment_id
  })

  if (error) {
    console.error('Error fetching KPI metrics:', error)
    throw error
  }

  return data as KPIMetrics
}

export async function fetchChartData(
  startDate: Date,
  endDate: Date,
  clientId?: string | null,
  deploymentId?: string | null,
): Promise<ChartData> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc('get_chart_data', {
    p_start_date: startDate.toISOString(),
    p_end_date: endDate.toISOString(),
    p_client_id: clientId || null,
    p_deployment_id: deploymentId || null, // ⚠️ CHANGED: p_agent_id → p_deployment_id
  })

  if (error) {
    console.error('Error fetching chart data:', error)
    throw error
  }

  return data as ChartData
}

export async function fetchClients(): Promise<Client[]> {
  const supabase = createClient()

  const { data, error } = await supabase.from('clients').select('*').order('name')

  if (error) {
    console.error('Error fetching clients:', error)
    throw error
  }

  return data
}

// ⚠️ CHANGED: Récupère les deployments Louis au lieu des agents
export async function fetchAgents(clientIds?: string[]): Promise<AgentDeploymentListItem[]> {
  const supabase = createClient()

  let query = supabase
    .from('agent_deployments')
    .select(`
      id,
      name,
      client_id,
      agent_types!inner(name)
    `)
    .eq('status', 'active')
    .eq('agent_types.name', 'louis') // Filtre Louis uniquement
    .order('name')

  if (clientIds && clientIds.length > 0) {
    query = query.in('client_id', clientIds)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching agent deployments:', error)
    throw error
  }

  // Mapper pour retourner seulement les champs nécessaires
  return data.map(({ id, name, client_id }) => ({
    id,
    name,
    client_id,
  }))
}

export async function exportCallsToCSV(
  startDate: Date,
  endDate: Date,
  clientId?: string | null,
  deploymentId?: string | null,
): Promise<string> {
  const supabase = createClient()

  // ⚠️ CHANGED: Query agent_calls avec JOINs
  let query = supabase
    .from('agent_calls')
    .select(`
      *,
      agent_deployments!inner(
        name,
        client_id,
        clients(name),
        agent_types!inner(name)
      )
    `)
    .gte('started_at', startDate.toISOString())
    .lte('started_at', endDate.toISOString())
    .eq('agent_deployments.agent_types.name', 'louis') // Filtre Louis uniquement
    .order('started_at', { ascending: false })

  if (clientId) {
    query = query.eq('agent_deployments.client_id', clientId)
  }

  if (deploymentId) {
    query = query.eq('deployment_id', deploymentId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching calls for export:', error)
    throw error
  }

  // Convert to CSV
  const headers = [
    'Date',
    'Client',
    'Agent Deployment',
    'First Name',
    'Last Name',
    'Phone',
    'Email',
    'Duration (s)',
    'Cost (€)',
    'Outcome',
    'Emotion',
    'RDV Scheduled',
  ]

  const rows = data.map((call: any) => [
    new Date(call.started_at).toLocaleString('fr-FR'),
    call.agent_deployments?.clients?.name || '',
    call.agent_deployments?.name || '',
    call.first_name || '',
    call.last_name || '',
    call.phone_number || '', // ⚠️ CHANGED: phone → phone_number
    call.email || '',
    call.duration_seconds || '',
    call.cost ? call.cost.toFixed(2) : '',
    call.outcome || '', // ⚠️ CHANGED: call_outcome → outcome
    call.emotion || '',
    call.metadata?.appointment_scheduled_at // ⚠️ CHANGED: colonne → metadata
      ? new Date(call.metadata.appointment_scheduled_at).toLocaleString('fr-FR')
      : '',
  ])

  const csv = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n')

  // Add BOM for Excel compatibility
  return '\ufeff' + csv
}
