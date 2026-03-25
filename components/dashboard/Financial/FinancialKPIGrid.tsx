'use client'

import { KPICard } from '@/components/dashboard/KPICard'
import type { FinancialKPIResponse } from '@/lib/types/financial'

interface FinancialKPIGridProps {
  data: FinancialKPIResponse | undefined
  isLoading?: boolean
}

export function FinancialKPIGrid({ data, isLoading }: FinancialKPIGridProps) {
  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-xl bg-linear-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/30 animate-pulse"
          />
        ))}
      </div>
    )
  }

  const { current_period, previous_period } = data

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      {/* Marge Totale */}
      <KPICard
        label="Marge Totale"
        value={current_period.total_margin}
        previousValue={previous_period.total_margin}
        format="currency"
        decorationColor="emerald"
        delay={0}
      />

      {/* Marge % */}
      <KPICard
        label="Marge %"
        value={current_period.margin_percentage}
        previousValue={previous_period.margin_percentage}
        format="percentage"
        decorationColor="teal"
        delay={0.1}
      />

      {/* Revenue par Client */}
      <KPICard
        label="Revenue / Client"
        value={current_period.avg_revenue_per_client}
        format="currency"
        decorationColor="blue"
        delay={0.2}
      />

      {/* Marge par Client */}
      <KPICard
        label="Marge / Client"
        value={current_period.avg_margin_per_client}
        format="currency"
        decorationColor="violet"
        delay={0.3}
      />

      {/* Revenue Total */}
      <KPICard
        label="Revenue Total"
        value={current_period.total_revenue}
        previousValue={previous_period.total_revenue}
        format="currency"
        decorationColor="amber"
        delay={0.4}
      />

      {/* Coûts Total */}
      <KPICard
        label="Coûts Provider"
        value={current_period.total_provider_cost}
        previousValue={previous_period.total_provider_cost}
        format="currency"
        decorationColor="red"
        delay={0.5}
      />
    </div>
  )
}
