'use client'

import { memo, useMemo } from 'react'
import type { FunnelData } from '@/lib/types/dashboard'

interface FunnelChartProps {
  data: FunnelData | undefined
}

// Funnel stages configuration
const funnelStages = [
  { key: 'total_calls', label: 'Total Appels', color: '#3b82f6' }, // blue
  { key: 'contacted', label: 'Contactés', color: '#14b8a6' }, // teal
  { key: 'answered', label: 'Décrochés', color: '#f59e0b' }, // amber
  { key: 'qualified', label: 'Qualifiés', color: '#22c55e' }, // green
]

function FunnelChartInner({ data }: FunnelChartProps) {
  const chartData = useMemo(() => {
    if (!data) return []
    return funnelStages.map((stage) => ({
      ...stage,
      value: data[stage.key as keyof FunnelData] || 0,
    }))
  }, [data])

  const maxValue = useMemo(() => Math.max(...chartData.map((d) => d.value), 1), [chartData])

  if (!data || maxValue === 0) {
    return (
      <div className="bg-black/20 border border-white/20 rounded-xl p-3 flex flex-col h-full">
        <h3 className="text-sm font-semibold text-white mb-2 flex-shrink-0">Funnel des Appels</h3>
        <div className="flex-1 flex items-center justify-center text-white/50 text-sm">
          Aucune donnee disponible
        </div>
      </div>
    )
  }

  return (
    <div className="bg-black/20 border border-white/20 rounded-xl p-3 flex flex-col h-full">
      <h3 className="text-sm font-semibold text-white mb-2 flex-shrink-0">Funnel des Appels</h3>
      <div className="flex-1 flex flex-col justify-center gap-3 py-2">
        {chartData.map((stage, index) => {
          const widthPercent = (stage.value / maxValue) * 100
          const conversionRate =
            index > 0 && chartData[index - 1].value > 0
              ? ((stage.value / chartData[index - 1].value) * 100).toFixed(1)
              : null

          return (
            <div key={stage.key} className="flex items-center gap-3">
              {/* Label */}
              <div className="w-20 text-xs text-white/70 text-right flex-shrink-0">
                {stage.label}
              </div>

              {/* Bar container */}
              <div className="flex-1 relative">
                <div
                  className="h-8 rounded-r-lg transition-all duration-500 ease-out flex items-center"
                  style={{
                    width: `${Math.max(widthPercent, 5)}%`,
                    backgroundColor: stage.color,
                  }}
                >
                  <span className="px-2 text-xs font-bold text-white whitespace-nowrap">
                    {stage.value.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Conversion rate from previous stage */}
              <div className="w-14 text-xs text-right flex-shrink-0">
                {conversionRate ? (
                  <span className="text-white/60">{conversionRate}%</span>
                ) : (
                  <span className="text-white/30">-</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 text-[10px] text-white/50 mt-2 flex-shrink-0">
        <span>Volume</span>
        <span>|</span>
        <span>Taux de conversion</span>
      </div>
    </div>
  )
}

export const FunnelChart = memo(FunnelChartInner)
