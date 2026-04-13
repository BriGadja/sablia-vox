import { createClient } from '@/lib/supabase/client'
import type { ConsumptionMetrics } from '@/lib/types/consumption'

/**
 * Fetch consumption metrics via the get_consumption_metrics RPC
 * Org-scoped via JWT app_metadata.org_id
 */
export async function fetchConsumptionMetrics(
  startDate: string,
  endDate: string,
): Promise<ConsumptionMetrics> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc('get_consumption_metrics', {
    p_start_date: startDate,
    p_end_date: endDate,
  })

  if (error) {
    throw new Error(`Consumption metrics error: ${error.message}`)
  }

  return data as ConsumptionMetrics
}
