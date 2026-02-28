// Financial Dashboard React Hooks
// Generated: 2025-01-16

import { type UseQueryResult, useQuery } from '@tanstack/react-query'
import {
  fetchAgentTypeBreakdown,
  fetchAgentUnitPricing,
  fetchChannelBreakdown,
  fetchClientBreakdown,
  fetchClientDeployments,
  fetchConsumptionMetrics,
  fetchCostBreakdown,
  fetchDeploymentBreakdown,
  fetchDeploymentChannels,
  fetchFinancialKPIMetrics,
  fetchFinancialTimeSeries,
  fetchLeasingMetrics,
} from '@/lib/queries/financial'
import type {
  AgentTypeFinancialData,
  AgentUnitPricing,
  ChannelDrilldownResponse,
  ClientDeploymentData,
  ClientFinancialData,
  ConsumptionMetrics,
  CostBreakdownResponse,
  DeploymentChannelData,
  DeploymentFinancialData,
  DrilldownLevel,
  FinancialFilters,
  FinancialKPIResponse,
  LeasingMetrics,
  TimeSeriesDataPoint,
  TimeSeriesFilters,
} from '@/lib/types/financial'

// ============================================================================
// Query Keys
// ============================================================================

const FINANCIAL_QUERY_KEYS = {
  kpis: (filters: FinancialFilters) => ['financial', 'kpis', filters] as const,
  clientBreakdown: (filters: FinancialFilters) =>
    ['financial', 'client-breakdown', filters] as const,
  agentTypeBreakdown: (filters: FinancialFilters) =>
    ['financial', 'agent-type-breakdown', filters] as const,
  deploymentBreakdown: (filters: FinancialFilters) =>
    ['financial', 'deployment-breakdown', filters] as const,
  channelBreakdown: (filters: FinancialFilters) =>
    ['financial', 'channel-breakdown', filters] as const,
  timeSeries: (filters: TimeSeriesFilters) => ['financial', 'time-series', filters] as const,
  clientDeployments: (clientId: string, startDate: string, endDate: string) =>
    ['financial', 'client-deployments', clientId, startDate, endDate] as const,
  deploymentChannels: (deploymentId: string, startDate: string, endDate: string) =>
    ['financial', 'deployment-channels', deploymentId, startDate, endDate] as const,
  costBreakdown: (filters: FinancialFilters) => ['financial', 'cost-breakdown', filters] as const,
  leasingMetrics: (filters: FinancialFilters) => ['financial', 'leasing-metrics', filters] as const,
  consumptionMetrics: (filters: FinancialFilters) =>
    ['financial', 'consumption-metrics', filters] as const,
  agentUnitPricing: (filters: FinancialFilters) =>
    ['financial', 'agent-unit-pricing', filters] as const,
} as const

// ============================================================================
// KPI Hooks
// ============================================================================

/**
 * Fetch financial KPI metrics with period comparison
 */
