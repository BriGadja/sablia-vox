'use client'

import { useQuery } from '@tanstack/react-query'
import {
  AlertCircle,
  ArrowLeft,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'
import { useMemo } from 'react'
import { CallVolumeChart } from '@/components/dashboard/Charts/CallVolumeChart'
import { EmotionDistribution } from '@/components/dashboard/Charts/EmotionDistribution'
import { LatencyTimeSeriesChart } from '@/components/dashboard/Charts/LatencyTimeSeriesChart'
import { OutcomeBreakdown } from '@/components/dashboard/Charts/OutcomeBreakdown'
import { DateRangeFilter } from '@/components/dashboard/Filters/DateRangeFilter'
import { KPIGrid } from '@/components/dashboard/KPIGrid'
import { useLouisChartData, useLouisKPIs } from '@/lib/hooks/useDashboardData'
import { useDashboardFilters } from '@/lib/hooks/useDashboardFilters'
import { useLatencyMetrics } from '@/lib/hooks/useLatencyData'
import { createClient } from '@/lib/supabase/client'
import type { AccessibleAgent } from '@/lib/types/dashboard'

interface AgentDetailClientProps {
  agentId: string
}

/**
 * Fetch agent deployment info by ID
 */
async function fetchAgentById(agentId: string): Promise<AccessibleAgent | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('v_user_accessible_agents')
    .select('*')
    .eq('deployment_id', agentId)
    .single()

  if (error) {
    console.error('Error fetching agent:', error)
    return null
  }

  return data as AccessibleAgent
}

/**
 * Hook to fetch agent info
 */
function useAgentInfo(agentId: string) {
  return useQuery({
    queryKey: ['agent-info', agentId],
    queryFn: () => fetchAgentById(agentId),
    staleTime: 3600000,
  })
}

/**
 * Agent Detail Client Component
 * Displays detailed metrics for a specific agent deployment
 */
export function AgentDetailClient({ agentId }: AgentDetailClientProps) {
  // Fetch agent info
  const { data: agent, isLoading: isLoadingAgent, error: agentError } = useAgentInfo(agentId)

  // URL-based filters with deploymentId pre-set
  const { filters, setDateRange } = useDashboardFilters()

  // Create filters with this specific deployment
  const deploymentFilters = useMemo(
    () => ({
      ...filters,
      deploymentId: agentId,
      clientIds: agent?.client_id ? [agent.client_id] : [],
    }),
    [filters, agentId, agent?.client_id],
  )

  // Fetch metrics (only Louis for now - can be extended)
  const { data: kpiData, isLoading: isLoadingKPIs } = useLouisKPIs(deploymentFilters)
  const { data: chartData } = useLouisChartData(deploymentFilters)

  // Fetch latency metrics
  const { data: latencyData, isLoading: isLoadingLatencies } = useLatencyMetrics({
    startDate: filters.startDate,
    endDate: filters.endDate,
    deploymentId: agentId,
    clientId: agent?.client_id || null,
    agentTypeName: agent?.agent_type_name || 'louis',
  })

  // Calculate average total latency for KPI
  const avgTotalLatency =
    latencyData && latencyData.length > 0
      ? Math.round(
          latencyData.reduce((sum, m) => sum + m.avg_total_latency_ms * m.call_count, 0) /
            latencyData.reduce((sum, m) => sum + m.call_count, 0),
        )
      : 0

  // Handle date filter changes
  const handleDateChange = (start: Date, end: Date) => {
    setDateRange(start.toISOString().split('T')[0], end.toISOString().split('T')[0])
  }

  // Loading state
  if (isLoadingAgent) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  // Error or not found state
  if (agentError || !agent) {
    return (
      <div className="p-6">
        <Link
          href="/dashboard/agents"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux agents
        </Link>
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="p-4 rounded-full bg-red-500/10">
            <AlertCircle className="w-12 h-12 text-red-400" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-lg font-semibold text-white">Agent non trouve</p>
            <p className="text-sm text-white/60">
              Cet agent n&apos;existe pas ou vous n&apos;avez pas les permissions necessaires.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4">
      {/* Filters */}
      <DateRangeFilter
        startDate={new Date(filters.startDate)}
        endDate={new Date(filters.endDate)}
        onChange={handleDateChange}
      />

      {/* KPIs Grid */}
      <KPIGrid
        data={kpiData}
        isLoading={isLoadingKPIs}
        agentType={agent.agent_type_name}
        avgLatency={avgTotalLatency}
      />

      {/* Charts Grid - 2x2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="h-[300px]">
          <CallVolumeChart data={chartData?.call_volume_by_day || []} />
        </div>
        <div className="h-[300px]">
          <EmotionDistribution data={chartData?.emotion_distribution || []} />
        </div>
        <div className="h-[300px]">
          <OutcomeBreakdown data={chartData?.outcome_distribution || []} />
        </div>
        <div className="h-[300px]">
          <LatencyTimeSeriesChart data={latencyData || []} isLoading={isLoadingLatencies} />
        </div>
      </div>
    </div>
  )
}
