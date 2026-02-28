// Consumption Queries - Dashboard Restructure V2
// Queries pour les metriques de consommation
// SECURITE: Ces queries ne retournent JAMAIS de donnees de marge aux utilisateurs

import { createClient } from '@/lib/supabase/client'
import type {
  AdminBillingSummaryResponse,
  ConsumptionChartData,
  ConsumptionFilters,
  UserConsumptionResponse,
} from '@/lib/types/consumption'

/**
 * Recupere les metriques de consommation pour les utilisateurs
 * SECURITE: NE retourne JAMAIS provider_cost, margin, margin_percentage
 *
 * @param filters - Filtres de dates et client
 * @param viewAsUserId - Pour les admins: voir les donnees d'un autre utilisateur
 */
export async function fetchUserConsumptionMetrics(
  filters: ConsumptionFilters,
  viewAsUserId?: string | null,
): Promise<UserConsumptionResponse> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc('get_user_consumption_metrics', {
    p_start_date: filters.startDate,
    p_end_date: filters.endDate,
    p_client_id: filters.clientId || null,
    p_view_as_user_id: viewAsUserId || null,
  })

  if (error) {
    console.error('Error fetching user consumption metrics:', error)
    throw new Error(`Failed to fetch consumption: ${error.message}`)
  }

  return data as UserConsumptionResponse
}

/**
 * Recupere le resume de facturation pour les admins
 * SECURITE: Uniquement pour les admins - contient les donnees de marge
 */
export async function fetchAdminBillingSummary(
  currentMonthStart: string,
  currentMonthEnd: string,
): Promise<AdminBillingSummaryResponse> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc('get_admin_billing_summary', {
    p_current_month_start: currentMonthStart,
    p_current_month_end: currentMonthEnd,
  })

  if (error) {
    // Gerer le cas d'acces refuse
    if (error.code === 'P0001') {
      throw new Error('Access denied: Admin permission required')
    }
    console.error('Error fetching admin billing summary:', error)
    throw new Error(`Failed to fetch billing summary: ${error.message}`)
  }

  return data as AdminBillingSummaryResponse
}

/**
 * Helper: Obtenir les dates du mois en cours
 */
export function getCurrentMonthDates(): { startDate: string; endDate: string } {
  const now = new Date()
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  }
}

/**
 * Helper: Obtenir les dates du mois precedent
 */
export function getPreviousMonthDates(): { startDate: string; endDate: string } {
  const now = new Date()
  const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endDate = new Date(now.getFullYear(), now.getMonth(), 0)

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  }
}

/**
 * Recupere les donnees pour les graphiques du dashboard Ma Conso
 * SECURITE: NE retourne JAMAIS provider_cost, margin, margin_percentage
 *
 * @param filters - Filtres de dates et client
 * @param viewAsUserId - Pour les admins: voir les donnees d'un autre utilisateur
 */
export async function fetchConsumptionChartData(
  filters: ConsumptionFilters,
  viewAsUserId?: string | null,
): Promise<ConsumptionChartData> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc('get_consumption_chart_data', {
    p_start_date: filters.startDate,
    p_end_date: filters.endDate,
    p_client_id: filters.clientId || null,
    p_view_as_user_id: viewAsUserId || null,
  })

  if (error) {
    console.error('Error fetching consumption chart data:', error)
    throw new Error(`Failed to fetch chart data: ${error.message}`)
  }

  return data as ConsumptionChartData
}
