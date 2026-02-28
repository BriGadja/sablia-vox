'use client'

import { memo, useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { OwnerPerformanceData } from '@/lib/types/dashboard'

interface OwnerPerformanceChartProps {
  data: OwnerPerformanceData[] | undefined
}

// Gradient colors for bars
const colors = [
  '#10b981', // emerald
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#f59e0b', // amber
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f97316', // orange
  '#6366f1', // indigo
  '#14b8a6', // teal
]

function OwnerPerformanceChartInner({ data }: OwnerPerformanceChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []
    return data
      .filter((item) => item.rdv_count > 0) // Only show owners with RDVs
      .slice(0, 10) // Top 10
      .map((item, index) => ({
        name: item.owner.length > 18 ? item.owner.substring(0, 18) + '...' : item.owner,
        fullName: item.owner,
        rdv_count: item.rdv_count,
        total_calls: item.total_calls,
        conversion_rate: item.conversion_rate,
        color: colors[index % colors.length],
      }))
  }, [data])

  const totalRdv = useMemo(
    () => chartData.reduce((sum, item) => sum + item.rdv_count, 0),
    [chartData],
  )

  if (!data || data.length === 0 || totalRdv === 0) {
    return (
      <div className="bg-black/20 border border-white/20 rounded-xl p-3 flex flex-col h-full">
        <h3 className="text-sm font-semibold text-white mb-2 flex-shrink-0">
          RDV par Agent Immobilier
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
        RDV par Agent Immobilier
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
          <XAxis
            type="number"
            stroke="rgba(255,255,255,0.6)"
            style={{ fontSize: '11px' }}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            stroke="rgba(255,255,255,0.6)"
            style={{ fontSize: '10px' }}
            width={100}
            tick={{ fill: 'rgba(255,255,255,0.8)' }}
          />
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
              const convRate = props?.payload?.conversion_rate?.toFixed(1) || 0
              const totalCalls = props?.payload?.total_calls || 0
              return [
                <span key="details">
                  <span className="font-bold text-emerald-400">{value} RDV</span>
                  <br />
                  <span className="text-xs text-white/60">
                    {totalCalls} appels | {convRate}% conversion
                  </span>
                </span>,
                props?.payload?.fullName || '',
              ]
            }}
          />
          <Bar dataKey="rdv_count" radius={[0, 4, 4, 0]} name="RDV">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export const OwnerPerformanceChart = memo(OwnerPerformanceChartInner)
