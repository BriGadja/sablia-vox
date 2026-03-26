import { type UseQueryResult, useQuery } from '@tanstack/react-query'
import {
  fetchAccessibleAgents,
  fetchAgentCardsData,
  fetchCallVolumeByDay,
  fetchDashboardKPIs,
  fetchEmotionDistribution,
  fetchOutcomeDistribution,
} from '@/lib/queries/global'
import type {
  AccessibleAgent,
  AgentCardData,
  CallVolumeData,
  DashboardFilters,
  EmotionData,
  KPIMetrics,
  OutcomeData,
} from '@/lib/types/dashboard'

// Query configuration constants
const STALE_TIME = 3600000 // 1 hour
const REFETCH_INTERVAL = 3600000 // 1 hour

/**
 * Serialize DashboardFilters to a stable string for query keys
 */
function serializeFilters(filters: DashboardFilters): string {
  return JSON.stringify({
    deploymentId: filters.deploymentId || '',
    templateType: filters.templateType || '',
    startDate: filters.startDate,
    endDate: filters.endDate,
  })
}

/**
 * Hook to fetch all agent deployments accessible by the authenticated user
 * Uses v_user_accessible_agents view (RLS scoped by JWT org_id)
 */
export function useAccessibleAgents(
  templateType?: string | null,
): UseQueryResult<AccessibleAgent[]> {
  return useQuery({
    queryKey: ['accessible-agents', templateType || ''],
    queryFn: () => fetchAccessibleAgents(templateType),
    staleTime: STALE_TIME,
    refetchInterval: REFETCH_INTERVAL,
  })
}

/**
 * Hook to fetch dashboard KPIs
 */
export function useDashboardKPIs(filters: DashboardFilters): UseQueryResult<KPIMetrics> {
  return useQuery({
    queryKey: ['dashboard-kpis', serializeFilters(filters)],
    queryFn: () => fetchDashboardKPIs(filters),
    staleTime: STALE_TIME,
    refetchInterval: REFETCH_INTERVAL,
  })
}

/**
 * Hook to fetch call volume by day
 */
export function useCallVolumeByDay(filters: DashboardFilters): UseQueryResult<CallVolumeData[]> {
  return useQuery({
    queryKey: ['call-volume-by-day', serializeFilters(filters)],
    queryFn: () => fetchCallVolumeByDay(filters),
    staleTime: STALE_TIME,
    refetchInterval: REFETCH_INTERVAL,
  })
}

/**
 * Hook to fetch outcome distribution
 */
export function useOutcomeDistribution(filters: DashboardFilters): UseQueryResult<OutcomeData[]> {
  return useQuery({
    queryKey: ['outcome-distribution', serializeFilters(filters)],
    queryFn: () => fetchOutcomeDistribution(filters),
    staleTime: STALE_TIME,
    refetchInterval: REFETCH_INTERVAL,
  })
}

/**
 * Hook to fetch emotion distribution
 */
export function useEmotionDistribution(filters: DashboardFilters): UseQueryResult<EmotionData[]> {
  return useQuery({
    queryKey: ['emotion-distribution', serializeFilters(filters)],
    queryFn: () => fetchEmotionDistribution(filters),
    staleTime: STALE_TIME,
    refetchInterval: REFETCH_INTERVAL,
  })
}

/**
 * Hook to fetch agent cards data
 */
export function useAgentCardsData(filters: DashboardFilters): UseQueryResult<AgentCardData[]> {
  return useQuery({
    queryKey: ['agent-cards-data', serializeFilters(filters)],
    queryFn: () => fetchAgentCardsData(filters),
    staleTime: STALE_TIME,
    refetchInterval: REFETCH_INTERVAL,
  })
}
