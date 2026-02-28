// Hierarchy Queries - Dashboard Restructure V2
// Queries pour recuperer la hierarchie entreprise/agent

import { createClient } from '@/lib/supabase/client'
import type { CompanyAgentHierarchy } from '@/lib/types/navigation'

/**
 * Recupere la hierarchie entreprise -> agents pour la navigation sidebar
 * Admin: voit TOUTES les entreprises (sauf si viewAsUserId est specifie)
 * Utilisateur: voit uniquement ses entreprises
 *
 * @param viewAsUserId - Pour les admins: voir la hierarchie d'un autre utilisateur
 */
export async function fetchCompanyAgentHierarchy(
  viewAsUserId?: string | null,
): Promise<CompanyAgentHierarchy> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc('get_company_agent_hierarchy', {
    p_view_as_user_id: viewAsUserId || null,
  })

  if (error) {
    console.error('Error fetching company-agent hierarchy:', error)
    throw new Error(`Failed to fetch hierarchy: ${error.message}`)
  }

  return (data || []) as CompanyAgentHierarchy
}
