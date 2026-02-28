'use client'

import { useMemo } from 'react'
import type { DashboardFilters } from '@/lib/types/dashboard'
import { useDashboardFilters } from './useDashboardFilters'
import { useViewAsUser } from './useViewAsUser'

/**
 * Hook that combines dashboard filters with admin "view as user" functionality
 * When an admin selects a user to view as, this hook:
 * 1. Retrieves the selected user's client IDs
 * 2. Overrides the clientIds in filters with the user's accessible clients
 *
 * This ensures all dashboard queries are scoped to the selected user's data
 */
export function useAdminViewFilters(isAdmin: boolean) {
  const { filters: baseFilters, ...filterActions } = useDashboardFilters()
  const viewAsUser = useViewAsUser(isAdmin)

  // Combine base filters with view-as-user client IDs
  const filters: DashboardFilters = useMemo(() => {
    // If viewing as another user, use their client IDs
    if (viewAsUser.isViewingAsUser && viewAsUser.userClientIds.length > 0) {
      return {
        ...baseFilters,
        clientIds: viewAsUser.userClientIds,
      }
    }
    // Otherwise, use the base filters
    return baseFilters
  }, [baseFilters, viewAsUser.isViewingAsUser, viewAsUser.userClientIds])

  return {
    // Combined filters (with view-as-user override)
    filters,

    // Base filter actions
    ...filterActions,

    // View as user state and actions
    viewAsUser: {
      ...viewAsUser,
      // Helper to check if we're still loading user data
      isReady: !viewAsUser.isViewingAsUser || !viewAsUser.isLoadingClientIds,
    },
  }
}
