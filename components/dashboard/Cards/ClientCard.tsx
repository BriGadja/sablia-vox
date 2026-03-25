'use client'

import { Building2, Calendar, Phone, Target, TrendingUp } from 'lucide-react'
import type { ClientCardData } from '@/lib/types/dashboard'
import { cn } from '@/lib/utils'

interface ClientCardProps {
  client: ClientCardData
}

/**
 * Client Card Component
 * Displays aggregated metrics for a specific client
 */
export function ClientCard({ client }: ClientCardProps) {
  const hasData = client.total_calls > 0

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border bg-linear-to-br backdrop-blur-sm transition-all hover:scale-[1.02]',
        'from-purple-500/20 to-purple-500/5 border-purple-500/30',
      )}
    >
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-white/10 text-purple-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{client.client_name}</h3>
              <p className="text-xs text-white/60">{client.industry || 'Non spécifié'}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/60 mb-0.5">Agents</p>
            <div className="flex items-center gap-1">
              <p className="text-lg font-bold text-white">
                {client.active_agents}/{client.total_agents}
              </p>
            </div>
          </div>
        </div>

        {/* Agent Types */}
        {client.agent_types.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {client.agent_types.map((type) => (
              <span
                key={type}
                className={cn(
                  'px-2 py-1 rounded-md text-xs font-medium',
                  type === 'louis' && 'bg-blue-500/20 text-blue-400',
                  type === 'arthur' && 'bg-orange-500/20 text-orange-400',
                  type === 'alexandra' && 'bg-green-500/20 text-green-400',
                )}
              >
                {type === 'louis' && 'Louis'}
                {type === 'arthur' && 'Arthur'}
                {type === 'alexandra' && 'Alexandra'}
              </span>
            ))}
          </div>
        )}

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
                  {client.total_calls.toLocaleString()}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-1 text-white/60 mb-0.5">
                  <TrendingUp className="w-3 h-3" />
                  <p className="text-xs">Taux réponse</p>
                </div>
                <p className="text-lg font-bold text-white">{client.answer_rate.toFixed(1)}%</p>
              </div>
              <div>
                <div className="flex items-center gap-1 text-white/60 mb-0.5">
                  <Calendar className="w-3 h-3" />
                  <p className="text-xs">RDV pris</p>
                </div>
                <p className="text-lg font-bold text-white">{client.appointments_scheduled}</p>
              </div>
              <div>
                <div className="flex items-center gap-1 text-white/60 mb-0.5">
                  <Target className="w-3 h-3" />
                  <p className="text-xs">Conversion</p>
                </div>
                <p className="text-lg font-bold text-white">{client.conversion_rate.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="pt-3 border-t border-white/10">
            <p className="text-sm text-white/40 text-center">Aucune donnée pour cette période</p>
          </div>
        )}
      </div>
    </div>
  )
}
