import { type UseQueryResult, useQuery } from '@tanstack/react-query'
import { fetchConsumptionMetrics } from '@/lib/queries/consumption'
import type { ConsumptionFilters, ConsumptionMetrics } from '@/lib/types/consumption'

// Match existing dashboard conventions
const STALE_TIME = 3600000 // 1 hour
const REFETCH_INTERVAL = 3600000 // 1 hour

/**
 * Hook to fetch consumption metrics for a date range
 */
export function useConsumptionData(
  filters: ConsumptionFilters,
): UseQueryResult<ConsumptionMetrics> {
  return useQuery({
    queryKey: ['consumption-metrics', filters.startDate, filters.endDate],
    queryFn: () => fetchConsumptionMetrics(filters.startDate, filters.endDate),
    staleTime: STALE_TIME,
    refetchInterval: REFETCH_INTERVAL,
  })
}
