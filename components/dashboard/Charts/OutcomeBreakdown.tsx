'use client'

import { memo, useCallback, useMemo } from 'react'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { OUTCOME_CONFIG, OUTCOME_GROUP_COLORS } from '@/lib/constants'

interface OutcomeBreakdownProps {
  data: Array<{
    outcome: string
    count: number
  }>
}

function OutcomeBreakdownInner({ data }: OutcomeBreakdownProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []

    return data
      .filter((item) => item.count > 0)
      .map((item) => {
        const config = OUTCOME_CONFIG[item.outcome]
        const group = config?.group || 'error'
        return {
          name: config?.label || item.outcome,
          value: item.count,
          color: OUTCOME_GROUP_COLORS[group] || OUTCOME_GROUP_COLORS.error,
        }
      })
      .sort((a, b) => b.value - a.value)
  }, [data])

  const total = useMemo(() => chartData.reduce((sum, item) => sum + item.value, 0), [chartData])

  const renderCustomLabel = useCallback(
    // biome-ignore lint/suspicious/noExplicitAny: Recharts PieLabelRenderProps type is incompatible with custom label signature
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
          style={{ fontSize: '11px', fontWeight: 500 }}
        >
          {`${name} : ${value} (${percentage}%)`}
        </text>
      )
    },
    [total],
  )

  const renderLegend = useCallback(
    // biome-ignore lint/suspicious/noExplicitAny: Recharts Legend content prop types are complex and readonly
    (props: any) => {
      const { payload } = props
      return (
        <ul className="flex flex-col gap-2 text-sm text-white">
          {/* biome-ignore lint/suspicious/noExplicitAny: Recharts LegendPayload entries have dynamic shape */}
          {payload?.map((entry: any) => {
            const percentage = total > 0 ? ((entry.payload.value / total) * 100).toFixed(1) : 0
            return (
              <li key={entry.value} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="whitespace-nowrap">
                  {entry.value} : {percentage}%
                </span>
              </li>
            )
          })}
        </ul>
      )
    },
    [total],
  )

  return (
    <div className="bg-black/20 border border-white/20 rounded-xl p-3 flex flex-col h-full">
      <h3 className="text-sm font-semibold text-white mb-2 flex-shrink-0">
        Résultats d&apos;appels
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="35%"
            cy="50%"
            innerRadius="30%"
            outerRadius="50%"
            paddingAngle={2}
            dataKey="value"
            label={renderCustomLabel}
            labelLine={{
              stroke: 'rgba(255,255,255,0.3)',
              strokeWidth: 1,
            }}
          >
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
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
            wrapperStyle={{ paddingLeft: '20px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export const OutcomeBreakdown = memo(OutcomeBreakdownInner)
