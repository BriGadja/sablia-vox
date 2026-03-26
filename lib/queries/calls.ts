import { createClient } from '@/lib/supabase/client'
import type { CallsPageResponse, DashboardCall, DashboardFilters } from '@/lib/types/dashboard'

/**
 * Fetch paginated calls using get_calls_page RPC
 */
export async function fetchCallsPage(
  filters: DashboardFilters,
  limit: number = 50,
  offset: number = 0,
): Promise<CallsPageResponse> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc('get_calls_page', {
    p_start_date: filters.startDate,
    p_end_date: filters.endDate,
    p_deployment_id: filters.deploymentId || null,
    p_template_type: filters.templateType || null,
    p_limit: limit,
    p_offset: offset,
  })

  if (error) {
    console.error('Error fetching calls page:', error)
    throw error
  }

  // RPC returns { total, data }
  const result = data as CallsPageResponse
  return {
    total: result?.total ?? 0,
    data: result?.data ?? [],
  }
}

/**
 * Fetch a single call by ID from v_dashboard_calls view
 */
export async function fetchCallById(callId: string): Promise<DashboardCall | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('v_dashboard_calls')
    .select('*')
    .eq('call_id', callId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Error fetching call:', error)
    throw error
  }

  return data as DashboardCall
}
