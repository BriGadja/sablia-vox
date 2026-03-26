'use client'

import { type UseQueryResult, useQuery } from '@tanstack/react-query'
import { fetchAgentHierarchy } from '@/lib/queries/hierarchy'
import type { AgentHierarchy } from '@/lib/types/navigation'

/**
 * Hook to fetch agent hierarchy grouped by template type
 * Used by the AgentTree sidebar component
 */
export function useAgentHierarchy(): UseQueryResult<AgentHierarchy> {
  return useQuery({
    queryKey: ['agent-hierarchy'],
    queryFn: fetchAgentHierarchy,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}
