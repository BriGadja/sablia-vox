'use client'

// Hook pour la hierarchie entreprise/agent
// Utilise par le composant AgentTree dans la sidebar

import { type UseQueryResult, useQuery } from '@tanstack/react-query'
import { fetchCompanyAgentHierarchy } from '@/lib/queries/hierarchy'
import type { CompanyAgentHierarchy } from '@/lib/types/navigation'

/**
 * Hook pour recuperer la hierarchie entreprise -> agents
 * Utilise pour construire l'arbre de navigation dans la sidebar
 *
 * @param viewAsUserId - Pour les admins: voir la hierarchie d'un autre utilisateur
 */
export function useAgentHierarchy(
  viewAsUserId?: string | null,
): UseQueryResult<CompanyAgentHierarchy> {
  return useQuery({
    queryKey: ['agent-hierarchy', viewAsUserId],
    queryFn: () => fetchCompanyAgentHierarchy(viewAsUserId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refresh toutes les 5 minutes
    refetchOnWindowFocus: false,
  })
}
