'use client'

import {
  Activity,
  ArrowRight,
  Calendar,
  Clock,
  Layers,
  Phone,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import type { AgentTypeCardData } from '@/lib/types/dashboard'
import { cn, formatRelativeTime } from '@/lib/utils'

interface AgentTypeCardProps {
  agentType: AgentTypeCardData
}

/**
 * Agent Type Card Component
 * Displays aggregated metrics for ALL deployments of a specific agent type
 * (e.g., one card for all "Louis" agents, one for all "Arthur" agents)
 */
export function AgentTypeCard({ agentType }: AgentTypeCardProps) {
  const hasData = agentType.total_calls > 0

  // Agent type configuration
  const agentConfig = {
    louis: {
      icon: Users,
      color: 'from-blue-500/20 to-blue-500/5 border-blue-500/30',
      iconColor: 'text-blue-400',
      description: 'Rappel de leads',
    },
    arthur: {
      icon: Target,
      color: 'from-orange-500/20 to-orange-500/5 border-orange-500/30',
      iconColor: 'text-orange-400',
      description: 'Prospection active',
    },
    alexandra: {
      icon: Sparkles,
      color: 'from-green-500/20 to-green-500/5 border-green-500/30',
      iconColor: 'text-green-400',
      description: 'SAV & Support',
    },
  }

  const config = agentConfig[agentType.agent_type_name]
  const Icon = config.icon

  return (
    <Link
      href={`/dashboard/${agentType.agent_type_name}`}
      className={cn(
        'group relative overflow-hidden rounded-xl border bg-linear-to-br backdrop-blur-sm transition-all hover:scale-[1.02] block',
        config.color,
      )}
    >
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={cn('p-2 rounded-lg bg-white/10', config.iconColor)}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{agentType.agent_display_name}</h3>
              <p className="text-xs text-white/60">{config.description}</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white/80 transition-colors" />
        </div>

        {/* Deployments Count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-white/60">
            <Layers className="w-3 h-3" />
            <span>
              {agentType.active_deployments} actif{agentType.active_deployments > 1 ? 's' : ''} /{' '}
              {agentType.total_deployments} déploiement{agentType.total_deployments > 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Last Activity Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-white/60">
            <Activity className="w-3 h-3" />
            <span>Dernière activité: {formatRelativeTime(agentType.last_call_at)}</span>
          </div>
        </div>

        {/* Stats */}
        {hasData ? (
          <div className="space-y-3 pt-3 border-t border-white/10">
            {/* Main Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex items-center gap-1 text-white/60 mb-0.5">
                  <Phone className="w-3 h-3" />
                  <p className="text-xs">Appels</p>
                </div>
                <p className="text-lg font-bold text-white">
                  {agentType.total_calls.toLocaleString()}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-1 text-white/60 mb-0.5">
                  <TrendingUp className="w-3 h-3" />
                  <p className="text-xs">Taux réponse</p>
                </div>
                <p className="text-lg font-bold text-white">{agentType.answer_rate.toFixed(1)}%</p>
              </div>
              <div>
                <div className="flex items-center gap-1 text-white/60 mb-0.5">
                  <Calendar className="w-3 h-3" />
                  <p className="text-xs">Conversion</p>
                </div>
                <p className="text-lg font-bold text-white">
                  {agentType.conversion_rate.toFixed(1)}%
                </p>
              </div>
              <div>
                <div className="flex items-center gap-1 text-white/60 mb-0.5">
                  <Clock className="w-3 h-3" />
                  <p className="text-xs">Durée moy.</p>
                </div>
                <p className="text-lg font-bold text-white">
                  {Math.floor(agentType.avg_duration / 60)}m{agentType.avg_duration % 60}s
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="pt-4 border-t border-white/10">
            <p className="text-sm text-white/40 text-center">Aucune donnée pour cette période</p>
          </div>
        )}
      </div>
    </Link>
  )
}
