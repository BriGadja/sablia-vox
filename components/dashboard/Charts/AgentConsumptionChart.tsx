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
import type { AgentConsumptionSummary } from '@/lib/types/consumption'

interface AgentConsumptionChartProps {
  data: AgentConsumptionSummary[] | undefined
}

// Couleurs par type d'agent
const agentTypeColors: Record<string, string> = {
  louis: '#3b82f6', // blue
  arthur: '#f97316', // orange
  alexandra: '#22c55e', // green
  default: '#6366f1', // indigo
}

function AgentConsumptionChartInner({ data }: AgentConsumptionChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []
    return data
      .slice(0, 10) // Top 10
      .map((item) => ({
        name:
          item.deployment_name.length > 20
            ? item.deployment_name.substring(0, 20) + '...'
            : item.deployment_name,
        fullName: item.deployment_name,
        cost: item.total_cost,
        minutes: item.total_minutes,
        sms: item.total_sms,
        emails: item.total_emails,
        color: agentTypeColors[item.agent_type] || agentTypeColors.default,
      }))
  }, [data])

  if (!data || data.length === 0) {
    return (
      <div className="bg-black/20 border border-white/20 rounded-xl p-3 flex flex-col h-full">
        <h3 className="text-sm font-semibold text-white mb-2 flex-shrink-0">
          Consommation par agent
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
        Consommation par agent
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
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `${value.toFixed(0)}€`}
          />
          <YAxis
            type="category"
            dataKey="name"
            stroke="rgba(255,255,255,0.6)"
            style={{ fontSize: '11px' }}
            width={120}
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
                  {value.toFixed(2)}€
                  <br />
                  <span className="text-xs text-white/60">
                    {props?.payload?.minutes?.toFixed(1) || 0} min | {props?.payload?.sms || 0} SMS
                    | {props?.payload?.emails || 0} emails
                  </span>
                </span>,
                props?.payload?.fullName || '',
              ]
            }}
          />
          <Bar dataKey="cost" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export const AgentConsumptionChart = memo(AgentConsumptionChartInner)
