'use client'

// Hook pour les données de facturation mensuelle
// SÉCURITÉ: Admin only - contient les données de tarification

import { type UseQueryResult, useQuery } from '@tanstack/react-query'
import { fetchAvailableInvoiceMonths, fetchMonthlyInvoiceSummary } from '@/lib/queries/invoice'
import type { MonthlyInvoiceSummaryResponse } from '@/lib/types/invoice'

/**
 * Hook pour récupérer le résumé de facturation d'un mois
 *
 * @param year - Année (ex: 2025)
 * @param month - Mois (1-12)
 * @returns Résumé de facturation avec détail par client
 */
export function useMonthlyInvoice(
  year: number,
  month: number,
): UseQueryResult<MonthlyInvoiceSummaryResponse> {
  return useQuery({
    queryKey: ['monthly-invoice', year, month],
    queryFn: () => fetchMonthlyInvoiceSummary(year, month),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refresh toutes les 10 minutes
    enabled: year > 0 && month >= 1 && month <= 12,
    retry: (failureCount, error) => {
      // Ne pas retry si accès refusé (non-admin)
      if (error instanceof Error && error.message.includes('Access denied')) {
        return false
      }
      return failureCount < 3
    },
  })
}

/**
 * Hook pour récupérer la liste des mois disponibles
 *
 * @returns Liste des mois disponibles pour la facturation
 */
export function useAvailableInvoiceMonths(): UseQueryResult<
  Array<{ year: number; month: number; label: string }>
> {
  return useQuery({
    queryKey: ['available-invoice-months'],
    queryFn: fetchAvailableInvoiceMonths,
    staleTime: 60 * 60 * 1000, // 1 heure
  })
}
