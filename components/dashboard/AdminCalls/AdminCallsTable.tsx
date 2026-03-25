'use client'

import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  ChevronDown,
  ChevronDown as ChevronDownIcon,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  ChevronRight as ChevronRightIcon,
  ChevronsUpDown,
  ChevronUp,
  FileText,
  Loader2,
  Play,
} from 'lucide-react'
import { useMemo } from 'react'
import type { AdminCallRow, AdminCallsPagination, AdminCallsSort } from '@/lib/types/adminCalls'
import { DIRECTION_LABELS, EMOTION_LABELS, OUTCOME_LABELS } from '@/lib/types/adminCalls'
import { cn } from '@/lib/utils'
import { type COLUMN_DEFINITIONS, COLUMN_GROUPS, getColumnDef } from './columnConfig'

interface AdminCallsTableProps {
  data: AdminCallRow[]
  pagination: AdminCallsPagination
  isLoading: boolean
  sort: AdminCallsSort
  visibleColumns: Set<string>
  collapsedGroups: Set<string>
  onPageChange: (page: number) => void
  onSortChange: (column: string, direction: 'asc' | 'desc') => void
  onToggleGroup: (groupKey: string) => void
  onViewTranscript: (call: AdminCallRow) => void
}

// Agent type badge colors
const AGENT_COLORS: Record<string, string> = {
  louis: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  arthur: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  alexandra: 'bg-green-500/20 text-green-400 border-green-500/30',
}

// Outcome badge colors
const OUTCOME_COLORS: Record<string, string> = {
  appointment_scheduled: 'bg-green-500/20 text-green-400',
  appointment_refused: 'bg-red-500/20 text-red-400',
  voicemail: 'bg-yellow-500/20 text-yellow-400',
  not_interested: 'bg-gray-500/20 text-gray-400',
  callback_requested: 'bg-blue-500/20 text-blue-400',
  too_short: 'bg-orange-500/20 text-orange-400',
  call_failed: 'bg-red-500/20 text-red-400',
}

// Emotion badge colors
const EMOTION_COLORS: Record<string, string> = {
  positive: 'bg-green-500/20 text-green-400',
  neutral: 'bg-gray-500/20 text-gray-400',
  negative: 'bg-red-500/20 text-red-400',
}

