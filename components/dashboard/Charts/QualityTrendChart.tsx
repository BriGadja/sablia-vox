'use client'

import { Minus, TrendingDown, TrendingUp } from 'lucide-react'
import { memo, useMemo } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { CHART_AXIS_STROKE_SUBTLE } from '@/lib/chart-config'
import type { QualitySnapshot } from '@/lib/queries/agent-insights'
import { cn } from '@/lib/utils'

interface QualityTrendChartProps {
  data: QualitySnapshot[]
}

function QualityTrendChartInner({ data }: QualityTrendChartProps) {
  const chartData = useMemo(
    () =>
      data.map((item) => ({
        date: new Date(item.snapshot_date).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
        }),
        score: Number(item.avg_quality_score),
        calls: item.call_count,
      })),
    [data],
  )

  // Trend indicator: compare last 7 days avg to previous 7 days avg
  const trend = useMemo(() => {
    if (data.length < 7) return null
    const recent = data.slice(-7)
    const previous = data.slice(-14, -7)
    if (previous.length === 0) return null

    const recentAvg = recent.reduce((s, d) => s + Number(d.avg_quality_score), 0) / recent.length
    const previousAvg =
      previous.reduce((s, d) => s + Number(d.avg_quality_score), 0) / previous.length
    const diff = recentAvg - previousAvg

    if (Math.abs(diff) < 0.1) return { direction: 'stable' as const, diff }
    return { direction: diff > 0 ? ('up' as const) : ('down' as const), diff }
  }, [data])

  if (data.length === 0) {
    return (
      <div className="bg-black/20 border border-white/20 rounded-xl p-3 flex flex-col h-full items-center justify-center">
        <p className="text-white/40 text-sm">Aucune donnée de qualité disponible</p>
      </div>
    )
  }

  return (
    <div className="bg-black/20 border border-white/20 rounded-xl p-3 flex flex-col h-full">
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <h3 className="text-sm font-semibold text-white">Tendance qualité (30j)</h3>
        {trend && (
          <div
            className={cn(
              'flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md',
              trend.direction === 'up' && 'bg-green-500/15 text-green-400',
              trend.direction === 'down' && 'bg-red-500/15 text-red-400',
              trend.direction === 'stable' && 'bg-white/5 text-white/50',
            )}
          >
            {trend.direction === 'up' && <TrendingUp className="w-3 h-3" />}
            {trend.direction === 'down' && <TrendingDown className="w-3 h-3" />}
            {trend.direction === 'stable' && <Minus className="w-3 h-3" />}
            {trend.diff > 0 ? '+' : ''}
            {trend.diff.toFixed(2)}
          </div>
        )}
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <defs>
            <linearGradient id="qualityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.2} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="date"
            stroke={CHART_AXIS_STROKE_SUBTLE}
            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
            tickLine={false}
          />
          <YAxis
            domain={[1, 5]}
            stroke={CHART_AXIS_STROKE_SUBTLE}
            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
            tickLine={false}
            ticks={[1, 2, 3, 4, 5]}
          />
          <ReferenceLine y={3} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0,0,0,0.85)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '12px',
            }}
            formatter={(value: number, name: string) => {
              if (name === 'score') return [`${value.toFixed(2)} / 5`, 'Score qualité']
              if (name === 'calls') return [value, 'Appels']
              return [value, name]
            }}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#8B5CF6"
            strokeWidth={2}
            dot={{ r: 3, fill: '#8B5CF6', strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#8B5CF6' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export const QualityTrendChart = memo(QualityTrendChartInner)
