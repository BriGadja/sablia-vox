'use client'

import { useQuery } from '@tanstack/react-query'
import { format, isAfter, isValid, parseISO, subDays } from 'date-fns'
import { useQueryStates } from 'nuqs'
import { useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import type { DashboardFilters } from '@/lib/types/dashboard'
import { type AgentTypeName, dashboardParsers } from './dashboardSearchParams'

/**
 * Fetch client IDs for a specific user (admin only)
 */
async function fetchUserClientIds(userId: string): Promise<string[]> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_user_client_ids', {
    p_user_id: userId,
  })

  if (error) {
    console.error('Error fetching user client IDs:', error)
    return []
  }

  return (data as string[]) || []
}

/**
 * Hook to manage dashboard filters via URL query parameters using nuqs
 * Provides a clean, type-safe interface for reading and updating filters
 * All filter changes are persisted in the URL
 *
 * When viewAsUser is set (admin viewing as another user), the filters
 * automatically use that user's accessible client IDs
 */
export function useDashboardFilters() {
  // Use nuqs for type-safe URL state management
  const [searchParams, setSearchParams] = useQueryStates(dashboardParsers, {
    history: 'push',
    shallow: true, // Don't trigger server-side re-render
  })

  // Get viewAsUser from URL params
  const viewAsUserId = searchParams.viewAsUser

  // Fetch client IDs for the selected user (only when viewAsUser is set)
  const { data: viewAsUserClientIds, isLoading: isLoadingUserClientIds } = useQuery({
    queryKey: ['user-client-ids', viewAsUserId],
    queryFn: () => fetchUserClientIds(viewAsUserId!),
    enabled: !!viewAsUserId,
    staleTime: 300000, // 5 minutes
  })

  /**
   * Parse current filters from URL query params
   * When viewAsUser is active, override clientIds with user's accessible clients
   */
  const filters: DashboardFilters = useMemo(() => {
    const {
      clientIds: clientIdsParam,
      deploymentId,
      agentTypeName,
      startDate,
      endDate,
    } = searchParams

    // Default date range: last 30 days
    const defaultEndDate = format(new Date(), 'yyyy-MM-dd')
    const defaultStartDate = format(subDays(new Date(), 30), 'yyyy-MM-dd')

    // If viewing as another user, use their client IDs
    // Otherwise, use the clientIds filter if provided
    let clientIds: string[] = []
    if (viewAsUserId && viewAsUserClientIds && viewAsUserClientIds.length > 0) {
      clientIds = viewAsUserClientIds
    } else if (!viewAsUserId && clientIdsParam && clientIdsParam.length > 0) {
      clientIds = clientIdsParam
    }

    return {
      clientIds,
      deploymentId: deploymentId || null,
      agentTypeName: agentTypeName || null,
      startDate: startDate || defaultStartDate,
      endDate: endDate || defaultEndDate,
    }
  }, [searchParams, viewAsUserId, viewAsUserClientIds])

  /**
   * Update URL query params with new filter values
   * Includes validation for date ranges
   */
  const updateFilters = useCallback(
    (updates: Partial<DashboardFilters>) => {
      const newParams: Partial<typeof searchParams> = {}

      // Update clientIds (only if not in viewAsUser mode)
      if (updates.clientIds !== undefined && !viewAsUserId) {
        newParams.clientIds = updates.clientIds.length > 0 ? updates.clientIds : null
      }

      // Update deploymentId
      if (updates.deploymentId !== undefined) {
        newParams.deploymentId = updates.deploymentId || null
      }

      // Update agentTypeName
      if (updates.agentTypeName !== undefined) {
        newParams.agentTypeName = updates.agentTypeName || null
      }

      // Handle date updates with validation
      const newStartDate = updates.startDate ?? filters.startDate
      const newEndDate = updates.endDate ?? filters.endDate

      if (updates.startDate !== undefined || updates.endDate !== undefined) {
        const parsedStart = parseISO(newStartDate)
        const parsedEnd = parseISO(newEndDate)

        if (!isValid(parsedStart) || !isValid(parsedEnd)) {
          toast.error('Format de date invalide', {
            description: 'Les dates doivent etre au format YYYY-MM-DD.',
          })
          return
        }

        if (isAfter(parsedStart, parsedEnd)) {
          toast.error('Plage de dates invalide', {
            description: 'La date de debut ne peut pas etre posterieure a la date de fin.',
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
    [setSearchParams, filters.startDate, filters.endDate, viewAsUserId],
  )

  /**
   * Set client IDs filter (disabled when viewAsUser is active)
   */
  const setClientIds = useCallback(
    (clientIds: string[]) => {
      if (viewAsUserId) return // Ignore when viewing as user
      setSearchParams({
        clientIds: clientIds.length > 0 ? clientIds : null,
      })
    },
    [setSearchParams, viewAsUserId],
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
   * Set agent type name filter
   */
  const setAgentTypeName = useCallback(
    (agentTypeName: AgentTypeName | null) => {
      setSearchParams({ agentTypeName })
    },
    [setSearchParams],
  )

  /**
   * Set date range filter with validation
   * Ensures startDate is not after endDate
   */
  const setDateRange = useCallback(
    (startDate: string, endDate: string) => {
      // Validate date formats
      const parsedStart = parseISO(startDate)
      const parsedEnd = parseISO(endDate)

      if (!isValid(parsedStart) || !isValid(parsedEnd)) {
        toast.error('Format de date invalide', {
          description: 'Les dates doivent etre au format YYYY-MM-DD.',
        })
        return
      }

      // Validate date range
      if (isAfter(parsedStart, parsedEnd)) {
        toast.error('Plage de dates invalide', {
          description: 'La date de debut ne peut pas etre posterieure a la date de fin.',
        })
        return
      }

      setSearchParams({ startDate, endDate })
    },
    [setSearchParams],
  )

  /**
   * Reset all filters to default values
   * Note: viewAsUser is NOT reset here - use clearViewAsUser from useViewAsUser hook
   */
  const resetFilters = useCallback(() => {
    const defaultEndDate = format(new Date(), 'yyyy-MM-dd')
    const defaultStartDate = format(subDays(new Date(), 30), 'yyyy-MM-dd')

    setSearchParams({
      clientIds: null,
      deploymentId: null,
      agentTypeName: null,
      startDate: defaultStartDate,
      endDate: defaultEndDate,
    })
  }, [setSearchParams])

  /**
   * Determines if filters are ready to be used for data fetching
   * When viewAsUser is set, we need to wait for the user's client IDs to load
   * This prevents showing wrong data during the initial load
   */
  const isFiltersReady = useMemo(() => {
    // If not viewing as user, filters are immediately ready
    if (!viewAsUserId) return true
    // If viewing as user, wait for client IDs to load
    return !isLoadingUserClientIds && viewAsUserClientIds !== undefined
  }, [viewAsUserId, isLoadingUserClientIds, viewAsUserClientIds])

  return {
    filters,
    updateFilters,
    setClientIds,
    setDeploymentId,
    setAgentTypeName,
    setDateRange,
    resetFilters,
    // View as user state
    isViewingAsUser: !!viewAsUserId,
    isLoadingUserData: isLoadingUserClientIds,
    // NEW: Use this to prevent rendering stale data during viewAsUser load
    isFiltersReady,
  }
}
