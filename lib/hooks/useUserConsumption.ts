'use client'

// Hook pour les metriques de consommation utilisateur
// SECURITE: Ne retourne JAMAIS de donnees de marge

import { type UseQueryResult, useQuery } from '@tanstack/react-query'
import {
  fetchAdminBillingSummary,
  fetchUserConsumptionMetrics,
  getCurrentMonthDates,
} from '@/lib/queries/consumption'
import type {
  AdminBillingSummaryResponse,
  ConsumptionFilters,
  UserConsumptionResponse,
} from '@/lib/types/consumption'

/**
 * Hook pour recuperer les metriques de consommation utilisateur
 * SECURITE: NE retourne JAMAIS provider_cost, margin, margin_percentage
 *
 * @param filters - Filtres de date et client optionnel
 * @param viewAsUserId - Pour les admins: voir les donnees d'un autre utilisateur
 */
export function useUserConsumption(
  filters: ConsumptionFilters,
  viewAsUserId?: string | null,
): UseQueryResult<UserConsumptionResponse> {
  return useQuery({
    queryKey: [
      'user-consumption',
      filters.startDate,
      filters.endDate,
      filters.clientId,
      viewAsUserId,
    ],
    queryFn: () => fetchUserConsumptionMetrics(filters, viewAsUserId),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refresh toutes les 5 minutes
    enabled: !!filters.startDate && !!filters.endDate,
  })
}

/**
 * Hook pour recuperer les metriques de consommation du mois en cours
 * Utilise les dates du mois en cours par defaut
 */
export function useCurrentMonthConsumption(
  clientId?: string | null,
): UseQueryResult<UserConsumptionResponse> {
  const { startDate, endDate } = getCurrentMonthDates()

  return useUserConsumption({
    startDate,
    endDate,
    clientId,
  })
}

/**
 * Hook pour recuperer le resume de facturation admin
 * SECURITE: Uniquement pour les admins - contient les donnees de marge
 *
 * @param currentMonthStart - Date de debut du mois en cours (YYYY-MM-DD)
 * @param currentMonthEnd - Date de fin du mois en cours (YYYY-MM-DD)
 */
export function useAdminBillingSummary(
  currentMonthStart: string,
  currentMonthEnd: string,
): UseQueryResult<AdminBillingSummaryResponse> {
  return useQuery({
    queryKey: ['admin-billing-summary', currentMonthStart, currentMonthEnd],
    queryFn: () => fetchAdminBillingSummary(currentMonthStart, currentMonthEnd),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refresh toutes les 10 minutes
    enabled: !!currentMonthStart && !!currentMonthEnd,
    retry: (failureCount, error) => {
      // Ne pas retry si acces refuse (non-admin)
      if (error instanceof Error && error.message.includes('Access denied')) {
        return false
      }
      return failureCount < 3
    },
  })
}

/**
 * Hook pour le resume de facturation du mois en cours (admin)
 */
export function useCurrentMonthBillingSummary(): UseQueryResult<AdminBillingSummaryResponse> {
  const { startDate, endDate } = getCurrentMonthDates()
  return useAdminBillingSummary(startDate, endDate)
}
