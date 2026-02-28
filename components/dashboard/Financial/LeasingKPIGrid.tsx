'use client'

import { KPICard } from '@/components/dashboard/KPICard'
import type { LeasingMetrics } from '@/lib/types/financial'

interface LeasingKPIGridProps {
  data: LeasingMetrics | undefined
  isLoading: boolean
}

/**
 * LeasingKPIGrid Component
 *
 * Displays 4 KPI cards specific to leasing revenue model:
 * - Total Leasing Revenue: Total subscription revenue (100% margin)
 * - Clients with Leasing: Number of clients using leasing model
 * - Average Revenue per Client: Avg monthly leasing fee per client
 * - MRR: Monthly Recurring Revenue
 *
 * Colors: Violet/Purple theme for leasing (matches FinancialViewToggle)
 */
export function LeasingKPIGrid({ data, isLoading }: LeasingKPIGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-32 rounded-xl bg-white/5 border border-white/10 animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center text-white/60 py-12">
        Aucune donnée de leasing disponible pour la période sélectionnée
      </div>
    )
  }

  const leasingKPIs = [
    {
      label: '💰 Revenu Leasing Total',
      value: data.total_leasing_revenue,
      format: 'currency' as const,
      decorationColor: 'violet' as const,
    },
    {
      label: '👥 Clients avec Leasing',
      value: data.leasing_client_count,
      format: 'number' as const,
      decorationColor: 'blue' as const,
    },
    {
      label: '📊 Revenu Moyen/Client',
      value: data.avg_leasing_per_client,
      format: 'currency' as const,
      decorationColor: 'emerald' as const,
    },
    {
      label: '📈 MRR',
      value: data.mrr,
      format: 'currency' as const,
      decorationColor: 'violet' as const,
    },
  ]

  return (
    <div className="space-y-4">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {leasingKPIs.map((kpi, index) => (
          <KPICard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            format={kpi.format}
            decorationColor={kpi.decorationColor}
            delay={index * 0.05}
          />
        ))}
      </div>
    </div>
  )
}
