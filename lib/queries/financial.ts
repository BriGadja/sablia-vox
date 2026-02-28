// Financial Dashboard Queries
// Generated: 2025-01-16

import { createClient } from '@/lib/supabase/client'
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
  DrilldownData,
  DrilldownLevel,
  FinancialFilters,
  FinancialKPIResponse,
  LeasingMetrics,
  TimeSeriesDataPoint,
  TimeSeriesFilters,
  TimeSeriesGranularity,
} from '@/lib/types/financial'

// ============================================================================
// Fetch Financial KPI Metrics
// ============================================================================

export async function fetchFinancialKPIMetrics(
  filters: FinancialFilters,
): Promise<FinancialKPIResponse> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc('get_financial_kpi_metrics', {
    p_start_date: filters.startDate,
    p_end_date: filters.endDate,
    p_client_id: filters.clientId || null,
    p_agent_type_name: filters.agentTypeName || null,
    p_deployment_id: filters.deploymentId || null,
  })

  if (error) {
    console.error('Error fetching financial KPI metrics:', error)
    throw new Error(`Failed to fetch financial KPI metrics: ${error.message}`)
  }

  return data as FinancialKPIResponse
}

// ============================================================================
// Fetch Financial Drilldown Data
// ============================================================================

export async function fetchFinancialDrilldown(
  filters: FinancialFilters,
  level: DrilldownLevel,
): Promise<DrilldownData> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc('get_financial_drilldown', {
    p_start_date: filters.startDate,
    p_end_date: filters.endDate,
    p_level: level,
    p_client_id: filters.clientId || null,
    p_agent_type_name: filters.agentTypeName || null,
    p_deployment_id: filters.deploymentId || null,
  })

  if (error) {
    console.error(`Error fetching ${level} drilldown:`, error)
    throw new Error(`Failed to fetch ${level} drilldown: ${error.message}`)
  }

  // Handle channel drilldown response structure
  if (level === 'channel') {
    return data as ChannelDrilldownResponse
  }

  return (data || []) as DrilldownData
}

// ============================================================================
// Convenience Functions for Specific Drilldown Levels
// ============================================================================

export async function fetchClientBreakdown(
  filters: FinancialFilters,
): Promise<ClientFinancialData[]> {
  const data = await fetchFinancialDrilldown(filters, 'client')
  return data as ClientFinancialData[]
}

export async function fetchAgentTypeBreakdown(
  filters: FinancialFilters,
): Promise<AgentTypeFinancialData[]> {
  const data = await fetchFinancialDrilldown(filters, 'agent_type')
  return data as AgentTypeFinancialData[]
}

export async function fetchDeploymentBreakdown(
  filters: FinancialFilters,
): Promise<DeploymentFinancialData[]> {
  const data = await fetchFinancialDrilldown(filters, 'deployment')
  return data as DeploymentFinancialData[]
}

export async function fetchChannelBreakdown(
  filters: FinancialFilters,
): Promise<ChannelDrilldownResponse> {
  const data = await fetchFinancialDrilldown(filters, 'channel')
  return data as ChannelDrilldownResponse
}

// ============================================================================
// Fetch Financial Time Series Data
// ============================================================================

/**
 * Fetch financial time series data for charts
 * Returns daily/weekly/monthly metrics aggregated by period
 */
export async function fetchFinancialTimeSeries(
  filters: TimeSeriesFilters,
): Promise<TimeSeriesDataPoint[]> {
  const supabase = createClient()

  const granularity: TimeSeriesGranularity = filters.granularity || 'day'

  const { data, error } = await supabase.rpc('get_financial_timeseries', {
    p_start_date: filters.startDate,
    p_end_date: filters.endDate,
    p_client_id: filters.clientId || null,
    p_agent_type_name: filters.agentTypeName || null,
    p_deployment_id: filters.deploymentId || null,
    p_granularity: granularity,
  })

  if (error) {
    console.error('Error fetching financial time series:', error)
    throw new Error(`Failed to fetch financial time series: ${error.message}`)
  }

  // data is returned as JSONB array, parse it
  return (data || []) as TimeSeriesDataPoint[]
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Format currency value to EUR
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

/**
 * Format percentage value
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Format number with thousands separator
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('fr-FR').format(value)
}

/**
 * Calculate percentage change between two values
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}

/**
 * Determine if change is positive, negative, or neutral
 */
export function getChangeType(change: number): 'positive' | 'negative' | 'neutral' {
  if (change > 0) return 'positive'
  if (change < 0) return 'negative'
  return 'neutral'
}

/**
 * Get default date range (last 30 days)
 */
export function getDefaultDateRange(): { startDate: string; endDate: string } {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 30)

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  }
}

