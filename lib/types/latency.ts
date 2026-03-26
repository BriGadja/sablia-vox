/**
 * Latency-related TypeScript types
 * Matches data returned by get_latency_metrics() RPC function
 */

export interface LatencyMetric {
  date: string // ISO date string (YYYY-MM-DD)
  deployment_id: string // UUID
  deployment_name: string
  client_id: string // UUID
  client_name: string
  agent_type_name: string
  llm_model: string // e.g., "gemini-2.5-flash"
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
  clientId?: string | null
  agentTypeName?: string | null
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
