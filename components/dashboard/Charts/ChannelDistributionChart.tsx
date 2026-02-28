'use client'

import { memo, useCallback, useMemo } from 'react'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { ChannelBreakdown } from '@/lib/types/consumption'

interface ChannelDistributionChartProps {
  data: ChannelBreakdown | undefined
}

const channelColors: Record<string, string> = {
  Appels: '#3b82f6', // blue
  SMS: '#14b8a6', // teal
  Emails: '#a855f7', // violet
}

function ChannelDistributionChartInner({ data }: ChannelDistributionChartProps) {
  const chartData = useMemo(() => {
    if (!data) return []
    return [
      {
        name: 'Appels',
        value: data.calls.cost,
        volume: data.calls.volume,
        color: channelColors.Appels,
      },
      { name: 'SMS', value: data.sms.cost, volume: data.sms.volume, color: channelColors.SMS },
      {
        name: 'Emails',
        value: data.emails.cost,
        volume: data.emails.volume,
        color: channelColors.Emails,
      },
    ].filter((item) => item.value > 0)
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
          style={{ fontSize: '11px', fontWeight: 500 }}
        >
          {`${name} : ${value.toFixed(0)}€ (${percentage}%)`}
        </text>
      )
    },
    [total],
  )

  const renderLegend = useCallback(
    (props: any) => {
      const { payload } = props
      return (
        <ul className="flex flex-col gap-2 text-sm text-white">
          {payload?.map((entry: any, index: number) => {
            const percentage = total > 0 ? ((entry.payload.value / total) * 100).toFixed(1) : 0
            return (
              <li key={`legend-${index}`} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="whitespace-nowrap">
                  {entry.value}: {entry.payload.value.toFixed(0)}€ ({percentage}%)
                </span>
              </li>
            )
          })}
        </ul>
      )
    },
    [total],
  )

  if (!data || total === 0) {
    return (
      <div className="bg-black/20 border border-white/20 rounded-xl p-3 flex flex-col h-full">
        <h3 className="text-sm font-semibold text-white mb-2 flex-shrink-0">
          Repartition par canal
        </h3>
        <div className="flex-1 flex items-center justify-center text-white/50 text-sm">
          Aucune donnee disponible
        </div>
      </div>
    )
  }

  return (
    <div className="bg-black/20 border border-white/20 rounded-xl p-3 flex flex-col h-full">
      <h3 className="text-sm font-semibold text-white mb-2 flex-shrink-0">Repartition par canal</h3>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold text-white">{total.toFixed(0)} €</p>
          <p className="text-xs text-white/50">Total</p>
        </div>
      </div>
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
            formatter={(value: number, _name: string, props: any) => {
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0
              return [
                `${value.toFixed(2)}€ (${percentage}%) - ${props?.payload?.volume || 0} unites`,
                '',
              ]
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

export const ChannelDistributionChart = memo(ChannelDistributionChartInner)