/**
 * Export financial data to CSV
 */
export function exportToCSV(
  data: Record<string, unknown>[],
  filename: string = 'financial_data.csv',
): void {
  if (!data || data.length === 0) {
    console.warn('No data to export')
    return
  }

  // Get headers from first object
  const headers = Object.keys(data[0])

  // Build CSV content
  const csvContent = [
    headers.join(','), // Header row
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header]
          // Escape values that contain commas or quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        })
        .join(','),
    ),
  ].join('\n')

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// ============================================================================
// Drill Down Queries
// ============================================================================

/**
 * Fetch deployment breakdown for a specific client
 */
export async function fetchClientDeployments(
  clientId: string,
  startDate: string,
  endDate: string,
): Promise<ClientDeploymentData[]> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc('get_client_deployments_breakdown', {
    p_client_id: clientId,
    p_start_date: startDate,
    p_end_date: endDate,
  })

  if (error) {
    console.error('Error fetching client deployments:', error)
    throw new Error(`Failed to fetch client deployments: ${error.message}`)
  }

  return (data || []) as ClientDeploymentData[]
}

/**
 * Fetch channel breakdown for a specific deployment
 */
export async function fetchDeploymentChannels(
  deploymentId: string,
  startDate: string,
  endDate: string,
): Promise<DeploymentChannelData[]> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc('get_deployment_channels_breakdown', {
    p_deployment_id: deploymentId,
    p_start_date: startDate,
    p_end_date: endDate,
  })

  if (error) {
    console.error('Error fetching deployment channels:', error)
    throw new Error(`Failed to fetch deployment channels: ${error.message}`)
  }

  return (data || []) as DeploymentChannelData[]
}

// ============================================================================
// Cost Breakdown Query
// ============================================================================

/**
 * Fetch detailed cost breakdown by technology (STT, TTS, LLM, Telecom, Dipler Commission)
 */
export async function fetchCostBreakdown(
  filters: FinancialFilters,
): Promise<CostBreakdownResponse> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc('get_cost_breakdown', {
    p_start_date: filters.startDate,
    p_end_date: filters.endDate,
    p_client_id: filters.clientId || null,
    p_agent_type_name: filters.agentTypeName || null,
    p_deployment_id: filters.deploymentId || null,
  })

  if (error) {
    console.error('Error fetching cost breakdown:', error)
    throw new Error(`Failed to fetch cost breakdown: ${error.message}`)
  }

  return data as CostBreakdownResponse
}

// ============================================================================
// Leasing vs Consumption Queries (v2)
// Added: 2025-01-18
// ============================================================================

/**
 * Fetch leasing-specific KPI metrics
 * Returns subscription revenue metrics with 100% margin
 */
export async function fetchLeasingMetrics(filters: FinancialFilters): Promise<LeasingMetrics> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc('get_leasing_kpi_metrics', {
    p_start_date: filters.startDate,
    p_end_date: filters.endDate,
  })

  if (error) {
    console.error('Error fetching leasing metrics:', error)
    throw new Error(`Failed to fetch leasing metrics: ${error.message}`)
  }

  return data as LeasingMetrics
}

/**
 * Fetch consumption-specific KPI metrics
 * Returns usage revenue metrics (calls, SMS, emails) with variable margin
 */
export async function fetchConsumptionMetrics(
  filters: FinancialFilters,
): Promise<ConsumptionMetrics> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc('get_consumption_kpi_metrics', {
    p_start_date: filters.startDate,
    p_end_date: filters.endDate,
  })

  if (error) {
    console.error('Error fetching consumption metrics:', error)
    throw new Error(`Failed to fetch consumption metrics: ${error.message}`)
  }

  return data as ConsumptionMetrics
}

/**
 * Fetch unit pricing by agent (deployment level)
 * Returns cost, price, and margin per unit (minute, SMS, email) for each agent
 */
export async function fetchAgentUnitPricing(
  filters: FinancialFilters,
): Promise<AgentUnitPricing[]> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc('get_consumption_pricing_by_agent', {
    p_start_date: filters.startDate,
    p_end_date: filters.endDate,
    p_client_id: filters.clientId || null,
  })

  if (error) {
    console.error('Error fetching agent unit pricing:', error)
    throw new Error(`Failed to fetch agent unit pricing: ${error.message}`)
  }

  return (data || []) as AgentUnitPricing[]
}
