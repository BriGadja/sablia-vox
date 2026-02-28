'use client'

import { useQuery } from '@tanstack/react-query'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

// Types
export interface DashboardUser {
  user_id: string
  email: string
  full_name: string
  accessible_clients: string[]
  permission_level: string
}

/**
 * Fetch all users for admin view-as-user feature
 * Only accessible to admins
 */
async function fetchAllUsersForAdmin(): Promise<DashboardUser[]> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_all_users_for_admin')

  if (error) {
    console.error('Error fetching users:', error)
    throw error
  }

  return data as DashboardUser[]
}

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
    throw error
  }

  return data as string[]
}

/**
 * Hook to manage "view as user" functionality for admins
 * Persists selected user in URL params for navigation persistence
 */
export function useViewAsUser(isAdmin: boolean) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Get current viewAsUser from URL
  const viewAsUserId = searchParams.get('viewAsUser')

  // Fetch all users (only if admin)
  const usersQuery = useQuery({
    queryKey: ['admin-users-list'],
    queryFn: fetchAllUsersForAdmin,
    enabled: isAdmin,
    staleTime: 300000, // 5 minutes
  })

  // Fetch client IDs for selected user
  const userClientIdsQuery = useQuery({
    queryKey: ['user-client-ids', viewAsUserId],
    queryFn: () => fetchUserClientIds(viewAsUserId!),
    enabled: isAdmin && !!viewAsUserId,
    staleTime: 300000, // 5 minutes
  })

  // Find selected user info
  const selectedUser = useMemo(() => {
    if (!viewAsUserId || !usersQuery.data) return null
    return usersQuery.data.find((u) => u.user_id === viewAsUserId) || null
  }, [viewAsUserId, usersQuery.data])

  // Set view as user (persists in URL)
  const setViewAsUser = useCallback(
    (userId: string | null) => {
      const params = new URLSearchParams(searchParams.toString())

      if (userId) {
        params.set('viewAsUser', userId)
        // Clear any existing clientIds filter when switching users
        params.delete('clientIds')
      } else {
        params.delete('viewAsUser')
      }

      const queryString = params.toString()
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname
      router.push(newUrl)
    },
    [router, pathname, searchParams],
  )

  // Clear view as user
  const clearViewAsUser = useCallback(() => {
    setViewAsUser(null)
  }, [setViewAsUser])

  return {
    // Current state
    viewAsUserId,
    selectedUser,
    isViewingAsUser: !!viewAsUserId,

    // User's client IDs (for filtering data)
    userClientIds: userClientIdsQuery.data || [],
    isLoadingClientIds: userClientIdsQuery.isLoading,

    // All users list
    users: usersQuery.data || [],
    isLoadingUsers: usersQuery.isLoading,

    // Actions
    setViewAsUser,
    clearViewAsUser,
  }
}
