'use client'

import { memo, useCallback, useMemo } from 'react'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { OutcomeData } from '@/lib/types/dashboard'

interface NestennOutcomeChartProps {
  data: OutcomeData[] | undefined
}

// Extended outcome data from SQL includes color
interface ExtendedOutcomeData extends OutcomeData {
  color?: string
}

// Labels français pour les outcomes Nestenn
const outcomeLabels: Record<string, string> = {
  appointment_requested: 'Transfert demandé',
  callback_requested: 'Rappel demandé',
  voicemail: 'Messagerie',
  no_answer: 'Pas de réponse',
  not_interested: 'Pas intéressé',
  unknown: 'Autre',
  null: 'Non défini',
}

// Couleurs spécifiques pour chaque résultat Nestenn
const outcomeColors: Record<string, string> = {
  appointment_requested: '#10b981', // emerald - succès
  callback_requested: '#3b82f6', // blue
  voicemail: '#f59e0b', // amber
  no_answer: '#6b7280', // gray
  not_interested: '#ef4444', // red
  unknown: '#8b5cf6', // violet
  null: '#64748b', // slate
}

function NestennOutcomeChartInner({ data }: NestennOutcomeChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []
    return (data as ExtendedOutcomeData[])
      .filter((item) => item.count > 0)
      .map((item) => {
        const outcomeKey = item.outcome || 'unknown'
        return {
          name: outcomeLabels[outcomeKey] || item.outcome || 'Autre',
          value: item.count,
          color: outcomeColors[outcomeKey] || item.color || '#6b7280',
        }
      })
      .sort((a, b) => b.value - a.value)
  }, [data])

  const total = useMemo(() => chartData.reduce((sum, item) => sum + item.value, 0), [chartData])

  const renderCustomLabel = useCallback(
    (props: any) => {
      const { cx, cy, midAngle, outerRadius, name, value, percent } = props
      const RADIAN = Math.PI / 180
      const radius = outerRadius + 20
      const x = cx + radius * Math.cos(-midAngle * RADIAN)
      const y = cy + radius * Math.sin(-midAngle * RADIAN)

      if (percent < 0.05) return null

      const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0

      return (
        <text
          x={x}
          y={y}
          fill="#fff"
          textAnchor={x > cx ? 'start' : 'end'}
          dominantBaseline="central"
          style={{ fontSize: '10px', fontWeight: 500 }}
        >
          {`${name}: ${value} (${percentage}%)`}
        </text>
      )
    },
    [total],
  )

  const renderLegend = useCallback(
    (props: any) => {
      const { payload } = props
      return (
        <ul className="flex flex-col gap-1.5 text-xs text-white">
          {payload?.slice(0, 6).map((entry: any, index: number) => {
            const percentage = total > 0 ? ((entry.payload.value / total) * 100).toFixed(1) : 0
            return (
              <li key={`legend-${index}`} className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="whitespace-nowrap truncate max-w-[120px]" title={entry.value}>
                  {entry.value}: {percentage}%
                </span>
              </li>
            )
          })}
        </ul>
      )
    },
    [total],
  )

  if (!data || data.length === 0 || total === 0) {
    return (
      <div className="bg-black/20 border border-white/20 rounded-xl p-3 flex flex-col h-full">
        <h3 className="text-sm font-semibold text-white mb-2 flex-shrink-0">
          Distribution des resultats
        </h3>
        <div className="flex-1 flex items-center justify-center text-white/50 text-sm">
          Aucune donnee disponible
        </div>
      </div>
    )
  }

  return (
    <div className="bg-black/20 border border-white/20 rounded-xl p-3 flex flex-col h-full">
      <h3 className="text-sm font-semibold text-white mb-2 flex-shrink-0">
        Distribution des resultats
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="35%"
            cy="50%"
            innerRadius="25%"
            outerRadius="45%"
            paddingAngle={2}
            dataKey="value"
            label={renderCustomLabel}
            labelLine={{
              stroke: 'rgba(255,255,255,0.3)',
              strokeWidth: 1,
            }}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0,0,0,0.95)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '8px',
              padding: '8px 12px',
            }}
            labelStyle={{
              color: '#fff',
              fontWeight: 'bold',
              marginBottom: '4px',
            }}
            itemStyle={{
              color: '#fff',
            }}
            separator=" : "
            formatter={(value: number) => {
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0
              return `${value} appels (${percentage}%)`
            }}
          />
          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            content={renderLegend}
            wrapperStyle={{ paddingLeft: '15px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export const NestennOutcomeChart = memo(NestennOutcomeChartInner)
