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
import {
  useCallVolumeByDay,
  useDashboardKPIs,
  useEmotionDistribution,
  useOutcomeDistribution,
} from '@/lib/hooks/useDashboardData'
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

  // Create filters scoped to this deployment
  const deploymentFilters = useMemo(
    () => ({
      ...filters,
      deploymentId: agentId,
    }),
    [filters, agentId],
  )

  // v2 KPIs + charts for this deployment
  const { data: kpiData, isLoading: isLoadingKPIs } = useDashboardKPIs(deploymentFilters)
  const { data: callVolumeData } = useCallVolumeByDay(deploymentFilters)
  const { data: outcomeData } = useOutcomeDistribution(deploymentFilters)
  const { data: emotionData } = useEmotionDistribution(deploymentFilters)

  // Fetch latency metrics
  const { data: latencyData, isLoading: isLoadingLatencies } = useLatencyMetrics({
    startDate: filters.startDate,
    endDate: filters.endDate,
    deploymentId: agentId,
    templateType: agent?.template_type || null,
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
            <p className="text-lg font-semibold text-white">Agent non trouvé</p>
            <p className="text-sm text-white/60">
              Cet agent n&apos;existe pas ou vous n&apos;avez pas les permissions nécessaires.
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
        agentType={agent.template_type}
        avgLatency={avgTotalLatency}
      />

      {/* Charts Grid - 2x2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="h-[300px] overflow-hidden">
          <CallVolumeChart data={callVolumeData || []} />
        </div>
        <div className="h-[300px] overflow-hidden">
          <EmotionDistribution data={emotionData || []} />
        </div>
        <div className="h-[300px] overflow-hidden">
          <OutcomeBreakdown data={outcomeData || []} />
        </div>
        <div className="h-[300px] overflow-hidden">
          <LatencyTimeSeriesChart data={latencyData || []} isLoading={isLoadingLatencies} />
        </div>
      </div>
    </div>
  )
}
