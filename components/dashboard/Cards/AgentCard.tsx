'use client'

import {
  Activity,
  ArrowRight,
  Calendar,
  Clock,
  Euro,
  Phone,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import type { AgentCardData } from '@/lib/types/dashboard'
import { cn, formatRelativeTime } from '@/lib/utils'

interface AgentCardProps {
  agent: AgentCardData
}

/**
 * Agent Card Component
 * Displays aggregated metrics for a specific agent deployment
 * Clickable link to agent-specific dashboard
 */
export function AgentCard({ agent }: AgentCardProps) {
  const hasData = agent.total_calls > 0
  const costPerCall = agent.total_calls > 0 ? agent.total_cost / agent.total_calls : 0

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

  const config = agentConfig[agent.agent_type_name]
  const Icon = config.icon

  return (
    <Link
      href={`/dashboard/${agent.agent_type_name}`}
      className={cn(
        'group relative overflow-hidden rounded-xl border bg-gradient-to-br backdrop-blur-sm transition-all hover:scale-[1.02]',
        config.color,
      )}
    >
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('p-3 rounded-lg bg-white/10', config.iconColor)}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{agent.deployment_name}</h3>
              <p className="text-sm text-white/60">{agent.client_name}</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-white/80 transition-colors" />
        </div>

        {/* Type & Status */}
        <div className="flex items-center justify-between">
          <span className="px-2 py-1 rounded-md text-xs font-medium bg-white/10 text-white/80">
            {config.description}
          </span>
          {agent.deployment_status === 'active' ? (
            <span className="px-2 py-1 rounded-md text-xs font-medium bg-green-500/20 text-green-400">
              Actif
            </span>
          ) : agent.deployment_status === 'paused' ? (
            <span className="px-2 py-1 rounded-md text-xs font-medium bg-yellow-500/20 text-yellow-400">
              Pause
            </span>
          ) : (
            <span className="px-2 py-1 rounded-md text-xs font-medium bg-gray-500/20 text-gray-400">
              Archivé
            </span>
          )}
        </div>

        {/* Last Activity Badge */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-xs text-white/60">
            <Activity className="w-3 h-3" />
            <span>Dernière activité: {formatRelativeTime(agent.last_call_at)}</span>
          </div>
        </div>

        {/* Stats */}
        {hasData ? (
          <div className="space-y-4 pt-4 border-t border-white/10">
            {/* Main Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-1 text-white/60 mb-1">
                  <Phone className="w-3 h-3" />
                  <p className="text-xs">Appels</p>
                </div>
                <p className="text-xl font-bold text-white">{agent.total_calls.toLocaleString()}</p>
              </div>
              <div>
                <div className="flex items-center gap-1 text-white/60 mb-1">
                  <TrendingUp className="w-3 h-3" />
                  <p className="text-xs">Taux réponse</p>
                </div>
                <p className="text-xl font-bold text-white">{agent.answer_rate.toFixed(1)}%</p>
              </div>
              <div>
                <div className="flex items-center gap-1 text-white/60 mb-1">
                  <Calendar className="w-3 h-3" />
                  <p className="text-xs">Conversion</p>
                </div>
                <p className="text-xl font-bold text-white">{agent.conversion_rate.toFixed(1)}%</p>
              </div>
              <div>
                <div className="flex items-center gap-1 text-white/60 mb-1">
                  <Clock className="w-3 h-3" />
                  <p className="text-xs">Durée moy.</p>
                </div>
                <p className="text-xl font-bold text-white">
                  {Math.floor(agent.avg_duration / 60)}m{agent.avg_duration % 60}s
                </p>
              </div>
            </div>

            {/* Cost Metrics */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
              <div>
                <div className="flex items-center gap-1 text-white/60 mb-1">
                  <Euro className="w-3 h-3" />
                  <p className="text-xs">Coût total</p>
                </div>
                <p className="text-lg font-bold text-white">{agent.total_cost.toFixed(2)} €</p>
              </div>
              <div>
                <div className="flex items-center gap-1 text-white/60 mb-1">
                  <Euro className="w-3 h-3" />
                  <p className="text-xs">Coût/appel</p>
                </div>
                <p className="text-lg font-bold text-white">{costPerCall.toFixed(2)} €</p>
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
