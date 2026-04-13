import { type UseQueryResult, useQuery } from '@tanstack/react-query'
import {
  type ImprovementSuggestion,
  type QualitySnapshot,
  fetchQualitySnapshots,
  fetchSuggestions,
} from '@/lib/queries/agent-insights'

const STALE_TIME = 3600000 // 1 hour
const REFETCH_INTERVAL = 3600000 // 1 hour

/**
 * Hook to fetch quality snapshots for a deployment
 */
export function useQualitySnapshots(
  deploymentId: string,
  days = 30,
): UseQueryResult<QualitySnapshot[]> {
  return useQuery({
    queryKey: ['quality-snapshots', deploymentId, days],
    queryFn: () => fetchQualitySnapshots(deploymentId, days),
    staleTime: STALE_TIME,
    refetchInterval: REFETCH_INTERVAL,
  })
}

/**
 * Hook to fetch improvement suggestions for a deployment
 */
export function useSuggestions(
  deploymentId: string,
): UseQueryResult<ImprovementSuggestion[]> {
  return useQuery({
    queryKey: ['suggestions', deploymentId],
    queryFn: () => fetchSuggestions(deploymentId),
    staleTime: STALE_TIME,
    refetchInterval: REFETCH_INTERVAL,
  })
}
