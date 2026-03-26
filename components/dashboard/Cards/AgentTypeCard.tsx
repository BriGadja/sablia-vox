'use client'

import {
  Activity,
  ArrowRight,
  Calendar,
  Clock,
  Layers,
  Phone,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import type { AgentCardData } from '@/lib/types/dashboard'
import { cn, formatRelativeTime } from '@/lib/utils'

interface AgentTypeCardData extends AgentCardData {
  agent_type_name: string
  agent_display_name: string
  active_deployments: number
  total_deployments: number
  last_call_at: string | null
}

interface AgentTypeCardProps {
  agentType: AgentTypeCardData
}

// Template type configuration (v2)
const templateConfig: Record<string, {
  icon: typeof Users
  color: string
  iconColor: string
  description: string
}> = {
  setter: {
    icon: Users,
    color: 'from-violet-500/20 to-violet-500/5 border-violet-500/30',
    iconColor: 'text-violet-400',
    description: 'Prise de rendez-vous',
  },
  secretary: {
    icon: Phone,
    color: 'from-blue-500/20 to-blue-500/5 border-blue-500/30',
    iconColor: 'text-blue-400',
    description: 'Accueil téléphonique',
  },
  transfer: {
    icon: Target,
    color: 'from-orange-500/20 to-orange-500/5 border-orange-500/30',
    iconColor: 'text-orange-400',
    description: 'Transfert d\'appels',
  },
}

const defaultConfig = {
  icon: Users,
  color: 'from-gray-500/20 to-gray-500/5 border-gray-500/30',
  iconColor: 'text-gray-400',
  description: 'Agent',
}

export function AgentTypeCard({ agentType }: AgentTypeCardProps) {
  const hasData = agentType.total_calls > 0

  const config = templateConfig[agentType.agent_type_name] ?? defaultConfig
  const Icon = config.icon

  return (
    <Link
      href={`/dashboard/agents?templateType=${agentType.agent_type_name}`}
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
                  {Math.floor(agentType.avg_duration / 60)}m{Math.round(agentType.avg_duration % 60)}s
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
