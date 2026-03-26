'use client'

import { ChevronDown, ChevronUp, RotateCcw, Search, X } from 'lucide-react'
import { useCallback, useState } from 'react'
import { DateRangeFilter } from '@/components/dashboard/Filters/DateRangeFilter'
import {
  AGENT_TYPES,
  CALL_DIRECTIONS,
  CALL_EMOTIONS,
  CALL_OUTCOMES,
  DIRECTION_LABELS,
  EMOTION_LABELS,
  OUTCOME_LABELS,
} from '@/lib/types/adminCalls'
import { cn } from '@/lib/utils'
import { MultiClientSelect } from './MultiClientSelect'

interface Client {
  id: string
  name: string
}

interface FilterState {
  startDate: string
  endDate: string
  clientIds: string[]
  agentType: string | null
  outcomes: string[]
  emotion: 'positive' | 'neutral' | 'negative' | null
  direction: 'inbound' | 'outbound' | null
  search: string
}

interface AdminCallsFiltersProps {
  filters: FilterState
  clients: Client[]
  onFilterChange: (filters: Partial<FilterState>) => void
}

export function AdminCallsFilters({ filters, clients, onFilterChange }: AdminCallsFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [searchInput, setSearchInput] = useState(filters.search || '')

  // Debounced search
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchInput(value)
      // Debounce: wait 300ms before updating
      const timeoutId = setTimeout(() => {
        onFilterChange({ search: value })
      }, 300)
      return () => clearTimeout(timeoutId)
    },
    [onFilterChange],
  )

  // Handle date range change
  const handleDateChange = useCallback(
    (startDate: Date, endDate: Date) => {
      onFilterChange({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      })
    },
    [onFilterChange],
  )

  // Handle outcome toggle
  const handleOutcomeToggle = useCallback(
    (outcome: string) => {
      const currentOutcomes = filters.outcomes || []
      if (currentOutcomes.includes(outcome)) {
        onFilterChange({
          outcomes: currentOutcomes.filter((o) => o !== outcome),
        })
      } else {
        onFilterChange({
          outcomes: [...currentOutcomes, outcome],
        })
      }
    },
    [filters.outcomes, onFilterChange],
  )

  // Reset all filters
  const handleResetFilters = useCallback(() => {
    const today = new Date()
    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    setSearchInput('')
    onFilterChange({
      startDate: thirtyDaysAgo.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
      clientIds: [],
      agentType: null,
      outcomes: [],
      emotion: null,
      direction: null,
      search: '',
    })
  }, [onFilterChange])

  // Check if any filters are active
  const hasActiveFilters =
    (filters.clientIds && filters.clientIds.length > 0) ||
    filters.agentType ||
    (filters.outcomes && filters.outcomes.length > 0) ||
    filters.emotion ||
    filters.direction ||
    filters.search

  return (
    <div className="space-y-3">
      {/* Main filters row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Date range */}
        <DateRangeFilter
          startDate={new Date(filters.startDate)}
          endDate={new Date(filters.endDate)}
          onChange={handleDateChange}
        />

        {/* Client multi-select */}
        <MultiClientSelect
          clients={clients}
          selectedIds={filters.clientIds || []}
          onChange={(ids) => onFilterChange({ clientIds: ids })}
        />

        {/* Agent type select */}
        <select
          value={filters.agentType || ''}
          onChange={(e) =>
            onFilterChange({
              agentType: e.target.value || null,
            })
          }
          className="px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-gray-200 hover:border-gray-600 focus:outline-none focus:border-purple-500"
        >
          <option value="">Tous les types</option>
          {AGENT_TYPES.map((type) => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>

        {/* Search input */}
        <div className="relative flex-1 min-w-[200px] max-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Rechercher (nom, tél, email)..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-purple-500"
          />
          {searchInput && (
            <button
              onClick={() => {
                setSearchInput('')
                onFilterChange({ search: '' })
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-700"
            >
              <X className="w-3 h-3 text-gray-400" />
            </button>
          )}
        </div>

        {/* Advanced filters toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border transition-colors',
            showAdvanced
              ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
              : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600',
          )}
        >
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          Filtres avancés
        </button>

        {/* Reset filters button */}
        {hasActiveFilters && (
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
            title="Réinitialiser les filtres"
          >
            <RotateCcw className="w-4 h-4" />
            Réinitialiser
          </button>
        )}
      </div>

      {/* Advanced filters panel */}
      {showAdvanced && (
        <div className="p-4 bg-gray-800/30 border border-gray-700/50 rounded-lg space-y-4">
          {/* Outcomes */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">
              Résultat de l'appel
            </label>
            <div className="flex flex-wrap gap-2">
              {CALL_OUTCOMES.map((outcome) => {
                const isSelected = (filters.outcomes || []).includes(outcome)
                return (
                  <button
                    key={outcome}
                    onClick={() => handleOutcomeToggle(outcome)}
                    className={cn(
                      'px-3 py-1.5 text-xs font-medium rounded-full border transition-colors',
                      isSelected
                        ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                        : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600',
                    )}
                  >
                    {OUTCOME_LABELS[outcome]}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Emotion and Direction row */}
          <div className="flex flex-wrap gap-6">
            {/* Emotion */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">Émotion</label>
              <div className="flex gap-2">
                <button
                  onClick={() => onFilterChange({ emotion: null })}
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium rounded-full border transition-colors',
                    !filters.emotion
                      ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                      : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600',
                  )}
                >
                  Toutes
                </button>
                {CALL_EMOTIONS.map((emotion) => (
                  <button
                    key={emotion}
                    onClick={() => onFilterChange({ emotion })}
                    className={cn(
                      'px-3 py-1.5 text-xs font-medium rounded-full border transition-colors',
                      filters.emotion === emotion
                        ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                        : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600',
                    )}
                  >
                    {EMOTION_LABELS[emotion]}
                  </button>
                ))}
              </div>
            </div>

            {/* Direction */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">Direction</label>
              <div className="flex gap-2">
                <button
                  onClick={() => onFilterChange({ direction: null })}
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium rounded-full border transition-colors',
                    !filters.direction
                      ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                      : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600',
                  )}
                >
                  Toutes
                </button>
                {CALL_DIRECTIONS.map((direction) => (
                  <button
                    key={direction}
                    onClick={() => onFilterChange({ direction })}
                    className={cn(
                      'px-3 py-1.5 text-xs font-medium rounded-full border transition-colors',
                      filters.direction === direction
                        ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                        : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600',
                    )}
                  >
                    {DIRECTION_LABELS[direction]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
