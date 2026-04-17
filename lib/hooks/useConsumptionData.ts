import { type UseQueryResult, useQuery } from '@tanstack/react-query'
import { fetchConsumptionMetrics } from '@/lib/queries/consumption'
import type { ConsumptionFilters, ConsumptionMetrics } from '@/lib/types/consumption'

const STALE_TIME = 3600000
const REFETCH_INTERVAL = 3600000

export function useConsumptionData(
  filters: ConsumptionFilters,
): UseQueryResult<ConsumptionMetrics> {
  return useQuery({
    queryKey: ['consumption-metrics', filters.startDate, filters.endDate, filters.clientsOnly],
    queryFn: () => fetchConsumptionMetrics(filters.startDate, filters.endDate, filters.clientsOnly),
    staleTime: STALE_TIME,
    refetchInterval: REFETCH_INTERVAL,
  })
}