export function AdminCallsTable({
  data,
  pagination,
  isLoading,
  sort,
  visibleColumns,
  collapsedGroups,
  onPageChange,
  onSortChange,
  onToggleGroup,
  onViewTranscript,
}: AdminCallsTableProps) {
  // Get visible columns in order, grouped
  const visibleColumnDefs = useMemo(() => {
    const result: Array<{
      column: (typeof COLUMN_DEFINITIONS)[0]
      isGroupHeader?: boolean
      isFirstOfExpandedGroup?: boolean
      groupKey?: string
      groupLabel?: string
    }> = []

    COLUMN_GROUPS.forEach((group) => {
      const groupColumns = group.columns.filter((key) => visibleColumns.has(key))
      if (groupColumns.length === 0) return

      // For collapsible groups
      if (group.collapsible) {
        const isCollapsed = collapsedGroups.has(group.key)

        if (isCollapsed) {
          // When collapsed: show only the group header as a single column
          result.push({
            column: {
              key: `group_${group.key}`,
              label: group.label,
              sortable: false,
              width: '40px',
              align: 'center',
            },
            isGroupHeader: true,
            groupKey: group.key,
          })
          return // Skip individual columns
        }
        // When expanded: show individual columns with first marked for collapse button
      }

      // Add individual columns (for non-collapsible groups OR expanded collapsible groups)
      groupColumns.forEach((key, idx) => {
        const colDef = getColumnDef(key)
        if (colDef) {
          result.push({
            column: colDef,
            // Mark the first column of an expanded collapsible group
            isFirstOfExpandedGroup: group.collapsible && idx === 0,
            groupKey: group.collapsible ? group.key : undefined,
            groupLabel: group.collapsible ? group.label : undefined,
          })
        }
      })
    })

    return result
  }, [visibleColumns, collapsedGroups])

  // Format cell value
  const formatCellValue = (row: AdminCallRow, columnKey: string): React.ReactNode => {
    switch (columnKey) {
      case 'started_at':
        return format(new Date(row.started_at), 'dd/MM HH:mm', { locale: fr })

      case 'contact': {
        const name = [row.first_name, row.last_name].filter(Boolean).join(' ').trim()
        return name || '-'
      }

      case 'agent_type_name':
        return (
          <span
            className={cn(
              'px-2 py-0.5 text-xs font-medium rounded border capitalize',
              AGENT_COLORS[row.agent_type_name] || 'bg-gray-500/20 text-gray-400',
            )}
          >
            {row.agent_type_name}
          </span>
        )

      case 'outcome':
        if (!row.outcome) return '-'
        return (
          <span
            className={cn(
              'px-2 py-0.5 text-xs font-medium rounded',
              OUTCOME_COLORS[row.outcome] || 'bg-gray-500/20 text-gray-400',
            )}
          >
            {OUTCOME_LABELS[row.outcome as keyof typeof OUTCOME_LABELS] || row.outcome}
          </span>
        )

      case 'emotion':
        if (!row.emotion) return '-'
        return (
          <span
            className={cn(
              'px-2 py-0.5 text-xs font-medium rounded',
              EMOTION_COLORS[row.emotion] || 'bg-gray-500/20 text-gray-400',
            )}
          >
            {EMOTION_LABELS[row.emotion as keyof typeof EMOTION_LABELS] || row.emotion}
          </span>
        )

      case 'answered':
        return row.answered ? (
          <span className="text-green-400">Oui</span>
        ) : (
          <span className="text-gray-500">Non</span>
        )

      case 'appointment_scheduled':
        return row.appointment_scheduled ? (
          <span className="text-green-400">Oui</span>
        ) : (
          <span className="text-gray-500">-</span>
        )

      case 'duration_seconds': {
        if (row.duration_seconds === null) return '-'
        const mins = Math.floor(row.duration_seconds / 60)
        const secs = row.duration_seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
      }

      case 'total_cost':
      case 'stt_cost':
      case 'tts_cost':
      case 'llm_cost':
      case 'telecom_cost':
      case 'dipler_commission': {
        const cost = row[columnKey as keyof AdminCallRow] as number | null
        if (cost === null) return '-'
        return `${cost.toFixed(4)} €`
      }

      case 'avg_llm_latency_ms':
      case 'min_llm_latency_ms':
      case 'max_llm_latency_ms':
      case 'avg_tts_latency_ms':
      case 'min_tts_latency_ms':
      case 'max_tts_latency_ms':
      case 'avg_total_latency_ms':
      case 'min_total_latency_ms':
      case 'max_total_latency_ms': {
        const latency = row[columnKey as keyof AdminCallRow] as number | null
        if (latency === null) return '-'
        return `${Math.round(latency)} ms`
      }

      case 'direction':
        if (!row.direction) return '-'
        return DIRECTION_LABELS[row.direction as keyof typeof DIRECTION_LABELS] || row.direction

      case 'recording_url':
        if (!row.recording_url) return '-'
        return (
          <a
            href={row.recording_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300 transition-colors"
            title="Écouter l'enregistrement"
          >
            <Play className="w-4 h-4" />
          </a>
        )

      case 'transcript':
        if (!row.transcript) return '-'
        return (
          <button
            onClick={() => onViewTranscript(row)}
            className="text-purple-400 hover:text-purple-300 transition-colors"
            title="Voir le transcript"
          >
            <FileText className="w-4 h-4" />
          </button>
        )

      default: {
        const value = row[columnKey as keyof AdminCallRow]
        if (value === null || value === undefined) return '-'
        if (typeof value === 'string' && value.length > 30) {
          return <span title={value}>{value.substring(0, 27)}...</span>
        }
        return String(value)
      }
    }
  }

  // Handle sort click
  const handleSortClick = (columnKey: string, sortable: boolean) => {
    if (!sortable) return

    const newDirection = sort.column === columnKey && sort.direction === 'desc' ? 'asc' : 'desc'
    onSortChange(columnKey, newDirection)
  }

  // Render sort icon
  const renderSortIcon = (columnKey: string, sortable: boolean) => {
    if (!sortable) return null

    if (sort.column === columnKey) {
      return sort.direction === 'asc' ? (
        <ChevronUp className="w-4 h-4 text-purple-400" />
      ) : (
        <ChevronDown className="w-4 h-4 text-purple-400" />
      )
    }
    return <ChevronsUpDown className="w-4 h-4 text-gray-500" />
  }

  return (
    <div className="flex flex-col h-full">
      {/* Table container with horizontal scroll - custom scrollbar */}
      <div
        className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-gray-800 scrollbar-thumb-hover-purple-500"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#9333ea #1f2937',
        }}
      >
        <table className="w-full border-collapse min-w-max">
          {/* Sticky header */}
          <thead className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-sm">
            <tr className="border-b border-gray-800">
              {visibleColumnDefs.map(
                ({ column, isGroupHeader, isFirstOfExpandedGroup, groupKey, groupLabel }) => (
                  <th
                    key={column.key}
                    className={cn(
                      'px-3 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap',
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right',
                      column.sortable && 'cursor-pointer hover:text-gray-200 select-none',
                      isGroupHeader && 'bg-gray-800/50',
                      isFirstOfExpandedGroup && 'bg-purple-900/20',
                    )}
                    style={{ width: column.width }}
                    onClick={() =>
                      isGroupHeader && groupKey
                        ? onToggleGroup(groupKey)
                        : handleSortClick(column.key, column.sortable)
                    }
                  >
                    <div
                      className={cn(
                        'flex items-center gap-1',
                        column.align === 'center' && 'justify-center',
                        column.align === 'right' && 'justify-end',
                      )}
                    >
                      {/* Collapsed group header - expand button */}
                      {isGroupHeader && groupKey && <ChevronRightIcon className="w-4 h-4" />}
                      {/* First column of expanded group - collapse button */}
                      {isFirstOfExpandedGroup && groupKey && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onToggleGroup(groupKey)
                          }}
                          className="mr-1 p-0.5 rounded hover:bg-gray-700"
                          title={`Réduire ${groupLabel}`}
                        >
                          <ChevronDownIcon className="w-3 h-3 text-purple-400" />
                        </button>
                      )}
                      <span>{column.label}</span>
                      {!isGroupHeader && renderSortIcon(column.key, column.sortable)}
                    </div>
                  </th>
                ),
              )}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-gray-800/50">
            {isLoading ? (
              <tr>
                <td colSpan={visibleColumnDefs.length} className="px-3 py-12 text-center">
                  <div className="flex items-center justify-center gap-2 text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Chargement...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={visibleColumnDefs.length}
                  className="px-3 py-12 text-center text-gray-500"
                >
                  Aucun appel trouvé
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row.id} className="hover:bg-gray-800/30 transition-colors">
                  {visibleColumnDefs.map(({ column, isGroupHeader, groupKey }) => {
                    // For collapsed group headers, show expand button
                    if (isGroupHeader && groupKey) {
                      return (
                        <td key={column.key} className="px-3 py-2 text-center">
                          <button
                            onClick={() => onToggleGroup(groupKey)}
                            className="text-gray-500 hover:text-gray-300"
                            title={`Afficher ${column.label}`}
                          >
                            <ChevronRightIcon className="w-4 h-4" />
                          </button>
                        </td>
                      )
                    }

                    return (
                      <td
                        key={column.key}
                        className={cn(
                          'px-3 py-2 text-sm text-gray-300 whitespace-nowrap',
                          column.align === 'center' && 'text-center',
                          column.align === 'right' && 'text-right',
                        )}
                      >
                        {formatCellValue(row, column.key)}
                      </td>
                    )
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex-none px-4 py-3 border-t border-gray-800 bg-gray-900/50">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Affichage{' '}
            {pagination.totalCount > 0
              ? `${(pagination.page - 1) * pagination.pageSize + 1}-${Math.min(
                  pagination.page * pagination.pageSize,
                  pagination.totalCount,
                )}`
              : '0'}{' '}
            sur {pagination.totalCount.toLocaleString('fr-FR')}
          </div>

          <div className="flex items-center gap-1">
            {/* First page */}
            <button
              onClick={() => onPageChange(1)}
              disabled={pagination.page <= 1}
              className="p-1.5 rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Première page"
            >
              <ChevronFirst className="w-4 h-4 text-gray-400" />
            </button>

            {/* Previous page */}
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-1.5 rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Page précédente"
            >
              <ChevronLeft className="w-4 h-4 text-gray-400" />
            </button>

            {/* Page numbers */}
            <div className="flex items-center gap-1 mx-2">
              {generatePageNumbers(pagination.page, pagination.totalPages).map((pageNum, idx) =>
                pageNum === '...' ? (
                  <span key={`ellipsis-${idx}`} className="px-2 text-gray-500">
                    ...
                  </span>
                ) : (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum as number)}
                    className={cn(
                      'px-3 py-1 text-sm rounded transition-colors',
                      pageNum === pagination.page
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-400 hover:bg-gray-800',
                    )}
                  >
                    {pageNum}
                  </button>
                ),
              )}
            </div>

            {/* Next page */}
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-1.5 rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Page suivante"
            >
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>

            {/* Last page */}
            <button
              onClick={() => onPageChange(pagination.totalPages)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-1.5 rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Dernière page"
            >
              <ChevronLast className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function to generate page numbers with ellipsis
function generatePageNumbers(currentPage: number, totalPages: number): (number | string)[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const pages: (number | string)[] = []

  // Always show first page
  pages.push(1)

  if (currentPage > 3) {
    pages.push('...')
  }

  // Show pages around current
  const start = Math.max(2, currentPage - 1)
  const end = Math.min(totalPages - 1, currentPage + 1)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (currentPage < totalPages - 2) {
    pages.push('...')
  }

  // Always show last page
  if (totalPages > 1) {
    pages.push(totalPages)
  }

  return pages
}
