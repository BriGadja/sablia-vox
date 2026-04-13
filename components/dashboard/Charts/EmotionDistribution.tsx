'use client'

import { memo, useCallback, useMemo } from 'react'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import {
  CHART_TOOLTIP_CONTENT_STYLE,
  CHART_TOOLTIP_ITEM_STYLE,
  CHART_TOOLTIP_LABEL_STYLE,
} from '@/lib/chart-config'

interface EmotionDistributionProps {
  data: Array<{
    emotion: string
    count: number
  }>
}

const emotionLabels: Record<string, string> = {
  Positif: 'Positif',
  Neutre: 'Neutre',
  Négatif: 'Négatif',
  positive: 'Positif',
  neutral: 'Neutre',
  negative: 'Négatif',
  unknown: 'Inconnu',
}

const emotionColors: Record<string, string> = {
  Positif: '#84cc16',
  Neutre: '#fbbf24',
  Négatif: '#fb7185',
  positive: '#84cc16',
  neutral: '#fbbf24',
  negative: '#fb7185',
  unknown: '#94a3b8',
}

function EmotionDistributionInner({ data }: EmotionDistributionProps) {
  // Filter and transform data with useMemo
  const chartData = useMemo(() => {
    const filteredData = data.filter(
      (item) => item.emotion != null && item.emotion !== 'unknown' && item.emotion !== 'Inconnu',
    )
    return filteredData.map((item) => ({
      name: emotionLabels[item.emotion] || emotionLabels.unknown,
      value: item.count,
      color: emotionColors[item.emotion] || emotionColors.unknown,
    }))
  }, [data])

  // Calculate total for percentages
  const total = useMemo(() => chartData.reduce((sum, item) => sum + item.value, 0), [chartData])

  // Custom label renderer with external labels and connecting lines
  const renderCustomLabel = useCallback(
    // biome-ignore lint/suspicious/noExplicitAny: Recharts PieLabelRenderProps type is incompatible with custom label signature
    (props: any) => {
      const { cx, cy, midAngle, outerRadius, name, value, percent } = props
      const RADIAN = Math.PI / 180
      const radius = outerRadius + 20 // Reduced distance from pie to label
      const x = cx + radius * Math.cos(-midAngle * RADIAN)
      const y = cy + radius * Math.sin(-midAngle * RADIAN)

      // Skip small segments to avoid clutter
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

  // Custom legend formatter with percentages
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
        Distribution des émotions
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
            contentStyle={CHART_TOOLTIP_CONTENT_STYLE}
            labelStyle={CHART_TOOLTIP_LABEL_STYLE}
            itemStyle={CHART_TOOLTIP_ITEM_STYLE}
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

/**
 * Memoized EmotionDistribution to prevent unnecessary re-renders
 * Only re-renders when data prop changes
 */
export const EmotionDistribution = memo(EmotionDistributionInner)
