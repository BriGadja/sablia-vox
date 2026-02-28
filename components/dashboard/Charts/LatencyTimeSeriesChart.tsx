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
import { groupMetricsByDate } from '@/lib/hooks/useLatencyData'
import type { LatencyMetric } from '@/lib/types/latency'

interface LatencyTimeSeriesChartProps {
  data: LatencyMetric[]
  isLoading?: boolean
}

function LatencyTimeSeriesChartInner({ data, isLoading }: LatencyTimeSeriesChartProps) {
  // Group metrics by date with useMemo
  const timeSeriesData = useMemo(() => groupMetricsByDate(data), [data])

  // Calculate STT latency: Total - LLM (TTS data not available) with useMemo
  const chartData = useMemo(
    () =>
      timeSeriesData.map((item) => {
        const llm = Math.round(item.avgLlmLatency)
        const total = Math.round(item.avgTotalLatency)
        const stt = Math.max(0, total - llm) // Ensure non-negative

        return {
          date: new Date(item.date).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
          }),
          STT: stt,
          LLM: llm,
        }
      }),
    [timeSeriesData],
  )

  if (isLoading) {
    return (
      <div className="bg-black/20 border border-white/20 rounded-xl p-3 h-full flex items-center justify-center">
        <p className="text-white/60 text-sm">Chargement des données de latence...</p>
      </div>
    )
  }

  if (chartData.length === 0) {
    return (
      <div className="bg-black/20 border border-white/20 rounded-xl p-3 h-full flex items-center justify-center">
        <p className="text-white/60 text-sm">Aucune donnée de latence disponible</p>
      </div>
    )
  }

  return (
    <div className="bg-black/20 border border-white/20 rounded-xl p-3 flex flex-col h-full">
      <h3 className="text-sm font-semibold text-white mb-2 flex-shrink-0">
        Latence par infrastructure (ms)
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          stackOffset="none"
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
        >
          <defs>
            {/* Gradient for STT (Speech-to-Text) - violet */}
            <linearGradient id="colorSTT" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.3} />
            </linearGradient>
            {/* Gradient for LLM - blue */}
            <linearGradient id="colorLLM" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.3} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="date" stroke="rgba(255,255,255,0.6)" style={{ fontSize: '11px' }} />
          <YAxis
            stroke="rgba(255,255,255,0.6)"
            style={{ fontSize: '11px' }}
            label={{
              value: 'Latence (ms)',
              angle: -90,
              position: 'insideLeft',
              fill: 'rgba(255,255,255,0.6)',
              style: { fontSize: '11px' },
            }}
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
              marginBottom: '6px',
            }}
            itemStyle={{
              color: '#fff',
              fontSize: '12px',
            }}
          />
          <Legend
            wrapperStyle={{
              color: '#fff',
              fontSize: '11px',
              paddingTop: '8px',
            }}
            iconType="square"
          />

          {/* Stacked Areas - Order matters! Bottom to top */}
          <Area
            type="monotone"
            dataKey="STT"
            stackId="1"
            stroke="#8b5cf6"
            strokeWidth={2}
            fill="url(#colorSTT)"
            name="STT (Speech-to-Text)"
          />
          <Area
            type="monotone"
            dataKey="LLM"
            stackId="1"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#colorLLM)"
            name="LLM (Modèle d'IA)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

/**
 * Memoized LatencyTimeSeriesChart to prevent unnecessary re-renders
 * Only re-renders when data or isLoading props change
 */
export const LatencyTimeSeriesChart = memo(LatencyTimeSeriesChartInner)