export function useFinancialKPIs(
  filters: FinancialFilters,
): UseQueryResult<FinancialKPIResponse, Error> {
  return useQuery({
    queryKey: FINANCIAL_QUERY_KEYS.kpis(filters),
    queryFn: () => fetchFinancialKPIMetrics(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  })
}

// ============================================================================
// Drilldown Hooks
// ============================================================================

/**
 * Fetch client-level financial breakdown
 */
export function useClientBreakdown(
  filters: FinancialFilters,
): UseQueryResult<ClientFinancialData[], Error> {
  return useQuery({
    queryKey: FINANCIAL_QUERY_KEYS.clientBreakdown(filters),
    queryFn: () => fetchClientBreakdown(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  })
}

/**
 * Fetch agent type-level financial breakdown
 */
export function useAgentTypeBreakdown(
  filters: FinancialFilters,
): UseQueryResult<AgentTypeFinancialData[], Error> {
  return useQuery({
    queryKey: FINANCIAL_QUERY_KEYS.agentTypeBreakdown(filters),
    queryFn: () => fetchAgentTypeBreakdown(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  })
}

/**
 * Fetch deployment-level financial breakdown
 */
export function useDeploymentBreakdown(
  filters: FinancialFilters,
): UseQueryResult<DeploymentFinancialData[], Error> {
  return useQuery({
    queryKey: FINANCIAL_QUERY_KEYS.deploymentBreakdown(filters),
    queryFn: () => fetchDeploymentBreakdown(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  })
}

/**
 * Fetch channel-level financial breakdown
 */
export function useChannelBreakdown(
  filters: FinancialFilters,
): UseQueryResult<ChannelDrilldownResponse, Error> {
  return useQuery({
    queryKey: FINANCIAL_QUERY_KEYS.channelBreakdown(filters),
    queryFn: () => fetchChannelBreakdown(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  })
}

// ============================================================================
// Time Series Hooks
// ============================================================================

/**
 * Fetch financial time series data for charts
 */
export function useFinancialTimeSeries(
  filters: TimeSeriesFilters,
): UseQueryResult<TimeSeriesDataPoint[], Error> {
  return useQuery({
    queryKey: FINANCIAL_QUERY_KEYS.timeSeries(filters),
    queryFn: () => fetchFinancialTimeSeries(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  })
}

/**
 * Fetch deployment breakdown for a specific client (drill down)
 */
export function useClientDeployments(
  clientId: string,
  startDate: string,
  endDate: string,
  enabled: boolean = true,
): UseQueryResult<ClientDeploymentData[], Error> {
  return useQuery({
    queryKey: FINANCIAL_QUERY_KEYS.clientDeployments(clientId, startDate, endDate),
    queryFn: () => fetchClientDeployments(clientId, startDate, endDate),
    enabled: enabled && !!clientId && !!startDate && !!endDate,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  })
}

/**
 * Fetch channel breakdown for a specific deployment (drill down)
 */
export function useDeploymentChannels(
  deploymentId: string,
  startDate: string,
  endDate: string,
  enabled: boolean = true,
): UseQueryResult<DeploymentChannelData[], Error> {
  return useQuery({
    queryKey: FINANCIAL_QUERY_KEYS.deploymentChannels(deploymentId, startDate, endDate),
    queryFn: () => fetchDeploymentChannels(deploymentId, startDate, endDate),
    enabled: enabled && !!deploymentId && !!startDate && !!endDate,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  })
}

// ============================================================================
// Combined Hook for All Financial Data
// ============================================================================

/**
 * Fetch detailed cost breakdown by technology
 */
export function useCostBreakdown(
  filters: FinancialFilters,
): UseQueryResult<CostBreakdownResponse, Error> {
  return useQuery({
    queryKey: FINANCIAL_QUERY_KEYS.costBreakdown(filters),
    queryFn: () => fetchCostBreakdown(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  })
}

// ============================================================================
// Leasing vs Consumption Hooks
// Added: 2025-01-18
// ============================================================================

/**
 * Fetch leasing-specific KPI metrics
 * Returns subscription revenue metrics with 100% margin
 */
export function useLeasingMetrics(
  filters: FinancialFilters,
): UseQueryResult<LeasingMetrics, Error> {
  return useQuery({
    queryKey: FINANCIAL_QUERY_KEYS.leasingMetrics(filters),
    queryFn: () => fetchLeasingMetrics(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  })
}

/**
 * Fetch consumption-specific KPI metrics
 * Returns usage revenue metrics (calls, SMS, emails) with variable margin
 */
export function useConsumptionMetrics(
  filters: FinancialFilters,
): UseQueryResult<ConsumptionMetrics, Error> {
  return useQuery({
    queryKey: FINANCIAL_QUERY_KEYS.consumptionMetrics(filters),
    queryFn: () => fetchConsumptionMetrics(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  })
}

/**
 * Fetch unit pricing by agent (deployment level)
 * Returns cost, price, and margin per unit (minute, SMS, email) for each agent
 */
export function useAgentUnitPricing(
  filters: FinancialFilters,
): UseQueryResult<AgentUnitPricing[], Error> {
  return useQuery({
    queryKey: FINANCIAL_QUERY_KEYS.agentUnitPricing(filters),
    queryFn: () => fetchAgentUnitPricing(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  })
}

// ============================================================================
// Combined Hook for All Financial Data
// ============================================================================

/**
 * Fetch all financial data at once
 * Useful for dashboard pages that need multiple data sources
 */
export function useFinancialDashboard(filters: FinancialFilters) {
  const kpis = useFinancialKPIs(filters)
  const clientBreakdown = useClientBreakdown(filters)
  const agentTypeBreakdown = useAgentTypeBreakdown(filters)
  const deploymentBreakdown = useDeploymentBreakdown(filters)
  const channelBreakdown = useChannelBreakdown(filters)

  return {
    kpis,
    clientBreakdown,
    agentTypeBreakdown,
    deploymentBreakdown,
    channelBreakdown,
    isLoading:
      kpis.isLoading ||
      clientBreakdown.isLoading ||
      agentTypeBreakdown.isLoading ||
      deploymentBreakdown.isLoading ||
      channelBreakdown.isLoading,
    isError:
      kpis.isError ||
      clientBreakdown.isError ||
      agentTypeBreakdown.isError ||
      deploymentBreakdown.isError ||
      channelBreakdown.isError,
    error:
      kpis.error ||
      clientBreakdown.error ||
      agentTypeBreakdown.error ||
      deploymentBreakdown.error ||
      channelBreakdown.error,
  }
}
