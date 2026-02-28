'use client'

import { Columns3, Download, Loader2, Phone } from 'lucide-react'
import { useQueryStates } from 'nuqs'
import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { AdminCallsFilters } from '@/components/dashboard/AdminCalls/AdminCallsFilters'
import { AdminCallsTable } from '@/components/dashboard/AdminCalls/AdminCallsTable'
import { ColumnVisibilityMenu } from '@/components/dashboard/AdminCalls/ColumnVisibilityMenu'
import {
  COLUMN_GROUPS,
  DEFAULT_COLLAPSED_GROUPS,
  DEFAULT_VISIBLE_COLUMNS,
} from '@/components/dashboard/AdminCalls/columnConfig'
import { TranscriptModal } from '@/components/dashboard/AdminCalls/TranscriptModal'
import { adminCallsParsers } from '@/lib/hooks/adminCallsSearchParams'
import { useAdminCalls, useAllClients } from '@/lib/hooks/useAdminCalls'
import { exportCallsToCSV, fetchAdminCallsExport } from '@/lib/queries/adminCalls'
import type {
  AdminCallRow,
  AdminCallsSort,
  AdminCallsFilters as FiltersType,
} from '@/lib/types/adminCalls'

export function AdminCallsClient() {
  // URL-based state management
  const [searchParams, setSearchParams] = useQueryStates(adminCallsParsers, {
    history: 'push',
    shallow: true,
  })

  // Local state
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    () => new Set(DEFAULT_VISIBLE_COLUMNS),
  )
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    () => new Set(DEFAULT_COLLAPSED_GROUPS),
  )
  const [selectedCall, setSelectedCall] = useState<AdminCallRow | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  // Build filters object for queries
  const filters: FiltersType = useMemo(
    () => ({
      startDate: searchParams.startDate,
      endDate: searchParams.endDate,
      clientIds: searchParams.clientIds || [],
      agentTypeName: searchParams.agentType || null,
      deploymentId: searchParams.deploymentId || null,
      outcomes: searchParams.outcomes || [],
      emotion: searchParams.emotion || null,
      direction: searchParams.direction || null,
      searchText: searchParams.search || '',
    }),
    [searchParams],
  )

  // Build sort object
  const sort: AdminCallsSort = useMemo(
    () => ({
      column: searchParams.sortColumn,
      direction: searchParams.sortDirection,
    }),
    [searchParams.sortColumn, searchParams.sortDirection],
  )

  // Fetch calls data
  const {
    data: callsData,
    isLoading,
    error,
  } = useAdminCalls(filters, sort, searchParams.page, searchParams.pageSize, true)

  // Fetch clients for filter
  const { data: clients = [] } = useAllClients()

  // Handle filter changes
  const handleFilterChange = useCallback(
    (newFilters: Partial<typeof searchParams>) => {
      // Reset to page 1 when filters change
      setSearchParams({ ...newFilters, page: 1 })
    },
    [setSearchParams],
  )

  // Handle page change
  const handlePageChange = useCallback(
    (page: number) => {
      setSearchParams({ page })
    },
    [setSearchParams],
  )

  // Handle sort change
  const handleSortChange = useCallback(
    (column: string, direction: 'asc' | 'desc') => {
      setSearchParams({ sortColumn: column, sortDirection: direction, page: 1 })
    },
    [setSearchParams],
  )

  // Handle column visibility toggle
  const handleToggleColumn = useCallback((columnKey: string) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev)
      if (next.has(columnKey)) {
        next.delete(columnKey)
      } else {
        next.add(columnKey)
      }
      return next
    })
  }, [])

  // Handle group collapse toggle
  const handleToggleGroup = useCallback((groupKey: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(groupKey)) {
        next.delete(groupKey)
        // When expanding, add all columns in the group to visible
        const group = COLUMN_GROUPS.find((g) => g.key === groupKey)
        if (group) {
          setVisibleColumns((prevCols) => {
            const nextCols = new Set(prevCols)
            group.columns.forEach((col) => nextCols.add(col))
            return nextCols
          })
        }
      } else {
        next.add(groupKey)
      }
      return next
    })
  }, [])

  // Handle show all columns
  const handleShowAll = useCallback(() => {
    const allColumns = new Set<string>()
    COLUMN_GROUPS.forEach((group) => {
      group.columns.forEach((col) => allColumns.add(col))
    })
    setVisibleColumns(allColumns)
    setCollapsedGroups(new Set())
  }, [])

  // Handle hide all optional columns (keep core)
  const handleHideAll = useCallback(() => {
    setVisibleColumns(new Set(DEFAULT_VISIBLE_COLUMNS))
    setCollapsedGroups(new Set(DEFAULT_COLLAPSED_GROUPS))
  }, [])

  // Handle CSV export
  const handleExport = useCallback(async () => {
    setIsExporting(true)
    try {
      const result = await fetchAdminCallsExport(filters)

      if (result.limitReached) {
        toast.warning(`Export limité à 10 000 lignes. ${result.exportedCount} appels exportés.`)
      }

      const filename = `appels_${filters.startDate}_${filters.endDate}.csv`
      exportCallsToCSV(result.data, filename)

      toast.success(`${result.exportedCount} appels exportés avec succès`)
    } catch (err) {
      console.error('Export error:', err)
      toast.error("Erreur lors de l'export")
    } finally {
      setIsExporting(false)
    }
  }, [filters])

  // Handle transcript modal
  const handleViewTranscript = useCallback((call: AdminCallRow) => {
    setSelectedCall(call)
  }, [])

  const handleCloseTranscript = useCallback(() => {
    setSelectedCall(null)
  }, [])

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-none px-6 py-4 border-b border-gray-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Phone className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">Historique des appels</h1>
              <p className="text-sm text-gray-400">
                {callsData?.pagination.totalCount.toLocaleString('fr-FR') || 0} appels au total
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Column visibility menu */}
            <ColumnVisibilityMenu
              visibleColumns={visibleColumns}
              collapsedGroups={collapsedGroups}
              onToggleColumn={handleToggleColumn}
              onToggleGroup={handleToggleGroup}
              onShowAll={handleShowAll}
              onHideAll={handleHideAll}
            />

            {/* Export button */}
            <button
              onClick={handleExport}
              disabled={isExporting || isLoading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex-none px-6 py-4 border-b border-gray-800/50 bg-gray-900/30">
        <AdminCallsFilters
          filters={searchParams}
          clients={clients}
          onFilterChange={handleFilterChange}
        />
      </div>

      {/* Table */}
      <div className="flex-1 overflow-hidden">
        {error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-red-400 mb-2">Erreur de chargement</p>
              <p className="text-sm text-gray-500">{error.message}</p>
            </div>
          </div>
        ) : (
          <AdminCallsTable
            data={callsData?.data || []}
            pagination={
              callsData?.pagination || { page: 1, pageSize: 50, totalCount: 0, totalPages: 0 }
            }
            isLoading={isLoading}
            sort={sort}
            visibleColumns={visibleColumns}
            collapsedGroups={collapsedGroups}
            onPageChange={handlePageChange}
            onSortChange={handleSortChange}
            onToggleGroup={handleToggleGroup}
            onViewTranscript={handleViewTranscript}
          />
        )}
      </div>

      {/* Transcript Modal */}
      <TranscriptModal
        call={selectedCall}
        isOpen={!!selectedCall}
        onClose={handleCloseTranscript}
      />
    </div>
  )
}
