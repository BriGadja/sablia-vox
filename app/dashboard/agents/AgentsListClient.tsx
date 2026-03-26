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

  // Count by template type
  const templateCounts = {
    setter: agents?.filter((a) => a.template_type === 'setter').length || 0,
    secretary: agents?.filter((a) => a.template_type === 'secretary').length || 0,
    transfer: agents?.filter((a) => a.template_type === 'transfer').length || 0,
  }

  const templateBadges = [
    { type: 'setter', label: 'Setter', count: templateCounts.setter, wrapCls: 'bg-violet-500/20 border-violet-500/30', textCls: 'text-violet-400' },
    { type: 'secretary', label: 'Secrétaire', count: templateCounts.secretary, wrapCls: 'bg-blue-500/20 border-blue-500/30', textCls: 'text-blue-400' },
    { type: 'transfer', label: 'Transfert', count: templateCounts.transfer, wrapCls: 'bg-orange-500/20 border-orange-500/30', textCls: 'text-orange-400' },
  ]

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

      {/* Template Type Summary */}
      {agents && agents.length > 0 && (
        <div className="flex items-center gap-4">
          {templateBadges
            .filter((b) => b.count > 0)
            .map((b) => (
              <div
                key={b.type}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${b.wrapCls}`}
              >
                <Bot className={`w-4 h-4 ${b.textCls}`} />
                <span className={`text-sm font-medium ${b.textCls}`}>
                  {b.count} {b.label}
                </span>
              </div>
            ))}
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
