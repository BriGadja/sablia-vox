'use client'

import {
  Activity,
  ArrowRight,
  Bot,
  Building2,
  Calendar,
  Euro,
  Phone,
  TrendingUp,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import type { ClientCardData } from '@/lib/types/dashboard'
import { cn, formatRelativeTime } from '@/lib/utils'

interface ClientCardProps {
  client: ClientCardData
}

/**
 * Client Card Component
 * Displays individual client with aggregated metrics
 * Links to client detail page at /dashboard/clients/[clientId]
 */
export function ClientCard({ client }: ClientCardProps) {
  const hasData = client.total_calls > 0

  return (
    <Link
      href={`/dashboard/clients/${client.client_id}`}
      className={cn(
        'group relative overflow-hidden rounded-xl border bg-gradient-to-br backdrop-blur-sm transition-all hover:scale-[1.02]',
        'from-purple-500/20 to-purple-500/5 border-purple-500/30',
      )}
    >
      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-white/10 text-purple-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-bold text-white truncate">{client.client_name}</h3>
              {client.industry && (
                <p className="text-xs text-white/60 truncate">{client.industry}</p>
              )}
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white/80 transition-colors flex-shrink-0" />
        </div>

        {/* Agent Types & Count */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-white/60" />
            <span className="text-sm text-white/80">
              {client.active_agents}/{client.total_agents} agents actifs
            </span>
          </div>
          <div className="flex gap-1">
            {client.agent_types.includes('louis') && (
              <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-blue-500/20 text-blue-400">
                L
              </span>
            )}
            {client.agent_types.includes('arthur') && (
              <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-orange-500/20 text-orange-400">
                A
              </span>
            )}
            {client.agent_types.includes('alexandra') && (
              <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-green-500/20 text-green-400">
                X
              </span>
            )}
          </div>
        </div>

        {/* Last Activity */}
        <div className="flex items-center gap-2 text-xs text-white/50">
          <Activity className="w-3 h-3" />
          <span>Derniere activite: {formatRelativeTime(client.last_call_at)}</span>
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
                <p className="text-lg font-bold text-white">
                  {client.total_calls.toLocaleString()}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-1 text-white/50 mb-0.5">
                  <TrendingUp className="w-3 h-3" />
                  <p className="text-xs">Taux reponse</p>
                </div>
                <p className="text-lg font-bold text-white">{client.answer_rate.toFixed(1)}%</p>
              </div>
              <div>
                <div className="flex items-center gap-1 text-white/50 mb-0.5">
                  <Calendar className="w-3 h-3" />
                  <p className="text-xs">RDV pris</p>
                </div>
                <p className="text-lg font-bold text-white">
                  {client.appointments_scheduled.toLocaleString()}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-1 text-white/50 mb-0.5">
                  <Users className="w-3 h-3" />
                  <p className="text-xs">Conversion</p>
                </div>
                <p className="text-lg font-bold text-white">{client.conversion_rate.toFixed(1)}%</p>
              </div>
            </div>

            {/* Cost - Compact row */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
              <div className="flex items-center gap-1 text-white/50">
                <Euro className="w-3 h-3" />
                <span className="text-xs">Cout total</span>
              </div>
              <span className="text-sm font-semibold text-white">
                {client.total_cost.toFixed(2)} EUR
              </span>
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
