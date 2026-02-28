// Hook pour les graphiques du dashboard Ma Conso
// SECURITE: Ne retourne JAMAIS de donnees de marge

import { useQuery } from '@tanstack/react-query'
import { fetchConsumptionChartData } from '@/lib/queries/consumption'
import type { ConsumptionChartData, ConsumptionFilters } from '@/lib/types/consumption'

/**
 * Hook pour recuperer les donnees des graphiques de consommation
 * Utilise par le dashboard Ma Conso
 *
 * @param filters - Filtres de dates et client
 * @param viewAsUserId - Pour les admins: voir les donnees d'un autre utilisateur
 */
export function useConsumptionChartData(filters: ConsumptionFilters, viewAsUserId?: string | null) {
  return useQuery<ConsumptionChartData, Error>({
    queryKey: [
      'consumption-charts',
      filters.startDate,
      filters.endDate,
      filters.clientId,
      viewAsUserId,
    ],
    queryFn: () => fetchConsumptionChartData(filters, viewAsUserId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Auto-refresh every 10 minutes
    enabled: !!filters.startDate && !!filters.endDate,
  })
}
