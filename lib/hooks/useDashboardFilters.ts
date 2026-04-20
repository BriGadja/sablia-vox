'use client'

import { format, isAfter, isValid, parseISO, subDays } from 'date-fns'
import { useQueryStates } from 'nuqs'
import { useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import type { DashboardFilters } from '@/lib/types/dashboard'
import { dashboardParsers } from './dashboardSearchParams'

/**
 * Hook to manage dashboard filters via URL query parameters using nuqs
 * v2: no clientIds, no viewAsUser — org scoping is via JWT
 */
export function useDashboardFilters() {
  const [searchParams, setSearchParams] = useQueryStates(dashboardParsers, {
    history: 'push',
    shallow: true,
  })

  /**
   * Parse current filters from URL query params
   */
  const filters: DashboardFilters = useMemo(() => {
    const { deploymentId, templateType, startDate, endDate } = searchParams

    // Default date range: last 7 days
    const defaultEndDate = format(new Date(), 'yyyy-MM-dd')
    const defaultStartDate = format(subDays(new Date(), 7), 'yyyy-MM-dd')

    return {
      deploymentId: deploymentId || null,
      templateType: templateType || null,
      startDate: startDate || defaultStartDate,
      endDate: endDate || defaultEndDate,
    }
  }, [searchParams])

  /**
   * Update URL query params with new filter values
   */
  const updateFilters = useCallback(
    (updates: Partial<DashboardFilters>) => {
      const newParams: Partial<typeof searchParams> = {}

      if (updates.deploymentId !== undefined) {
        newParams.deploymentId = updates.deploymentId || null
      }

      if (updates.templateType !== undefined) {
        newParams.templateType = updates.templateType || null
      }

      // Handle date updates with validation
      const newStartDate = updates.startDate ?? filters.startDate
      const newEndDate = updates.endDate ?? filters.endDate

      if (updates.startDate !== undefined || updates.endDate !== undefined) {
        const parsedStart = parseISO(newStartDate)
        const parsedEnd = parseISO(newEndDate)

        if (!isValid(parsedStart) || !isValid(parsedEnd)) {
          toast.error('Format de date invalide', {
            description: 'Les dates doivent être au format YYYY-MM-DD.',
          })
          return
        }

        if (isAfter(parsedStart, parsedEnd)) {
          toast.error('Plage de dates invalide', {
            description: 'La date de début ne peut pas être postérieure à la date de fin.',
          })
          return
        }

        if (updates.startDate !== undefined) {
          newParams.startDate = updates.startDate
        }
        if (updates.endDate !== undefined) {
          newParams.endDate = updates.endDate
        }
      }

      setSearchParams(newParams)
    },
    [setSearchParams, filters.startDate, filters.endDate],
  )

  /**
   * Set deployment ID filter
   */
  const setDeploymentId = useCallback(
    (deploymentId: string | null) => {
      setSearchParams({ deploymentId })
    },
    [setSearchParams],
  )

  /**
   * Set template type filter
   */
  const setTemplateType = useCallback(
    (templateType: string | null) => {
      setSearchParams({ templateType })
    },
    [setSearchParams],
  )

  /**
   * Set date range filter with validation
   */
  const setDateRange = useCallback(
    (startDate: string, endDate: string) => {
      const parsedStart = parseISO(startDate)
      const parsedEnd = parseISO(endDate)

      if (!isValid(parsedStart) || !isValid(parsedEnd)) {
        toast.error('Format de date invalide', {
          description: 'Les dates doivent être au format YYYY-MM-DD.',
        })
        return
      }

      if (isAfter(parsedStart, parsedEnd)) {
        toast.error('Plage de dates invalide', {
          description: 'La date de début ne peut pas être postérieure à la date de fin.',
        })
        return
      }

      setSearchParams({ startDate, endDate })
    },
    [setSearchParams],
  )

  /**
   * Reset all filters to default values
   */
  const resetFilters = useCallback(() => {
    const defaultEndDate = format(new Date(), 'yyyy-MM-dd')
    const defaultStartDate = format(subDays(new Date(), 7), 'yyyy-MM-dd')

    setSearchParams({
      deploymentId: null,
      templateType: null,
      startDate: defaultStartDate,
      endDate: defaultEndDate,
    })
  }, [setSearchParams])

  return {
    filters,
    updateFilters,
    setDeploymentId,
    setTemplateType,
    setDateRange,
    resetFilters,
  }
}
