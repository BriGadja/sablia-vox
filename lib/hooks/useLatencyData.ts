import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { LatencyFilters, LatencyKPIs, LatencyMetric } from '@/lib/types/latency'

/**
 * Hook to fetch latency metrics from get_latency_metrics() RPC
 */
export function useLatencyMetrics(filters: LatencyFilters) {
  return useQuery({
    queryKey: ['latency-metrics', filters],
    queryFn: async (): Promise<LatencyMetric[]> => {
      const supabase = createClient()
      const { data, error } = await supabase.rpc('get_latency_metrics', {
        p_start_date: filters.startDate,
        p_end_date: filters.endDate,
        p_deployment_id: filters.deploymentId || null,
        p_client_id: filters.clientId || null,
        p_agent_type_name: filters.agentTypeName || null,
      })

      if (error) {
        console.error('Error fetching latency metrics:', error)
        throw error
      }

      return (data || []) as LatencyMetric[]
    },
    // Only fetch if we have valid dates
    enabled: !!filters.startDate && !!filters.endDate,
    // Stale time: 5 minutes (latencies don't change rapidly)
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Calculate KPIs from raw latency metrics
 */
export function calculateLatencyKPIs(metrics: LatencyMetric[]): LatencyKPIs {
  if (!metrics || metrics.length === 0) {
    return {
      avgLlmLatency: 0,
      minLlmLatency: 0,
      maxLlmLatency: 0,
      avgTtsLatency: 0,
      minTtsLatency: 0,
      maxTtsLatency: 0,
      avgTotalLatency: 0,
      totalCalls: 0,
    }
  }

  // Calculate weighted averages (weighted by call_count)
  const totalCalls = metrics.reduce((sum, m) => sum + m.call_count, 0)

  const avgLlmLatency =
    metrics.reduce((sum, m) => sum + m.avg_llm_latency_ms * m.call_count, 0) / totalCalls

  const avgTtsLatency =
    metrics.reduce((sum, m) => sum + m.avg_tts_latency_ms * m.call_count, 0) / totalCalls

  const avgTotalLatency =
    metrics.reduce((sum, m) => sum + m.avg_total_latency_ms * m.call_count, 0) / totalCalls

  // Find overall min/max
  const minLlmLatency = Math.min(...metrics.map((m) => m.min_llm_latency_ms))
  const maxLlmLatency = Math.max(...metrics.map((m) => m.max_llm_latency_ms))
  const minTtsLatency = Math.min(...metrics.map((m) => m.min_tts_latency_ms))
  const maxTtsLatency = Math.max(...metrics.map((m) => m.max_tts_latency_ms))

  return {
    avgLlmLatency: Math.round(avgLlmLatency),
    minLlmLatency,
    maxLlmLatency,
    avgTtsLatency: Math.round(avgTtsLatency),
    minTtsLatency,
    maxTtsLatency,
    avgTotalLatency: Math.round(avgTotalLatency),
    totalCalls,
  }
}

/**
 * Group metrics by date for time-series chart
 */
export function groupMetricsByDate(metrics: LatencyMetric[]) {
  const grouped = new Map<
    string,
    {
      avgLlmLatency: number
      avgTtsLatency: number
      avgTotalLatency: number
      callCount: number
    }
  >()

  metrics.forEach((metric) => {
    const existing = grouped.get(metric.date)

    if (existing) {
      // Weighted average by call count
      const totalCalls = existing.callCount + metric.call_count
      existing.avgLlmLatency =
        (existing.avgLlmLatency * existing.callCount +
          metric.avg_llm_latency_ms * metric.call_count) /
        totalCalls
      existing.avgTtsLatency =
        (existing.avgTtsLatency * existing.callCount +
          metric.avg_tts_latency_ms * metric.call_count) /
        totalCalls
      existing.avgTotalLatency =
        (existing.avgTotalLatency * existing.callCount +
          metric.avg_total_latency_ms * metric.call_count) /
        totalCalls
      existing.callCount = totalCalls
    } else {
      grouped.set(metric.date, {
        avgLlmLatency: metric.avg_llm_latency_ms,
        avgTtsLatency: metric.avg_tts_latency_ms,
        avgTotalLatency: metric.avg_total_latency_ms,
        callCount: metric.call_count,
      })
    }
  })

  return Array.from(grouped.entries())
    .map(([date, data]) => ({
      date,
      ...data,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Group metrics by deployment for bar chart
 */
export function groupMetricsByDeployment(metrics: LatencyMetric[]) {
  const grouped = new Map<
    string,
    {
      avgLlmLatency: number
      avgTtsLatency: number
      callCount: number
    }
  >()

  metrics.forEach((metric) => {
    const existing = grouped.get(metric.deployment_name)

    if (existing) {
      const totalCalls = existing.callCount + metric.call_count
      existing.avgLlmLatency =
        (existing.avgLlmLatency * existing.callCount +
          metric.avg_llm_latency_ms * metric.call_count) /
        totalCalls
      existing.avgTtsLatency =
        (existing.avgTtsLatency * existing.callCount +
          metric.avg_tts_latency_ms * metric.call_count) /
        totalCalls
      existing.callCount = totalCalls
    } else {
      grouped.set(metric.deployment_name, {
        avgLlmLatency: metric.avg_llm_latency_ms,
        avgTtsLatency: metric.avg_tts_latency_ms,
        callCount: metric.call_count,
      })
    }
  })

  return Array.from(grouped.entries())
    .map(([deploymentName, data]) => ({
      deploymentName,
      ...data,
    }))
    .sort((a, b) => b.callCount - a.callCount) // Sort by call count descending
}
