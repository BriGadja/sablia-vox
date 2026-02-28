'use client'

import { Bot, Loader2 } from 'lucide-react'
import { DateRangeFilter } from '@/components/dashboard/Filters/DateRangeFilter'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { useAgentCardsData } from '@/lib/hooks/useDashboardData'
import { useDashboardFilters } from '@/lib/hooks/useDashboardFilters'
import { AgentDeploymentCard } from './AgentDeploymentCard'

/**
 * Agents List Client Component
 * Displays all agent deployments with their metrics
 */
export function AgentsListClient() {
  // URL-based filters
  const { filters, setDateRange } = useDashboardFilters()

  // Fetch agent cards data
  const { data: agents, isLoading } = useAgentCardsData(filters)

  // Handle date filter changes
  const handleDateChange = (start: Date, end: Date) => {
    setDateRange(start.toISOString().split('T')[0], end.toISOString().split('T')[0])
  }

  // Count by agent type
  const louisCount = agents?.filter((a) => a.agent_type_name === 'louis').length || 0

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <PageHeader
        title="Agents"
        description={`${agents?.length || 0} déploiement${(agents?.length || 0) > 1 ? 's' : ''} actif${(agents?.length || 0) > 1 ? 's' : ''}`}
      />

      {/* Filters */}
      <DateRangeFilter
        startDate={new Date(filters.startDate)}
        endDate={new Date(filters.endDate)}
        onChange={handleDateChange}
      />

      {/* Agent Type Summary */}
      {agents && agents.length > 0 && (
        <div className="flex items-center gap-4">
          {louisCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/30">
              <Bot className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-400 font-medium">{louisCount} Louis</span>
            </div>
          )}
        </div>
      )}

      {/* Agents Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      ) : agents && agents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <AgentDeploymentCard key={agent.deployment_id} agent={agent} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="p-4 rounded-full bg-white/5">
            <Bot className="w-12 h-12 text-white/20" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-lg font-semibold text-white">Aucun agent trouvé</p>
            <p className="text-sm text-white/60">
              Vous n&apos;avez pas encore d&apos;agents déployés
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
