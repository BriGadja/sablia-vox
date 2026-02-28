'use client'

import { Building2, Calendar, Phone, TrendingUp } from 'lucide-react'
import type { TopClientData } from '@/lib/types/dashboard'
import { cn } from '@/lib/utils'

interface TopClientsTableProps {
  data: TopClientData[]
  isLoading: boolean
}

/**
 * Top Clients Table Component
 * Displays top performing clients with key metrics
 */
export function TopClientsTable({ data, isLoading }: TopClientsTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-white/5 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Building2 className="w-10 h-10 text-white/20 mb-3" />
        <p className="text-sm text-white/40">Aucune donnee client disponible</p>
      </div>
    )
  }

  return (
    <div className="space-y-2 max-h-[300px] overflow-y-auto">
      {data.map((client, index) => (
        <div
          key={client.client_id}
          className={cn(
            'flex items-center justify-between p-3 rounded-lg',
            'bg-white/5 hover:bg-white/10 transition-colors',
          )}
        >
          <div className="flex items-center gap-3 min-w-0">
            <span
              className={cn(
                'flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold',
                index === 0 && 'bg-yellow-500/20 text-yellow-400',
                index === 1 && 'bg-gray-400/20 text-gray-300',
                index === 2 && 'bg-orange-600/20 text-orange-400',
                index > 2 && 'bg-white/10 text-white/60',
              )}
            >
              {index + 1}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{client.client_name}</p>
              <div className="flex items-center gap-3 text-xs text-white/50">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {client.total_calls.toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {client.appointments || 0} RDV
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-white">
              {client.conversion_rate?.toFixed(1) || 0}%
            </p>
            <p className="text-xs text-white/50">conversion</p>
          </div>
        </div>
      ))}
    </div>
  )
}
