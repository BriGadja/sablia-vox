'use client'

import { memo, useMemo } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  calculateLatencyKPIs,
  groupMetricsByDate,
  groupMetricsByDeployment,
} from '@/lib/hooks/useLatencyData'
import type { LatencyMetric } from '@/lib/types/latency'

interface LatencyChartProps {
  data: LatencyMetric[]
  isLoading?: boolean
  height?: number
}

/**
 * LatencyChart Component
 *
 * Displays latency metrics in multiple visualizations:
 * 1. KPI Cards - Average, min, max latencies
 * 2. Time Series Chart - Evolution of latencies over time
 * 3. Deployment Comparison Chart - Latencies by agent deployment
 *
 * Uses data from get_latency_metrics() RPC function
 */
function LatencyChartInner({ data, isLoading = false, height = 350 }: LatencyChartProps) {
  // Calculate KPIs with useMemo
  const kpis = useMemo(() => calculateLatencyKPIs(data), [data])

  // Prepare chart data with useMemo
  const timeSeriesData = useMemo(() => groupMetricsByDate(data), [data])
  const deploymentData = useMemo(() => groupMetricsByDeployment(data), [data])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-xl bg-white/5 border border-white/10 animate-pulse"
            />
          ))}
        </div>
        <div className="h-80 rounded-xl bg-white/5 border border-white/10 animate-pulse" />
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-white/60 bg-white/5 border border-white/10 rounded-xl">
        <p className="text-lg mb-2">📊 Aucune donnée de latence disponible</p>
        <p className="text-sm">
          Les données de latence sont disponibles uniquement pour les appels récents (depuis
          novembre 2025).
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Average LLM Latency */}
        <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🧠</span>
            <h4 className="text-sm font-medium text-white/70">Latence LLM Moyenne</h4>
          </div>
          <p className="text-3xl font-bold text-white">{kpis.avgLlmLatency}ms</p>
          <p className="text-xs text-white/50 mt-1">
            Min: {kpis.minLlmLatency}ms | Max: {kpis.maxLlmLatency}ms
          </p>
        </div>

        {/* Average TTS Latency */}
        <div className="p-4 bg-gradient-to-br from-teal-500/10 to-teal-600/5 border border-teal-500/20 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🎙️</span>
            <h4 className="text-sm font-medium text-white/70">Latence TTS Moyenne</h4>
          </div>
          <p className="text-3xl font-bold text-white">{kpis.avgTtsLatency}ms</p>
          <p className="text-xs text-white/50 mt-1">
            Min: {kpis.minTtsLatency}ms | Max: {kpis.maxTtsLatency}ms
          </p>
        </div>

        {/* Average Total Latency */}
        <div className="p-4 bg-gradient-to-br from-violet-500/10 to-violet-600/5 border border-violet-500/20 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">⚡</span>
            <h4 className="text-sm font-medium text-white/70">Latence Totale Moyenne</h4>
          </div>
          <p className="text-3xl font-bold text-white">{kpis.avgTotalLatency}ms</p>
          <p className="text-xs text-white/50 mt-1">Temps de réponse total</p>
        </div>

        {/* Total Calls with Latency Data */}
        <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">📞</span>
            <h4 className="text-sm font-medium text-white/70">Appels Analysés</h4>
          </div>
          <p className="text-3xl font-bold text-white">{kpis.totalCalls.toLocaleString()}</p>
          <p className="text-xs text-white/50 mt-1">Avec données de latence</p>
        </div>
      </div>

      {/* Time Series Chart */}
      <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span>📈</span>
          Évolution des Latences dans le Temps
        </h3>
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={timeSeriesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorLlm" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorTts" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis
              dataKey="date"
              stroke="#9ca3af"
              fontSize={12}
              tickFormatter={(value) => {
                const date = new Date(value)
                return `${date.getDate()}/${date.getMonth() + 1}`
              }}
            />
            <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(value) => `${value}ms`} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#fff',
              }}
              labelFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              }}
              formatter={(value: number) => [`${Math.round(value)}ms`, '']}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
            <Area
              type="monotone"
              dataKey="avgLlmLatency"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#colorLlm)"
              name="Latence LLM"
            />
            <Area
              type="monotone"
              dataKey="avgTtsLatency"
              stroke="#14b8a6"
              strokeWidth={2}
              fill="url(#colorTts)"
              name="Latence TTS"
            />
            <Area
              type="monotone"
              dataKey="avgTotalLatency"
              stroke="#a78bfa"
              strokeWidth={2}
              fill="url(#colorTotal)"
              name="Latence Totale"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Deployment Comparison Chart */}
      {deploymentData.length > 1 && (
        <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>📊</span>
            Comparaison par Agent
          </h3>
          <ResponsiveContainer width="100%" height={Math.max(250, deploymentData.length * 50)}>
            <BarChart
              data={deploymentData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis
                type="number"
                stroke="#9ca3af"
                fontSize={12}
                tickFormatter={(value) => `${value}ms`}
              />
              <YAxis
                type="category"
                dataKey="deploymentName"
                stroke="#9ca3af"
                fontSize={12}
                width={90}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff',
                }}
                formatter={(value: number, name: string) => {
                  const label = name === 'avgLlmLatency' ? 'LLM' : 'TTS'
                  return [`${Math.round(value)}ms`, label]
                }}
                labelFormatter={(label) => `Agent: ${label}`}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} iconType="circle" />
              <Bar
                dataKey="avgLlmLatency"
                fill="#3b82f6"
                radius={[0, 4, 4, 0]}
                name="Latence LLM"
              />
              <Bar
                dataKey="avgTtsLatency"
                fill="#14b8a6"
                radius={[0, 4, 4, 0]}
                name="Latence TTS"
              />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-white/50 mt-4 text-center">
            Tri par nombre d&#39;appels décroissant
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * Memoized LatencyChart to prevent unnecessary re-renders
 * Only re-renders when data, isLoading, or height props change
 */
export const LatencyChart = memo(LatencyChartInner)
