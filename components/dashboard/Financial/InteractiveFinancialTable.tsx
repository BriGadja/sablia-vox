'use client'

import { motion } from 'motion/react'
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronRight, Download } from 'lucide-react'
import { useMemo, useState } from 'react'
import { exportToCSV, formatCurrency, formatPercentage } from '@/lib/queries/financial'

// ============================================================================
// Types
// ============================================================================

export interface ColumnDefinition<T> {
  key: string
  label: string
  sortable?: boolean
  format?: (value: any, row: T) => string | React.ReactNode
  align?: 'left' | 'center' | 'right'
  width?: string
  className?: string
}

interface InteractiveFinancialTableProps<T> {
  data: T[]
  columns: ColumnDefinition<T>[]
  isLoading?: boolean
  title?: string
  onRowClick?: (row: T) => void
  showDetailButton?: boolean
  onDetailClick?: (row: T) => void
  exportFilename?: string
  emptyMessage?: string
  pageSize?: number
}

type SortDirection = 'asc' | 'desc' | null

// ============================================================================
// Helper Functions
// ============================================================================

function getSortableValue(value: any): any {
  if (typeof value === 'string') {
    return value.toLowerCase()
  }
  if (typeof value === 'number') {
    return value
  }
  if (value === null || value === undefined) {
    return ''
  }
  return String(value).toLowerCase()
}

// ============================================================================
// Component
// ============================================================================

export function InteractiveFinancialTable<T extends Record<string, any>>({
  data,
  columns,
  isLoading,
  title,
  onRowClick,
  showDetailButton = false,
  onDetailClick,
  exportFilename = 'financial_data.csv',
  emptyMessage = 'Aucune donnée disponible',
  pageSize = 50,
}: InteractiveFinancialTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)
  const [currentPage, setCurrentPage] = useState(0)

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) return data

    return [...data].sort((a, b) => {
      const aValue = getSortableValue(a[sortColumn])
      const bValue = getSortableValue(b[sortColumn])

      if (aValue === bValue) return 0

      const comparison = aValue < bValue ? -1 : 1
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [data, sortColumn, sortDirection])

  // Paginate data
  const paginatedData = useMemo(() => {
    const start = currentPage * pageSize
    return sortedData.slice(start, start + pageSize)
  }, [sortedData, currentPage, pageSize])

  const totalPages = Math.ceil(sortedData.length / pageSize)

  // Handle column header click (toggle sort)
  const handleSort = (columnKey: string, sortable?: boolean) => {
    if (!sortable) return

    if (sortColumn === columnKey) {
      // Cycle through: asc -> desc -> null
      if (sortDirection === 'asc') {
        setSortDirection('desc')
      } else if (sortDirection === 'desc') {
        setSortDirection(null)
        setSortColumn(null)
      }
    } else {
      setSortColumn(columnKey)
      setSortDirection('asc')
    }
  }

  // Handle export
  const handleExport = () => {
    if (!data || data.length === 0) return

    // Transform data for export
    const exportData = sortedData.map((row) => {
      const exportRow: Record<string, any> = {}
      columns.forEach((col) => {
        const value = row[col.key]
        // Format value if formatter exists, otherwise use raw value
        if (col.format && typeof col.format(value, row) === 'string') {
          exportRow[col.label] = col.format(value, row)
        } else {
          exportRow[col.label] = value
        }
      })
      return exportRow
    })

    exportToCSV(exportData, exportFilename)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-800/50 bg-black/20 backdrop-blur-sm overflow-hidden">
        <div className="p-6">
          <div className="h-8 w-64 bg-gray-800/50 rounded animate-pulse mb-4" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-800/30 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border border-gray-800/50 bg-black/20 backdrop-blur-sm p-8 text-center">
        <p className="text-gray-400">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-xl border border-gray-800/50 bg-black/20 backdrop-blur-sm overflow-hidden"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          {title && <h3 className="text-xl font-bold text-white">{title}</h3>}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800/50">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`py-3 px-4 text-sm font-semibold text-gray-400 ${
                      column.align === 'right'
                        ? 'text-right'
                        : column.align === 'center'
                          ? 'text-center'
                          : 'text-left'
                    } ${column.sortable ? 'cursor-pointer hover:text-white' : ''}`}
                    style={{ width: column.width }}
                    onClick={() => handleSort(column.key, column.sortable)}
                  >
                    <div
                      className={`flex items-center gap-2 ${
                        column.align === 'right'
                          ? 'justify-end'
                          : column.align === 'center'
                            ? 'justify-center'
                            : 'justify-start'
                      }`}
                    >
                      <span>{column.label}</span>
                      {column.sortable && (
                        <span className="text-gray-500">
                          {sortColumn === column.key ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp className="w-4 h-4" />
                            ) : (
                              <ArrowDown className="w-4 h-4" />
                            )
                          ) : (
                            <ArrowUpDown className="w-4 h-4 opacity-40" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                {showDetailButton && (
                  <th className="py-3 px-4 text-sm font-semibold text-gray-400 text-right">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, index) => (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`border-b border-gray-800/30 transition-colors ${
                    onRowClick ? 'cursor-pointer hover:bg-white/5' : ''
                  }`}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column) => {
                    const value = row[column.key]
                    const formattedValue = column.format ? column.format(value, row) : value

                    return (
                      <td
                        key={column.key}
                        className={`py-3 px-4 text-sm ${
                          column.align === 'right'
                            ? 'text-right'
                            : column.align === 'center'
                              ? 'text-center'
                              : 'text-left'
                        } ${column.className || 'text-gray-300'}`}
                      >
                        {formattedValue}
                      </td>
                    )
                  })}
                  {showDetailButton && (
                    <td className="py-3 px-4 text-sm text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onDetailClick?.(row)
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-violet-600/20 hover:bg-violet-600/30 text-violet-400 text-xs font-medium rounded transition-colors"
                      >
                        Détail
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  )}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-400">
              Affichage {currentPage * pageSize + 1} à{' '}
              {Math.min((currentPage + 1) * pageSize, sortedData.length)} sur {sortedData.length}{' '}
              résultats
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Précédent
              </button>
              <span className="text-sm text-gray-400">
                Page {currentPage + 1} sur {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage === totalPages - 1}
                className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Suivant
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-800/50">
          <p className="text-xs text-gray-500 text-center">
            💡 Cliquez sur les en-têtes de colonnes pour trier • Utilisez Export CSV pour
            télécharger les données
          </p>
        </div>
      </div>
    </motion.div>
  )
}
