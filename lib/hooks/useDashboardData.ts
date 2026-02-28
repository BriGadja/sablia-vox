import { type UseQueryResult, useQuery } from '@tanstack/react-query'
import {
  fetchAccessibleAgents,
  fetchAccessibleClients,
  fetchAgentCardsData,
  fetchAgentTypeCardsData,
  fetchAgentTypePerformance,
  fetchClientCardsData,
  fetchGlobalChartData,
  fetchGlobalKPIs,
  fetchTopClients,
} from '@/lib/queries/global'
import {
  fetchLouisAgentPerformance,
  fetchLouisChartData,
  fetchLouisKPIMetrics,
} from '@/lib/queries/louis'
import type {
  AccessibleAgent,
  AccessibleClient,
  AgentCardData,
  AgentPerformanceData,
  AgentTypeCardData,
  AgentTypePerformance,
  ChartData,
  ClientCardData,
  DashboardFilters,
  KPIMetrics,
  TopClientData,
} from '@/lib/types/dashboard'
import { serializeQueryKey } from '@/lib/utils'

// Query configuration constants
const STALE_TIME = 3600000 // 1 hour
const REFETCH_INTERVAL = 3600000 // 1 hour

/**
 * Serialize DashboardFilters to a stable string for query keys
 * This prevents cache misses from object reference changes
 */
function serializeFilters(filters: DashboardFilters): string {
  return JSON.stringify({
    clientIds: filters.clientIds?.slice().sort() || [],
    deploymentId: filters.deploymentId || '',
    agentTypeName: filters.agentTypeName || '',
    startDate: filters.startDate,
    endDate: filters.endDate,
  })
}

/**
 * Hook to fetch all clients accessible by the authenticated user
 * Uses v_user_accessible_clients view with RLS
 */
export function useAccessibleClients(): UseQueryResult<AccessibleClient[]> {
  return useQuery({
    queryKey: ['accessible-clients'],
    queryFn: fetchAccessibleClients,
    staleTime: STALE_TIME,
    refetchInterval: REFETCH_INTERVAL,
  })
}

/**
 * Hook to fetch all agent deployments accessible by the authenticated user
 * Uses v_user_accessible_agents view with RLS
 * @param clientIds - Optional filter by client IDs
 * @param agentTypeName - Optional filter by agent type
 */
export function useAccessibleAgents(
  clientIds?: string[],
  agentTypeName?: 'louis' | 'arthur' | 'alexandra' | null,
): UseQueryResult<AccessibleAgent[]> {
  return useQuery({
    queryKey: ['accessible-agents', serializeQueryKey(clientIds), agentTypeName || ''],
    queryFn: () => fetchAccessibleAgents(clientIds, agentTypeName),
    staleTime: STALE_TIME,
    refetchInterval: REFETCH_INTERVAL,
  })
}

/**
 * Hook to fetch Global KPI metrics
 * @param filters - Dashboard filters
 */
export function useGlobalKPIs(filters: DashboardFilters): UseQueryResult<KPIMetrics> {
  return useQuery({
    queryKey: ['global-kpis', serializeFilters(filters)],
    queryFn: () => fetchGlobalKPIs(filters),
    staleTime: STALE_TIME,
    refetchInterval: REFETCH_INTERVAL,
  })
}

/**
 * Hook to fetch Global chart data
 * @param filters - Dashboard filters
 */
export function useGlobalChartData(filters: DashboardFilters): UseQueryResult<ChartData> {
  return useQuery({
    queryKey: ['global-chart-data', serializeFilters(filters)],
    queryFn: () => fetchGlobalChartData(filters),
    staleTime: STALE_TIME,
    refetchInterval: REFETCH_INTERVAL,
  })
}

/**
 * Hook to fetch top clients by performance
 * @param filters - Dashboard filters
 * @param limit - Maximum number of clients to return
 */
export function useTopClients(
  filters: DashboardFilters,
  limit: number = 10,
): UseQueryResult<TopClientData[]> {
  return useQuery({
    queryKey: ['top-clients', serializeFilters(filters), limit],
    queryFn: () => fetchTopClients(filters, limit),
    staleTime: STALE_TIME,
    refetchInterval: REFETCH_INTERVAL,
  })
}

/**
 * Hook to fetch agent type performance comparison
 * @param filters - Dashboard filters
 */
export function useAgentTypePerformance(
  filters: DashboardFilters,
): UseQueryResult<AgentTypePerformance[]> {
  return useQuery({
    queryKey: ['agent-type-performance', serializeFilters(filters)],
    queryFn: () => fetchAgentTypePerformance(filters),
    staleTime: STALE_TIME,
    refetchInterval: REFETCH_INTERVAL,
  })
}

/**
 * Hook to fetch Louis KPI metrics
 * @param filters - Dashboard filters
 */
export function useLouisKPIs(filters: DashboardFilters): UseQueryResult<KPIMetrics> {
  return useQuery({
    queryKey: ['louis-kpis', serializeFilters(filters)],
    queryFn: () => fetchLouisKPIMetrics(filters),
    staleTime: STALE_TIME,
    refetchInterval: REFETCH_INTERVAL,
  })
}

/**
 * Hook to fetch Louis chart data
 * @param filters - Dashboard filters
 */
export function useLouisChartData(filters: DashboardFilters): UseQueryResult<ChartData> {
  return useQuery({
    queryKey: ['louis-chart-data', serializeFilters(filters)],
    queryFn: () => fetchLouisChartData(filters),
    staleTime: STALE_TIME,
    refetchInterval: REFETCH_INTERVAL,
  })
}

/**
 * Hook to fetch Louis agent performance
 * @param filters - Dashboard filters
 */
export function useLouisAgentPerformance(
  filters: DashboardFilters,
): UseQueryResult<AgentPerformanceData[]> {
  return useQuery({
    queryKey: ['louis-agent-performance', serializeFilters(filters)],
    queryFn: () => fetchLouisAgentPerformance(filters),
    staleTime: STALE_TIME,
    refetchInterval: REFETCH_INTERVAL,
  })
}

/**
 * Hook to fetch client cards data for dynamic dashboard
 * @param filters - Dashboard filters (startDate, endDate, clientIds)
 */
export function useClientCardsData(filters: DashboardFilters): UseQueryResult<ClientCardData[]> {
  return useQuery({
    queryKey: ['client-cards-data', serializeFilters(filters)],
    queryFn: () => fetchClientCardsData(filters),
    staleTime: STALE_TIME,
    refetchInterval: REFETCH_INTERVAL,
  })
}

/**
 * Hook to fetch agent cards data for dynamic dashboard
 * @param filters - Dashboard filters (startDate, endDate, clientIds)
 */
export function useAgentCardsData(filters: DashboardFilters): UseQueryResult<AgentCardData[]> {
  return useQuery({
    queryKey: ['agent-cards-data', serializeFilters(filters)],
    queryFn: () => fetchAgentCardsData(filters),
    staleTime: STALE_TIME,
    refetchInterval: REFETCH_INTERVAL,
  })
}

/**
 * Hook to fetch agent type cards data for dynamic dashboard
 * Aggregates ALL deployments of each agent type (e.g., all Louis, all Arthur)
 * @param filters - Dashboard filters (startDate, endDate, clientIds)
 */
export function useAgentTypeCardsData(
  filters: DashboardFilters,
): UseQueryResult<AgentTypeCardData[]> {
  return useQuery({
    queryKey: ['agent-type-cards-data', serializeFilters(filters)],
    queryFn: () => fetchAgentTypeCardsData(filters),
    staleTime: STALE_TIME,
    refetchInterval: REFETCH_INTERVAL,
  })
}
