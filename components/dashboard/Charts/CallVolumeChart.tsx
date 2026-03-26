'use client'

import { memo, useMemo } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface CallVolumeChartProps {
  data: Array<{
    date: string
    total_calls: number
    answered_calls: number
    conversions: number
  }>
}

function CallVolumeChartInner({ data }: CallVolumeChartProps) {
  const chartData = useMemo(
    () =>
      data.map((item) => ({
        date: new Date(item.date).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: 'short',
        }),
        'Total appels': item.total_calls,
        'Appels répondus': item.answered_calls,
        Conversions: item.conversions,
      })),
    [data],
  )

  return (
    <div className="bg-black/20 border border-white/20 rounded-xl p-3 flex flex-col h-full">
      <h3 className="text-sm font-semibold text-white mb-2 flex-shrink-0">
        Volume d&apos;appels par jour
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorAnswered" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#84cc16" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#84cc16" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorRDV" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#d946ef" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#d946ef" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="date" stroke="rgba(255,255,255,0.6)" style={{ fontSize: '12px' }} />
          <YAxis stroke="rgba(255,255,255,0.6)" style={{ fontSize: '12px' }} />
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
          />
          <Legend wrapperStyle={{ color: '#fff' }} />
          <Area
            type="monotone"
            dataKey="Total appels"
            stroke="#06b6d4"
            strokeWidth={2}
            fill="url(#colorTotal)"
          />
          <Area
            type="monotone"
            dataKey="Appels répondus"
            stroke="#84cc16"
            strokeWidth={2}
            fill="url(#colorAnswered)"
          />
          <Area
            type="monotone"
            dataKey="Conversions"
            stroke="#d946ef"
            strokeWidth={2}
            fill="url(#colorRDV)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

/**
 * Memoized CallVolumeChart to prevent unnecessary re-renders
 * Only re-renders when data prop changes
 */
export const CallVolumeChart = memo(CallVolumeChartInner)
