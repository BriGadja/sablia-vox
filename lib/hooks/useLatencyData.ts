import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { LatencyFilters, LatencyKPIs, LatencyMetric } from '@/lib/types/latency'

/**
 * Hook to fetch latency metrics from v_dashboard_calls
 * Aggregates latency data by date + deployment
 */
export function useLatencyMetrics(filters: LatencyFilters) {
  return useQuery({
    queryKey: ['latency-metrics', filters],
    queryFn: async (): Promise<LatencyMetric[]> => {
      const supabase = createClient()

      let query = supabase
        .from('v_dashboard_calls')
        .select('started_at, deployment_id, deployment_name, template_type, avg_llm_ms, avg_tts_ms, avg_total_ms')
        .gte('started_at', filters.startDate)
        .lte('started_at', filters.endDate)
        .not('avg_llm_ms', 'is', null)

      if (filters.deploymentId) {
        query = query.eq('deployment_id', filters.deploymentId)
      }

      if (filters.templateType) {
        query = query.eq('template_type', filters.templateType)
      }

      const { data, error } = await query.order('started_at', { ascending: true })

      if (error) {
        console.error('Error fetching latency data:', error)
        throw error
      }

      // Aggregate by date + deployment
      const grouped = new Map<string, LatencyMetric>()

      for (const row of data || []) {
        const date = (row.started_at as string).slice(0, 10)
        const key = `${date}_${row.deployment_id}`

        if (grouped.has(key)) {
          const existing = grouped.get(key)!
          existing.call_count += 1
          existing.avg_llm_latency_ms = (existing.avg_llm_latency_ms * (existing.call_count - 1) + (row.avg_llm_ms ?? 0)) / existing.call_count
          existing.avg_tts_latency_ms = (existing.avg_tts_latency_ms * (existing.call_count - 1) + (row.avg_tts_ms ?? 0)) / existing.call_count
          existing.avg_total_latency_ms = (existing.avg_total_latency_ms * (existing.call_count - 1) + (row.avg_total_ms ?? 0)) / existing.call_count
          existing.min_llm_latency_ms = Math.min(existing.min_llm_latency_ms, row.avg_llm_ms ?? Infinity)
          existing.max_llm_latency_ms = Math.max(existing.max_llm_latency_ms, row.avg_llm_ms ?? 0)
          existing.min_tts_latency_ms = Math.min(existing.min_tts_latency_ms, row.avg_tts_ms ?? Infinity)
          existing.max_tts_latency_ms = Math.max(existing.max_tts_latency_ms, row.avg_tts_ms ?? 0)
          existing.min_total_latency_ms = Math.min(existing.min_total_latency_ms, row.avg_total_ms ?? Infinity)
          existing.max_total_latency_ms = Math.max(existing.max_total_latency_ms, row.avg_total_ms ?? 0)
        } else {
          grouped.set(key, {
            date,
            deployment_id: row.deployment_id as string,
            deployment_name: row.deployment_name as string,
            template_type: row.template_type as string,
            avg_llm_latency_ms: (row.avg_llm_ms as number) ?? 0,
            min_llm_latency_ms: (row.avg_llm_ms as number) ?? 0,
            max_llm_latency_ms: (row.avg_llm_ms as number) ?? 0,
            avg_tts_latency_ms: (row.avg_tts_ms as number) ?? 0,
            min_tts_latency_ms: (row.avg_tts_ms as number) ?? 0,
            max_tts_latency_ms: (row.avg_tts_ms as number) ?? 0,
            avg_total_latency_ms: (row.avg_total_ms as number) ?? 0,
            min_total_latency_ms: (row.avg_total_ms as number) ?? 0,
            max_total_latency_ms: (row.avg_total_ms as number) ?? 0,
            call_count: 1,
          })
        }
      }

      return Array.from(grouped.values())
    },
    enabled: !!filters.startDate && !!filters.endDate,
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

  const totalCalls = metrics.reduce((sum, m) => sum + m.call_count, 0)

  const avgLlmLatency =
    metrics.reduce((sum, m) => sum + m.avg_llm_latency_ms * m.call_count, 0) / totalCalls

  const avgTtsLatency =
    metrics.reduce((sum, m) => sum + m.avg_tts_latency_ms * m.call_count, 0) / totalCalls

  const avgTotalLatency =
    metrics.reduce((sum, m) => sum + m.avg_total_latency_ms * m.call_count, 0) / totalCalls

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
  const grouped = new Map<string, { avgLlmLatency: number; avgTtsLatency: number; avgTotalLatency: number; callCount: number }>()

  for (const metric of metrics) {
    const existing = grouped.get(metric.date)

    if (existing) {
      const totalCalls = existing.callCount + metric.call_count
      existing.avgLlmLatency =
        (existing.avgLlmLatency * existing.callCount + metric.avg_llm_latency_ms * metric.call_count) / totalCalls
      existing.avgTtsLatency =
        (existing.avgTtsLatency * existing.callCount + metric.avg_tts_latency_ms * metric.call_count) / totalCalls
      existing.avgTotalLatency =
        (existing.avgTotalLatency * existing.callCount + metric.avg_total_latency_ms * metric.call_count) / totalCalls
      existing.callCount = totalCalls
    } else {
      grouped.set(metric.date, {
        avgLlmLatency: metric.avg_llm_latency_ms,
        avgTtsLatency: metric.avg_tts_latency_ms,
        avgTotalLatency: metric.avg_total_latency_ms,
        callCount: metric.call_count,
      })
    }
  }

  return Array.from(grouped.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Group metrics by deployment for bar chart
 */
export function groupMetricsByDeployment(metrics: LatencyMetric[]) {
  const grouped = new Map<string, { avgLlmLatency: number; avgTtsLatency: number; callCount: number }>()

  for (const metric of metrics) {
    const existing = grouped.get(metric.deployment_name)

    if (existing) {
      const totalCalls = existing.callCount + metric.call_count
      existing.avgLlmLatency =
        (existing.avgLlmLatency * existing.callCount + metric.avg_llm_latency_ms * metric.call_count) / totalCalls
      existing.avgTtsLatency =
        (existing.avgTtsLatency * existing.callCount + metric.avg_tts_latency_ms * metric.call_count) / totalCalls
      existing.callCount = totalCalls
    } else {
      grouped.set(metric.deployment_name, {
        avgLlmLatency: metric.avg_llm_latency_ms,
        avgTtsLatency: metric.avg_tts_latency_ms,
        callCount: metric.call_count,
      })
    }
  }

  return Array.from(grouped.entries())
    .map(([deploymentName, data]) => ({ deploymentName, ...data }))
    .sort((a, b) => b.callCount - a.callCount)
}
