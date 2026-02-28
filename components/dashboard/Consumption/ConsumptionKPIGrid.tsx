'use client'

import type { UserConsumptionResponse } from '@/lib/types/consumption'
import { KPICard } from '../KPICard'

interface ConsumptionKPIGridProps {
  data: UserConsumptionResponse | undefined
  isLoading: boolean
}

/**
 * KPI Grid pour le dashboard Ma Conso
 * Affiche 6 KPIs compacts lies a la consommation
 * SECURITE: N'affiche JAMAIS de donnees de marge
 */
export function ConsumptionKPIGrid({ data, isLoading }: ConsumptionKPIGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-20 rounded-xl bg-white/5 border border-white/10 animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center text-white/60 py-8">
        Aucune donnee disponible pour la periode selectionnee
      </div>
    )
  }

  const { current_period } = data

  // Format duration: minutes et secondes
  const totalMinutes = Math.floor(current_period.total_minutes)
  const totalSeconds = current_period.total_seconds % 60

  // Cout moyen par appel (si appels > 0)
  const avgCostPerCall =
    current_period.total_calls > 0 ? current_period.call_cost / current_period.total_calls : 0

  const kpis = [
    {
      label: 'Consommation Totale',
      value: current_period.total_cost,
      format: 'currency' as const,
      decorationColor: 'emerald' as const,
    },
    {
      label: 'Minutes',
      value: current_period.total_minutes,
      format: 'duration' as const,
      decorationColor: 'blue' as const,
    },
    {
      label: 'SMS Envoyes',
      value: current_period.total_sms_segments,
      format: 'number' as const,
      decorationColor: 'teal' as const,
    },
    {
      label: 'Emails Envoyes',
      value: current_period.total_emails,
      format: 'number' as const,
      decorationColor: 'violet' as const,
    },
    {
      label: 'Total Appels',
      value: current_period.total_calls,
      format: 'number' as const,
      decorationColor: 'amber' as const,
    },
    {
      label: 'Cout Moyen / Appel',
      value: avgCostPerCall,
      format: 'currency' as const,
      decorationColor: 'blue' as const,
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
      {kpis.map((kpi, index) => (
        <KPICard
          key={kpi.label}
          label={kpi.label}
          value={kpi.value}
          previousValue={0} // Pas de comparaison pour ce dashboard
          format={kpi.format}
          decorationColor={kpi.decorationColor}
          delay={index * 0.05}
          compact={true}
        />
      ))}
    </div>
  )
}
