'use client'

import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Calendar, ChevronLeft, ChevronRight, Clock, Phone } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { DateRangeFilter } from '@/components/dashboard/Filters/DateRangeFilter'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { TableSkeleton } from '@/components/skeletons'
import { OUTCOME_CONFIG } from '@/lib/constants'
import { useDashboardFilters } from '@/lib/hooks/useDashboardFilters'
import { fetchCallsPage } from '@/lib/queries/calls'
import type { DashboardCall } from '@/lib/types/dashboard'
import { cn } from '@/lib/utils'

interface CallsListClientProps {
  agentId: string
  agentName: string
}

const ITEMS_PER_PAGE = 20

/**
 * Format duration from seconds to mm:ss
 */
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Calls List Client Component
 * Displays paginated list of calls with filters
 */
export function CallsListClient({ agentId, agentName }: CallsListClientProps) {
  const { filters, setDateRange } = useDashboardFilters()
  const [page, setPage] = useState(0)

  // Fetch calls data
  const { data, isLoading } = useQuery({
    queryKey: ['agent-calls', agentId, filters.startDate, filters.endDate, page],
    queryFn: () =>
      fetchCallsPage(
        { startDate: filters.startDate, endDate: filters.endDate, deploymentId: agentId },
        ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE,
      ),
  })

  const calls = data?.data || []
  const totalCalls = data?.total || 0
  const totalPages = Math.ceil(totalCalls / ITEMS_PER_PAGE)

  // Handle date filter changes
  const handleDateChange = (start: Date, end: Date) => {
    setDateRange(start.toISOString().split('T')[0], end.toISOString().split('T')[0])
    setPage(0) // Reset to first page on filter change
  }

  return (
    <div className="p-6 space-y-6 page-fade-in">
      {/* Back Link */}
      <Link
        href={`/dashboard/agents/${agentId}`}
        className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour à {agentName}
      </Link>

      {/* Header */}
      <PageHeader
        title="Historique des appels"
        description={`${agentName} — ${totalCalls} appel${totalCalls > 1 ? 's' : ''}`}
      />

      {/* Filters */}
      <DateRangeFilter
        startDate={new Date(filters.startDate)}
        endDate={new Date(filters.endDate)}
        onChange={handleDateChange}
      />

      {/* Calls Table */}
      {isLoading ? (
        <TableSkeleton />
      ) : calls.length > 0 ? (
        <div className="rounded-xl border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr className="text-left text-xs text-white/60">
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Durée</th>
                <th className="px-4 py-3 font-medium">Résultat</th>
                <th className="px-4 py-3 font-medium">Coût</th>
                <th className="px-4 py-3 font-medium sr-only">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {calls.map((call) => (
                <CallRow key={call.call_id} call={call} agentId={agentId} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="p-4 rounded-full bg-white/5">
            <Phone className="w-12 h-12 text-white/20" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-lg font-semibold text-white">Aucun appel</p>
            <p className="text-sm text-white/60">Aucun appel pour cette période</p>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-white/60">
            Page {page + 1} sur {totalPages} ({totalCalls} appels)
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Individual call row component
 */
function CallRow({ call, agentId }: { call: DashboardCall; agentId: string }) {
  const outcomeEntry = OUTCOME_CONFIG[call.outcome || '']
  const outcomeLabel = outcomeEntry?.label || call.outcome || 'Inconnu'
  const outcomeCls = outcomeEntry?.className || 'bg-gray-500/20 text-gray-400'

  const contactName =
    call.first_name || call.last_name
      ? `${call.first_name || ''} ${call.last_name || ''}`.trim()
      : 'Inconnu'

  return (
    <tr className="hover:bg-white/5 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-white/40" />
          <div>
            <p className="text-sm text-white">
              {new Date(call.started_at).toLocaleDateString('fr-FR')}
            </p>
            <p className="text-xs text-white/50">
              {new Date(call.started_at).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <p className="text-sm text-white">{contactName}</p>
        <p className="text-xs text-white/50">{call.phone_number}</p>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-white/40" />
          <span className="text-sm text-white">{formatDuration(call.duration_seconds || 0)}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium',
            outcomeCls,
          )}
        >
          {outcomeLabel}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className="text-sm text-white">{call.billed_cost?.toFixed(2) || '0.00'} €</span>
      </td>
      <td className="px-4 py-3">
        <Link
          href={`/dashboard/agents/${agentId}/calls/${call.call_id}`}
          className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
        >
          Details
        </Link>
      </td>
    </tr>
  )
}
