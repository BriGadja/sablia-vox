'use client'

import { Calendar, Clock, Phone, Sparkles, Target, TrendingUp, Users } from 'lucide-react'
import type { AgentTypePerformance } from '@/lib/types/dashboard'
import { cn } from '@/lib/utils'

interface AgentTypeComparisonProps {
  data: AgentTypePerformance[]
  isLoading: boolean
}

const agentTypeConfig = {
  louis: {
    icon: Users,
    color: 'bg-blue-500/20 border-blue-500/30',
    iconColor: 'text-blue-400',
    barColor: 'bg-blue-500',
  },
  arthur: {
    icon: Target,
    color: 'bg-orange-500/20 border-orange-500/30',
    iconColor: 'text-orange-400',
    barColor: 'bg-orange-500',
  },
  alexandra: {
    icon: Sparkles,
    color: 'bg-green-500/20 border-green-500/30',
    iconColor: 'text-green-400',
    barColor: 'bg-green-500',
  },
}

/**
 * Agent Type Comparison Component
 * Displays performance metrics comparison between agent types
 */
export function AgentTypeComparison({ data, isLoading }: AgentTypeComparisonProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-white/5 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Users className="w-10 h-10 text-white/20 mb-3" />
        <p className="text-sm text-white/40">Aucune donnee disponible</p>
      </div>
    )
  }

  // Find max values for relative bar widths
  const maxCalls = Math.max(...data.map((d) => d.total_calls || 0))
  const maxConversion = Math.max(...data.map((d) => d.conversion_rate || 0))

  return (
    <div className="space-y-4">
      {data.map((agent, index) => {
        const agentType = agent.agent_type || `unknown-${index}`
        const config =
          agentTypeConfig[agent.agent_type as keyof typeof agentTypeConfig] || agentTypeConfig.louis
        const Icon = config.icon
        const totalCalls = agent.total_calls || 0
        const conversionRate = agent.conversion_rate || 0
        const answerRate = agent.answer_rate || 0
        const avgDuration = agent.avg_duration || 0
        const callsPercent = maxCalls > 0 ? (totalCalls / maxCalls) * 100 : 0
        const conversionPercent = maxConversion > 0 ? (conversionRate / maxConversion) * 100 : 0

        return (
          <div key={agentType} className={cn('p-4 rounded-lg border', config.color)}>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Icon className={cn('w-5 h-5', config.iconColor)} />
                <span className="font-semibold text-white">{agent.display_name}</span>
              </div>
              <span className="text-xs text-white/50">
                {agent.total_deployments} deploiement{agent.total_deployments > 1 ? 's' : ''}
              </span>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <div className="flex items-center gap-1 text-white/50 mb-1">
                  <Phone className="w-3 h-3" />
                  <span className="text-xs">Appels</span>
                </div>
                <p className="text-lg font-bold text-white">{totalCalls.toLocaleString()}</p>
              </div>
              <div>
                <div className="flex items-center gap-1 text-white/50 mb-1">
                  <Calendar className="w-3 h-3" />
                  <span className="text-xs">Conversion</span>
                </div>
                <p className="text-lg font-bold text-white">{conversionRate.toFixed(1)}%</p>
              </div>
            </div>

            {/* Progress Bars */}
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs text-white/40 mb-1">
                  <span>Volume d&apos;appels</span>
                  <span>{callsPercent.toFixed(0)}%</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all', config.barColor)}
                    style={{ width: `${callsPercent}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-white/40 mb-1">
                  <span>Taux de conversion</span>
                  <span>{conversionPercent.toFixed(0)}%</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all', config.barColor)}
                    style={{ width: `${conversionPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/10">
              <div className="flex items-center gap-1 text-xs text-white/50">
                <TrendingUp className="w-3 h-3" />
                <span>Reponse: {answerRate.toFixed(1)}%</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-white/50">
                <Clock className="w-3 h-3" />
                <span>
                  Duree moy: {Math.floor(avgDuration / 60)}m{Math.round(avgDuration % 60)}s
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
