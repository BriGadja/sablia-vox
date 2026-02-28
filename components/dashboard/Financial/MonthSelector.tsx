'use client'

import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useMemo } from 'react'
import {
  getMonthLabel,
  getNextMonth,
  getPreviousMonth,
  isFutureMonth,
  type MonthSelectorProps,
} from '@/lib/types/invoice'

/**
 * Sélecteur de mois pour la navigation dans les factures
 *
 * Affiche le mois sélectionné avec des flèches de navigation.
 * Désactive la navigation vers les mois futurs.
 */
export function MonthSelector({
  selectedYear,
  selectedMonth,
  onChange,
  minDate,
  maxDate,
  disabled = false,
}: MonthSelectorProps) {
  // Label du mois actuel
  const monthLabel = useMemo(
    () => getMonthLabel(selectedYear, selectedMonth),
    [selectedYear, selectedMonth],
  )

  // Vérifier si on peut aller au mois précédent
  const canGoPrevious = useMemo(() => {
    if (disabled) return false
    if (!minDate) return true

    const prev = getPreviousMonth(selectedYear, selectedMonth)
    const prevDate = new Date(prev.year, prev.month - 1, 1)
    const minMonth = new Date(minDate.getFullYear(), minDate.getMonth(), 1)

    return prevDate >= minMonth
  }, [selectedYear, selectedMonth, minDate, disabled])

  // Vérifier si on peut aller au mois suivant
  const canGoNext = useMemo(() => {
    if (disabled) return false

    const next = getNextMonth(selectedYear, selectedMonth)

    // Ne pas permettre d'aller dans le futur
    if (isFutureMonth(next.year, next.month)) return false

    // Vérifier maxDate si fourni
    if (maxDate) {
      const nextDate = new Date(next.year, next.month - 1, 1)
      const maxMonth = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1)
      return nextDate <= maxMonth
    }

    return true
  }, [selectedYear, selectedMonth, maxDate, disabled])

  // Handlers
  const handlePrevious = useCallback(() => {
    if (!canGoPrevious) return
    const prev = getPreviousMonth(selectedYear, selectedMonth)
    onChange(prev.year, prev.month)
  }, [selectedYear, selectedMonth, canGoPrevious, onChange])

  const handleNext = useCallback(() => {
    if (!canGoNext) return
    const next = getNextMonth(selectedYear, selectedMonth)
    onChange(next.year, next.month)
  }, [selectedYear, selectedMonth, canGoNext, onChange])

  return (
    <div className="flex items-center gap-2">
      {/* Icône calendrier */}
      <Calendar className="h-4 w-4 text-white/50" />

      {/* Navigation */}
      <div className="flex items-center gap-1 bg-white/5 rounded-lg px-1 py-0.5">
        {/* Bouton précédent */}
        <button
          onClick={handlePrevious}
          disabled={!canGoPrevious}
          className={`p-1.5 rounded-md transition-colors ${
            canGoPrevious
              ? 'hover:bg-white/10 text-white/70 hover:text-white'
              : 'text-white/20 cursor-not-allowed'
          }`}
          aria-label="Mois précédent"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Label du mois */}
        <span className="px-3 py-1 text-sm font-medium text-white min-w-[140px] text-center capitalize">
          {monthLabel}
        </span>

        {/* Bouton suivant */}
        <button
          onClick={handleNext}
          disabled={!canGoNext}
          className={`p-1.5 rounded-md transition-colors ${
            canGoNext
              ? 'hover:bg-white/10 text-white/70 hover:text-white'
              : 'text-white/20 cursor-not-allowed'
          }`}
          aria-label="Mois suivant"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default MonthSelector
