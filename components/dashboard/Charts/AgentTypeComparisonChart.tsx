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
import type { AgentTypePerformance } from '@/lib/types/dashboard'

interface AgentTypeComparisonChartProps {
  data: AgentTypePerformance[]
  isLoading?: boolean
}

// Agent type colors matching the brand
const agentTypeColors: Record<string, string> = {
  louis: '#3b82f6', // blue
  arthur: '#f97316', // orange
  alexandra: '#10b981', // green/emerald
}

// Display names
const agentTypeLabels: Record<string, string> = {
  louis: 'Louis',
  arthur: 'Arthur',
  alexandra: 'Alexandra',
}

function AgentTypeComparisonChartInner({ data, isLoading }: AgentTypeComparisonChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []

    return data.map((item) => ({
      name: agentTypeLabels[item.agent_type] || item.display_name,
      type: item.agent_type,
      total_calls: item.total_calls,
      answer_rate: item.answer_rate,
      conversion_rate: item.conversion_rate,
      deployments: item.total_deployments,
      color: agentTypeColors[item.agent_type] || '#6366f1',
    }))
  }, [data])

  if (isLoading) {
    return (
      <div className="bg-black/20 border border-white/20 rounded-xl p-3 flex flex-col h-full">
        <h3 className="text-sm font-semibold text-white mb-2 flex-shrink-0">
          Performance par type d&apos;agent
        </h3>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center space-y-2">
            <div className="h-4 bg-white/10 rounded w-24" />
            <div className="h-20 bg-white/10 rounded w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (chartData.length === 0) {
    return (
      <div className="bg-black/20 border border-white/20 rounded-xl p-3 flex flex-col h-full">
        <h3 className="text-sm font-semibold text-white mb-2 flex-shrink-0">
          Performance par type d&apos;agent
        </h3>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-white/40 text-sm">Aucune donnée disponible</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-black/20 border border-white/20 rounded-xl p-3 flex flex-col h-full">
      <h3 className="text-sm font-semibold text-white mb-2 flex-shrink-0">
        Performance par type d&apos;agent
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
          barCategoryGap="20%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 10 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
            tickLine={false}
            tickFormatter={(value) => `${value}%`}
            domain={[0, 100]}
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
            itemStyle={{ color: '#fff' }}
            formatter={(value: number, name: string) => {
              if (name === 'conversion_rate') return [`${value.toFixed(1)}%`, 'Taux conversion']
              if (name === 'answer_rate') return [`${value.toFixed(1)}%`, 'Taux décroché']
              return [value, name]
            }}
            labelFormatter={(label) => {
              const item = chartData.find((d) => d.name === label)
              return `${label} (${item?.total_calls || 0} appels, ${item?.deployments || 0} agents)`
            }}
          />
          <Bar dataKey="conversion_rate" name="conversion_rate" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {/* Legend */}
      <div className="flex justify-center gap-4 mt-1 flex-shrink-0">
        {chartData.map((item) => (
          <div key={item.type} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
            <span className="text-xs text-white/70">
              {item.name} ({item.total_calls})
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Memoized AgentTypeComparisonChart to prevent unnecessary re-renders
 * Only re-renders when data prop changes
 */
export const AgentTypeComparisonChart = memo(AgentTypeComparisonChartInner)
