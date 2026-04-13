'use client'

import type { KPIMetrics } from '@/lib/types/dashboard'
import { KPICard } from './KPICard'

interface KPIGridProps {
  data: KPIMetrics | undefined
  isLoading: boolean
  agentType?: string
  avgLatency?: number // Average total latency in milliseconds
}

/**
 * KPI Grid Component — v2
 * Displays a responsive grid of KPI cards with period comparison
 * Uses v2 KPIPeriod fields: total_calls, answered_calls, conversions,
 * answer_rate, conversion_rate, avg_duration, total_billed_cost, avg_billed_cost,
 * voicemail_count, no_answer_count
 */
export function KPIGrid({ data, isLoading, agentType = 'global', avgLatency = 0 }: KPIGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {['k1', 'k2', 'k3', 'k4', 'k5', 'k6', 'k7', 'k8'].map((key) => (
          <div
            key={key}
            className="h-32 rounded-xl bg-white/5 border border-white/10 animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center text-white/60 py-12">
        Aucune donnée disponible pour la période sélectionnée
      </div>
    )
  }

  const { current_period, previous_period } = data

  // Overview Dashboard - 5 KPIs (funnel chronologique)
  const overviewKPIs = [
    {
      label: 'Total Appels',
      value: current_period.total_calls,
      previousValue: previous_period.total_calls,
      format: 'number' as const,
      decorationColor: 'blue' as const,
    },
    {
      label: 'Taux de Décroché',
      value: current_period.answer_rate,
      previousValue: previous_period.answer_rate,
      format: 'percentage' as const,
      decorationColor: 'teal' as const,
    },
    {
      label: 'Appels Répondus',
      value: current_period.answered_calls,
      previousValue: previous_period.answered_calls,
      format: 'number' as const,
      decorationColor: 'emerald' as const,
    },
    {
      label: 'Durée Moyenne',
      value: current_period.avg_duration,
      previousValue: previous_period.avg_duration,
      format: 'duration' as const,
      decorationColor: 'amber' as const,
    },
    {
      label: 'Latence Moyenne',
      value: avgLatency,
      previousValue: 0,
      format: 'latency' as const,
      decorationColor: 'blue' as const,
    },
  ]

  // Agent-specific dashboard - 6 KPIs
  const agentKPIs = [
    {
      label: 'Total Appels',
      value: current_period.total_calls,
      previousValue: previous_period.total_calls,
      format: 'number' as const,
      decorationColor: 'blue' as const,
    },
    {
      label: 'Taux de Décroché',
      value: current_period.answer_rate,
      previousValue: previous_period.answer_rate,
      format: 'percentage' as const,
      decorationColor: 'teal' as const,
    },
    {
      label: 'Durée Moyenne',
      value: current_period.avg_duration,
      previousValue: previous_period.avg_duration,
      format: 'duration' as const,
      decorationColor: 'amber' as const,
    },
    {
      label: 'Conversions',
      value: current_period.conversions,
      previousValue: previous_period.conversions,
      format: 'number' as const,
      decorationColor: 'violet' as const,
    },
    {
      label: 'Taux de Conversion',
      value: current_period.conversion_rate,
      previousValue: previous_period.conversion_rate,
      format: 'percentage' as const,
      decorationColor: 'emerald' as const,
    },
    {
      label: 'Latence Moyenne',
      value: avgLatency,
      previousValue: 0,
      format: 'latency' as const,
      decorationColor: 'blue' as const,
    },
  ]

  // Default / global KPIs - full set
  const globalKPIs = [
    {
      label: 'Appels totaux',
      value: current_period.total_calls,
      previousValue: previous_period.total_calls,
      format: 'number' as const,
      decorationColor: 'blue' as const,
    },
    {
      label: 'Appels répondus',
      value: current_period.answered_calls,
      previousValue: previous_period.answered_calls,
      format: 'number' as const,
      decorationColor: 'emerald' as const,
    },
    {
      label: 'Taux de réponse',
      value: current_period.answer_rate,
      previousValue: previous_period.answer_rate,
      format: 'percentage' as const,
      decorationColor: 'violet' as const,
    },
    {
      label: 'Conversions',
      value: current_period.conversions,
      previousValue: previous_period.conversions,
      format: 'number' as const,
      decorationColor: 'amber' as const,
    },
    {
      label: 'Taux de conversion',
      value: current_period.conversion_rate,
      previousValue: previous_period.conversion_rate,
      format: 'percentage' as const,
      decorationColor: 'emerald' as const,
    },
    {
      label: 'Durée moyenne',
      value: current_period.avg_duration,
      previousValue: previous_period.avg_duration,
      format: 'duration' as const,
      decorationColor: 'blue' as const,
    },
    {
      label: 'Coût total',
      value: current_period.total_billed_cost,
      previousValue: previous_period.total_billed_cost,
      format: 'currency' as const,
      decorationColor: 'red' as const,
    },
    {
      label: 'Coût moyen / appel',
      value: current_period.avg_billed_cost,
      previousValue: previous_period.avg_billed_cost,
      format: 'currency' as const,
      decorationColor: 'amber' as const,
    },
  ]

  // Combine KPIs based on agent type
  const allKPIs =
    agentType === 'overview' ? overviewKPIs : agentType === 'global' ? globalKPIs : agentKPIs

  // Grid columns: 5 for Overview, 6 for agent-specific, 4 for global
  const gridCols =
    agentType === 'overview'
      ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5'
      : agentType === 'global'
        ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
        : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6'

  // Gap: smaller for compact layouts
  const gridGap = agentType === 'overview' || agentType !== 'global' ? 'gap-2' : 'gap-6'

  // Use compact mode for non-global dashboards
  const isCompact = agentType !== 'global'

  return (
    <div className={`grid ${gridCols} ${gridGap}`}>
      {allKPIs.map((kpi, index) => (
        <KPICard
          key={kpi.label}
          label={kpi.label}
          value={kpi.value}
          previousValue={kpi.previousValue}
          format={kpi.format}
          decorationColor={kpi.decorationColor}
          delay={index * 0.05}
          compact={isCompact}
        />
      ))}
    </div>
  )
}
