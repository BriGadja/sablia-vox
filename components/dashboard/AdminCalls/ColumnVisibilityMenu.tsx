'use client'

import { Check, ChevronDown, ChevronRight, Columns3, Eye, EyeOff } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { COLUMN_DEFINITIONS, COLUMN_GROUPS } from './columnConfig'

interface ColumnVisibilityMenuProps {
  visibleColumns: Set<string>
  collapsedGroups: Set<string>
  onToggleColumn: (columnKey: string) => void
  onToggleGroup: (groupKey: string) => void
  onShowAll: () => void
  onHideAll: () => void
}

export function ColumnVisibilityMenu({
  visibleColumns,
  collapsedGroups,
  onToggleColumn,
  onToggleGroup,
  onShowAll,
  onHideAll,
}: ColumnVisibilityMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Count visible columns per group
  const getGroupVisibleCount = (groupKey: string) => {
    const group = COLUMN_GROUPS.find((g) => g.key === groupKey)
    if (!group) return 0
    return group.columns.filter((col) => visibleColumns.has(col)).length
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors',
          isOpen
            ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
            : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600',
        )}
      >
        <Columns3 className="w-4 h-4" />
        Colonnes
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 z-50 mt-1 w-72 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="px-3 py-2 border-b border-gray-700 bg-gray-800/50">
            <p className="text-xs font-medium text-gray-400">Afficher / Masquer les colonnes</p>
          </div>

          {/* Column groups */}
          <div className="max-h-96 overflow-y-auto py-1">
            {COLUMN_GROUPS.map((group) => {
              const isCollapsed = collapsedGroups.has(group.key)
              const visibleCount = getGroupVisibleCount(group.key)
              const totalCount = group.columns.length

              return (
                <div key={group.key} className="border-b border-gray-700/50 last:border-b-0">
                  {/* Group header */}
                  <div
                    className={cn(
                      'flex items-center justify-between px-3 py-2',
                      group.collapsible && 'cursor-pointer hover:bg-gray-700/50',
                    )}
                    onClick={() => group.collapsible && onToggleGroup(group.key)}
                  >
                    <div className="flex items-center gap-2">
                      {group.collapsible &&
                        (isCollapsed ? (
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        ))}
                      <span className="text-sm font-medium text-gray-300">{group.label}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {visibleCount}/{totalCount}
                    </span>
                  </div>

                  {/* Column checkboxes (show if not collapsed or not collapsible) */}
                  {(!group.collapsible || !isCollapsed) && (
                    <div className="pl-6 pb-1">
                      {group.columns.map((columnKey) => {
                        const column = COLUMN_DEFINITIONS.find((c) => c.key === columnKey)
                        if (!column) return null

                        const isVisible = visibleColumns.has(columnKey)

                        return (
                          <button
                            key={columnKey}
                            onClick={() => onToggleColumn(columnKey)}
                            className="flex items-center gap-2 w-full px-2 py-1.5 text-left hover:bg-gray-700/50 rounded transition-colors"
                          >
                            <div
                              className={cn(
                                'w-4 h-4 rounded border flex items-center justify-center flex-shrink-0',
                                isVisible ? 'bg-purple-500 border-purple-500' : 'border-gray-600',
                              )}
                            >
                              {isVisible && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <span
                              className={cn(
                                'text-sm',
                                isVisible ? 'text-gray-200' : 'text-gray-500',
                              )}
                            >
                              {column.label}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between px-3 py-2 border-t border-gray-700 bg-gray-800/50">
            <button
              onClick={() => {
                onShowAll()
                setIsOpen(false)
              }}
              className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300"
            >
              <Eye className="w-3.5 h-3.5" />
              Tout afficher
            </button>
            <button
              onClick={() => {
                onHideAll()
                setIsOpen(false)
              }}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-300"
            >
              <EyeOff className="w-3.5 h-3.5" />
              Par défaut
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
