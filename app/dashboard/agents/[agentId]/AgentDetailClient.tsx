'use client'

import { useQuery } from '@tanstack/react-query'
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Building2,
  Loader2,
  Sparkles,
  Target,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { useMemo } from 'react'
import { CallVolumeChart } from '@/components/dashboard/Charts/CallVolumeChart'
import { EmotionDistribution } from '@/components/dashboard/Charts/EmotionDistribution'
import { LatencyTimeSeriesChart } from '@/components/dashboard/Charts/LatencyTimeSeriesChart'
import { OutcomeBreakdown } from '@/components/dashboard/Charts/OutcomeBreakdown'
import { DateRangeFilter } from '@/components/dashboard/Filters/DateRangeFilter'
import { KPIGrid } from '@/components/dashboard/KPIGrid'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { useLouisChartData, useLouisKPIs } from '@/lib/hooks/useDashboardData'
import { useDashboardFilters } from '@/lib/hooks/useDashboardFilters'
import { useLatencyMetrics } from '@/lib/hooks/useLatencyData'
import { createClient } from '@/lib/supabase/client'
import type { AccessibleAgent } from '@/lib/types/dashboard'
import { cn } from '@/lib/utils'

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
  const { data: chartData, isLoading: isLoadingCharts } = useLouisChartData(deploymentFilters)

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

  // Agent type configuration
  const agentConfig = {
    louis: {
      icon: Users,
      color: 'from-blue-500/20 to-blue-500/5 border-blue-500/30',
      iconColor: 'text-blue-400',
      badgeColor: 'bg-blue-500/20 text-blue-400',
    },
    arthur: {
      icon: Target,
      color: 'from-orange-500/20 to-orange-500/5 border-orange-500/30',
      iconColor: 'text-orange-400',
      badgeColor: 'bg-orange-500/20 text-orange-400',
    },
    alexandra: {
      icon: Sparkles,
      color: 'from-green-500/20 to-green-500/5 border-green-500/30',
      iconColor: 'text-green-400',
      badgeColor: 'bg-green-500/20 text-green-400',
    },
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

  const config = agentConfig[agent.agent_type_name]
  const Icon = config.icon

  return (
    <div className="p-6 space-y-6">
      {/* Back link */}
      <Link
        href="/dashboard/agents"
        className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour aux agents
      </Link>

      {/* Agent Header */}
      <div className={cn('rounded-xl border bg-gradient-to-br p-6', config.color)}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={cn('p-3 rounded-lg bg-white/10', config.iconColor)}>
              <Icon className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{agent.deployment_name}</h1>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1.5 text-white/60">
                  <Building2 className="w-4 h-4" />
                  <span className="text-sm">{agent.client_name}</span>
                </div>
                <span className={cn('px-2 py-0.5 rounded text-xs font-medium', config.badgeColor)}>
                  {agent.agent_display_name}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Status Badge */}
            {agent.deployment_status === 'active' ? (
              <span className="px-3 py-1.5 rounded-lg text-sm font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                Actif
              </span>
            ) : agent.deployment_status === 'paused' ? (
              <span className="px-3 py-1.5 rounded-lg text-sm font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                En pause
              </span>
            ) : (
              <span className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-500/20 text-gray-400 border border-gray-500/30">
                Archive
              </span>
            )}
          </div>
        </div>

        {/* Last Activity */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
          <Activity className="w-4 h-4 text-white/40" />
          <span className="text-sm text-white/60">
            Derniere activite:{' '}
            {agent.last_call_at
              ? new Date(agent.last_call_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Jamais'}
          </span>
        </div>
      </div>

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
