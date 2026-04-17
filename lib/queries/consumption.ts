import { createClient } from '@/lib/supabase/client'
import type { ConsumptionMetrics } from '@/lib/types/consumption'

export async function fetchConsumptionMetrics(
  startDate: string,
  endDate: string,
  clientsOnly = false,
): Promise<ConsumptionMetrics> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc('get_consumption_metrics', {
    p_start_date: startDate,
    p_end_date: endDate,
    p_clients_only: clientsOnly,
  })

  if (error) {
    throw new Error(`Consumption metrics error: ${error.message}`)
  }

  return data as ConsumptionMetrics
}
