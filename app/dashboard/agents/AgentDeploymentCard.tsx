'use client'

import {
  Activity,
  ArrowRight,
  Calendar,
  Clock,
  Phone,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import type { AgentCardData } from '@/lib/types/dashboard'
import { cn, formatRelativeTime } from '@/lib/utils'

interface AgentDeploymentCardProps {
  agent: AgentCardData
}

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  active: { label: 'Actif', className: 'bg-green-500/20 text-green-400' },
  inactive: { label: 'Inactif', className: 'bg-gray-500/20 text-gray-400' },
  deploying: { label: 'Déploiement', className: 'bg-yellow-500/20 text-yellow-400' },
  error: { label: 'Erreur', className: 'bg-red-500/20 text-red-400' },
}

function StatusBadge({ status }: { status: string }) {
  const badge = STATUS_BADGES[status] || { label: status, className: 'bg-gray-500/20 text-gray-400' }
  return (
    <span className={cn('px-2 py-1 rounded-md text-xs font-medium', badge.className)}>
      {badge.label}
    </span>
  )
}

/**
 * Agent Deployment Card Component
 * Displays individual agent deployment with metrics
 * Links to agent detail page at /dashboard/agents/[deploymentId]
 */
export function AgentDeploymentCard({ agent }: AgentDeploymentCardProps) {
  const hasData = agent.total_calls > 0

  // Template type configuration (v2: setter/secretary/transfer)
  const templateConfig = {
    setter: {
      icon: Users,
      color: 'from-violet-500/20 to-violet-500/5 border-violet-500/30',
      iconColor: 'text-violet-400',
      badgeColor: 'bg-violet-500/20 text-violet-400',
    },
    secretary: {
      icon: Phone,
      color: 'from-blue-500/20 to-blue-500/5 border-blue-500/30',
      iconColor: 'text-blue-400',
      badgeColor: 'bg-blue-500/20 text-blue-400',
    },
    transfer: {
      icon: Target,
      color: 'from-orange-500/20 to-orange-500/5 border-orange-500/30',
      iconColor: 'text-orange-400',
      badgeColor: 'bg-orange-500/20 text-orange-400',
    },
  }

  const defaultConfig = {
    icon: Users,
    color: 'from-gray-500/20 to-gray-500/5 border-gray-500/30',
    iconColor: 'text-gray-400',
    badgeColor: 'bg-gray-500/20 text-gray-400',
  }

  const config = templateConfig[agent.template_type as keyof typeof templateConfig] ?? defaultConfig
  const Icon = config.icon

  return (
    <Link
      href={`/dashboard/agents/${agent.deployment_id}`}
      className={cn(
        'group relative overflow-hidden rounded-xl border bg-linear-to-br backdrop-blur-sm transition-all hover:scale-[1.02]',
        config.color,
      )}
    >
      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('p-2.5 rounded-lg bg-white/10', config.iconColor)}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-bold text-white truncate">{agent.deployment_name}</h3>
              <p className="text-xs text-white/60 truncate">{agent.template_display_name}</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white/80 transition-colors flex-shrink-0" />
        </div>

        {/* Type Badge & Status */}
        <div className="flex items-center justify-between gap-2">
          <span className={cn('px-2 py-1 rounded-md text-xs font-medium', config.badgeColor)}>
            {agent.template_display_name}
          </span>
          <StatusBadge status={agent.deployment_status} />
        </div>

        {/* Last Activity */}
        <div className="flex items-center gap-2 text-xs text-white/50">
          <Activity className="w-3 h-3" />
          <span>Derniere activite: {formatRelativeTime(agent.last_call_at)}</span>
        </div>

        {/* Stats */}
        {hasData ? (
          <div className="pt-3 border-t border-white/10">
            {/* Main Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex items-center gap-1 text-white/50 mb-0.5">
                  <Phone className="w-3 h-3" />
                  <p className="text-xs">Appels</p>
                </div>
                <p className="text-lg font-bold text-white">{agent.total_calls.toLocaleString()}</p>
              </div>
              <div>
                <div className="flex items-center gap-1 text-white/50 mb-0.5">
                  <TrendingUp className="w-3 h-3" />
                  <p className="text-xs">Taux reponse</p>
                </div>
                <p className="text-lg font-bold text-white">{agent.answer_rate.toFixed(1)}%</p>
              </div>
              <div>
                <div className="flex items-center gap-1 text-white/50 mb-0.5">
                  <Calendar className="w-3 h-3" />
                  <p className="text-xs">Conversion</p>
                </div>
                <p className="text-lg font-bold text-white">{agent.conversion_rate.toFixed(1)}%</p>
              </div>
              <div>
                <div className="flex items-center gap-1 text-white/50 mb-0.5">
                  <Clock className="w-3 h-3" />
                  <p className="text-xs">Duree moy.</p>
                </div>
                <p className="text-lg font-bold text-white">
                  {Math.floor(agent.avg_duration / 60)}m{Math.round(agent.avg_duration % 60)}s
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="pt-3 border-t border-white/10">
            <p className="text-xs text-white/40 text-center py-2">
              Aucune donnee pour cette periode
            </p>
          </div>
        )}
      </div>
    </Link>
  )
}
