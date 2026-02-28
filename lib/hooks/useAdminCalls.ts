/**
 * Admin Calls React Query Hooks
 * Data fetching hooks for admin calls table
 */

import { useQuery } from '@tanstack/react-query'
import {
  fetchAdminCallsExport,
  fetchAdminCallsPaginated,
  fetchAllClients,
} from '@/lib/queries/adminCalls'
import type {
  AdminCallRow,
  AdminCallsFilters,
  AdminCallsResponse,
  AdminCallsSort,
} from '@/lib/types/adminCalls'

/**
 * Hook for fetching paginated admin calls
 */
export function useAdminCalls(
  filters: AdminCallsFilters,
  sort: AdminCallsSort,
  page: number,
  pageSize: number,
  enabled: boolean = true,
) {
  return useQuery<AdminCallsResponse>({
    queryKey: ['admin-calls', filters, sort, page, pageSize],
    queryFn: () => fetchAdminCallsPaginated(filters, sort, page, pageSize),
    staleTime: 60000, // 1 minute
    placeholderData: (previousData) => previousData, // Keep previous data while loading new
    enabled,
  })
}

/**
 * Hook for fetching calls for export
 * Only fetches when explicitly triggered
 */
export function useAdminCallsExport(filters: AdminCallsFilters, enabled: boolean = false) {
  return useQuery<{
    data: AdminCallRow[]
    exportedCount: number
    limitReached: boolean
  }>({
    queryKey: ['admin-calls-export', filters],
    queryFn: () => fetchAdminCallsExport(filters),
    enabled,
    staleTime: 0, // Always fetch fresh for export
  })
}

/**
 * Hook for fetching all clients (for multi-select filter)
 */
export function useAllClients() {
  return useQuery<Array<{ id: string; name: string }>>({
    queryKey: ['all-clients'],
    queryFn: fetchAllClients,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
