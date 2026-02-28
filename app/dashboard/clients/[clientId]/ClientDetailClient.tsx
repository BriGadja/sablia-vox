'use client'

import { ArrowLeft, Bot, Building2, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { AgentDeploymentCard } from '@/app/dashboard/agents/AgentDeploymentCard'
import { CallVolumeChart } from '@/components/dashboard/Charts/CallVolumeChart'
import { EmotionDistribution } from '@/components/dashboard/Charts/EmotionDistribution'
import { OutcomeBreakdown } from '@/components/dashboard/Charts/OutcomeBreakdown'
import { DateRangeFilter } from '@/components/dashboard/Filters/DateRangeFilter'
import { KPIGrid } from '@/components/dashboard/KPIGrid'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { useAgentCardsData, useGlobalChartData, useGlobalKPIs } from '@/lib/hooks/useDashboardData'
import { useDashboardFilters } from '@/lib/hooks/useDashboardFilters'

interface ClientDetailClientProps {
  clientId: string
  clientName: string
  clientIndustry: string | null
}

/**
 * Client Detail Client Component
 * Displays detailed metrics and agents for a specific client
 */
export function ClientDetailClient({
  clientId,
  clientName,
  clientIndustry,
}: ClientDetailClientProps) {
  // Override filters to only show this client's data
  const { filters, setDateRange } = useDashboardFilters()
  const clientFilters = {
    ...filters,
    clientIds: [clientId],
  }

  // Fetch data for this client
  const { data: kpis, isLoading: kpisLoading } = useGlobalKPIs(clientFilters)
  const { data: chartData, isLoading: chartsLoading } = useGlobalChartData(clientFilters)
  const { data: agents, isLoading: agentsLoading } = useAgentCardsData(clientFilters)

  // Handle date filter changes
  const handleDateChange = (start: Date, end: Date) => {
    setDateRange(start.toISOString().split('T')[0], end.toISOString().split('T')[0])
  }

  const isLoading = kpisLoading || chartsLoading

  // Count by agent type
  const louisCount = agents?.filter((a) => a.agent_type_name === 'louis').length || 0
  const arthurCount = agents?.filter((a) => a.agent_type_name === 'arthur').length || 0
  const alexandraCount = agents?.filter((a) => a.agent_type_name === 'alexandra').length || 0

  return (
    <div className="p-6 space-y-6">
      {/* Back Link */}
      <Link
        href="/dashboard/clients"
        className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour aux clients
      </Link>

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-500/30">
          <Building2 className="w-8 h-8 text-purple-400" />
        </div>
        <div>
          <PageHeader title={clientName} description={clientIndustry || 'Client'} />
        </div>
      </div>

      {/* Filters */}
      <DateRangeFilter
        startDate={new Date(filters.startDate)}
        endDate={new Date(filters.endDate)}
        onChange={handleDateChange}
      />

      {/* KPIs */}
      <KPIGrid data={kpis} isLoading={kpisLoading} agentType="global" />

      {/* Charts */}
      {!chartsLoading && chartData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-[300px]">
            <CallVolumeChart data={chartData.call_volume_by_day || []} />
          </div>
          <div className="h-[300px]">
            <EmotionDistribution data={chartData.emotion_distribution || []} />
          </div>
          <div className="lg:col-span-2 h-[300px]">
            <OutcomeBreakdown data={chartData.outcome_distribution || []} />
          </div>
        </div>
      )}

      {/* Agents Section */}
      <div className="pt-6 border-t border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Bot className="w-5 h-5 text-white/60" />
            <h2 className="text-lg font-semibold text-white">
              Agents deployes ({agents?.length || 0})
            </h2>
          </div>

          {/* Agent Type Tags */}
          <div className="flex items-center gap-2">
            {louisCount > 0 && (
              <span className="px-2 py-1 rounded-md text-xs font-medium bg-blue-500/20 text-blue-400">
                {louisCount} Louis
              </span>
            )}
            {arthurCount > 0 && (
              <span className="px-2 py-1 rounded-md text-xs font-medium bg-orange-500/20 text-orange-400">
                {arthurCount} Arthur
              </span>
            )}
            {alexandraCount > 0 && (
              <span className="px-2 py-1 rounded-md text-xs font-medium bg-green-500/20 text-green-400">
                {alexandraCount} Alexandra
              </span>
            )}
          </div>
        </div>

        {agentsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
          </div>
        ) : agents && agents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <AgentDeploymentCard key={agent.deployment_id} agent={agent} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 space-y-2">
            <Bot className="w-8 h-8 text-white/20" />
            <p className="text-sm text-white/40">Aucun agent deploye pour ce client</p>
          </div>
        )}
      </div>
    </div>
  )
}
