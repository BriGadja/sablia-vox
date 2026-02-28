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
import type { DurationByOutcomeData } from '@/lib/types/dashboard'

interface DurationByOutcomeChartProps {
  data: DurationByOutcomeData[] | undefined
}

function DurationByOutcomeChartInner({ data }: DurationByOutcomeChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []
    return data
      .filter((item) => item.avg_duration > 0)
      .map((item) => ({
        name: item.outcome.length > 18 ? item.outcome.substring(0, 18) + '...' : item.outcome,
        fullName: item.outcome,
        duration: item.avg_duration,
        count: item.count,
        color: item.color || '#6366f1',
      }))
  }, [data])

  if (!data || data.length === 0 || chartData.length === 0) {
    return (
      <div className="bg-black/20 border border-white/20 rounded-xl p-3 flex flex-col h-full">
        <h3 className="text-sm font-semibold text-white mb-2 flex-shrink-0">
          Duree moyenne par resultat
        </h3>
        <div className="flex-1 flex items-center justify-center text-white/50 text-sm">
          Aucune donnee disponible
        </div>
      </div>
    )
  }

  // Format duration in mm:ss
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.round(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-black/20 border border-white/20 rounded-xl p-3 flex flex-col h-full">
      <h3 className="text-sm font-semibold text-white mb-2 flex-shrink-0">
        Duree moyenne par resultat
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
          <XAxis
            type="number"
            stroke="rgba(255,255,255,0.6)"
            style={{ fontSize: '11px' }}
            tickFormatter={(value) => formatDuration(value)}
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
              return [
                <span key="details">
                  {formatDuration(value)}
                  <br />
                  <span className="text-xs text-white/60">{props?.payload?.count || 0} appels</span>
                </span>,
                props?.payload?.fullName || '',
              ]
            }}
          />
          <Bar dataKey="duration" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export const DurationByOutcomeChart = memo(DurationByOutcomeChartInner)
