/**
 * Latency-related TypeScript types — v2 schema
 * Latency data comes from v_dashboard_calls view (avg_llm_ms, avg_tts_ms, avg_total_ms)
 */

export interface LatencyMetric {
  date: string // ISO date string (YYYY-MM-DD)
  deployment_id: string
  deployment_name: string
  template_type: string
  // LLM Latencies (milliseconds)
  avg_llm_latency_ms: number
  min_llm_latency_ms: number
  max_llm_latency_ms: number
  // TTS Latencies (milliseconds)
  avg_tts_latency_ms: number
  min_tts_latency_ms: number
  max_tts_latency_ms: number
  // Total Latencies (milliseconds)
  avg_total_latency_ms: number
  min_total_latency_ms: number
  max_total_latency_ms: number
  // Call count
  call_count: number
}

export interface LatencyFilters {
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
  deploymentId?: string | null
  templateType?: string | null
}

export interface LatencyChartData {
  date: string
  avgLlmLatency: number
  avgTtsLatency: number
  avgTotalLatency: number
  callCount: number
}

export interface LatencyByDeploymentData {
  deploymentName: string
  avgLlmLatency: number
  avgTtsLatency: number
  callCount: number
}

export interface LatencyKPIs {
  avgLlmLatency: number
  minLlmLatency: number
  maxLlmLatency: number
  avgTtsLatency: number
  minTtsLatency: number
  maxTtsLatency: number
  avgTotalLatency: number
  totalCalls: number
}
