import { createClient } from '@/lib/supabase/client'

/**
 * Call data type for calls listing and detail
 */
export interface CallData {
  id: string
  deployment_id: string
  started_at: string
  ended_at: string | null
  duration_seconds: number
  phone_number: string
  first_name: string | null
  last_name: string | null
  email: string | null
  outcome: string
  emotion: string | null
  answered: boolean
  cost: number
  metadata: Record<string, any> | null
  recording_url: string | null
  transcript: string | null
  appointment_scheduled: boolean
  agent_deployments: {
    name: string
    slug: string
    client_id: string
    clients: {
      name: string
      industry: string | null
    }
    agent_types: {
      name: string
    }
  }
}

/**
 * Fetch calls for a specific agent deployment
 * @param deploymentId - Agent deployment UUID
 * @param startDate - Start date filter (YYYY-MM-DD)
 * @param endDate - End date filter (YYYY-MM-DD)
 * @param limit - Max number of calls to return
 * @param offset - Pagination offset
 */
export async function fetchAgentCalls(
  deploymentId: string,
  startDate: string,
  endDate: string,
  limit: number = 50,
  offset: number = 0,
): Promise<{ calls: CallData[]; total: number }> {
  const supabase = createClient()

  // First get total count
  const { count, error: countError } = await supabase
    .from('agent_calls')
    .select('*', { count: 'exact', head: true })
    .eq('deployment_id', deploymentId)
    .gte('started_at', startDate)
    .lte('started_at', endDate)

  if (countError) {
    console.error('Error counting calls:', countError)
    throw countError
  }

  // Then get paginated data
  const { data, error } = await supabase
    .from('agent_calls')
    .select(`
      *,
      agent_deployments!inner(
        name,
        slug,
        client_id,
        clients(name, industry),
        agent_types(name)
      )
    `)
    .eq('deployment_id', deploymentId)
    .gte('started_at', startDate)
    .lte('started_at', endDate)
    .order('started_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching agent calls:', error)
    throw error
  }

  return {
    calls: data as CallData[],
    total: count || 0,
  }
}

/**
 * Fetch a single call by ID
 * @param callId - Call UUID
 */
export async function fetchCallById(callId: string): Promise<CallData | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('agent_calls')
    .select(`
      *,
      agent_deployments!inner(
        name,
        slug,
        client_id,
        clients(name, industry),
        agent_types(name)
      )
    `)
    .eq('id', callId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // Row not found
      return null
    }
    console.error('Error fetching call:', error)
    throw error
  }

  return data as CallData
}
