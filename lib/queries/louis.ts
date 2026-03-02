import { createClient } from '@/lib/supabase/client'
import type { ChartData, DashboardFilters, KPIMetrics } from '@/lib/types/dashboard'

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
