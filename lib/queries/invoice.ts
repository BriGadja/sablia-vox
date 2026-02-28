// Invoice Queries - Monthly Billing Dashboard
// Fonctions de requête pour le tableau de facturation mensuel
// SÉCURITÉ: Admin only

import { createClient } from '@/lib/supabase/client'
import type { MonthlyInvoiceSummaryResponse } from '@/lib/types/invoice'

/**
 * Récupère le résumé de facturation mensuel
 *
 * @param year - Année (ex: 2025)
 * @param month - Mois (1-12)
 * @returns Résumé de facturation avec détail par client
 * @throws Error si l'utilisateur n'est pas admin
 */
export async function fetchMonthlyInvoiceSummary(
  year: number,
  month: number,
): Promise<MonthlyInvoiceSummaryResponse> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc('get_monthly_invoice_summary', {
    p_year: year,
    p_month: month,
  })

  if (error) {
    console.error('[Invoice] Error fetching monthly invoice summary:', error)
    throw new Error(error.message || 'Failed to fetch invoice summary')
  }

  if (!data) {
    throw new Error('No data returned from invoice summary')
  }

  return data as MonthlyInvoiceSummaryResponse
}

/**
 * Récupère les mois disponibles pour la facturation
 * (depuis le premier déploiement jusqu'au mois en cours)
 *
 * @returns Liste des mois disponibles
 */
export async function fetchAvailableInvoiceMonths(): Promise<
  Array<{ year: number; month: number; label: string }>
> {
  const supabase = createClient()

  // Récupérer la date du premier déploiement
  const { data: firstDeployment, error } = await supabase
    .from('agent_deployments')
    .select('deployed_at')
    .order('deployed_at', { ascending: true })
    .limit(1)
    .single()

  if (error || !firstDeployment) {
    // Si pas de déploiement, retourner les 3 derniers mois
    const now = new Date()
    const months = []
    for (let i = 0; i < 3; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push({
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        label: date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
      })
    }
    return months
  }

  // Générer la liste des mois depuis le premier déploiement
  const startDate = new Date(firstDeployment.deployed_at)
  const now = new Date()
  const months: Array<{ year: number; month: number; label: string }> = []

  let current = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
  while (current <= now) {
    months.push({
      year: current.getFullYear(),
      month: current.getMonth() + 1,
      label: current.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
    })
    current = new Date(current.getFullYear(), current.getMonth() + 1, 1)
  }

  // Retourner dans l'ordre décroissant (plus récent en premier)
  return months.reverse()
}
