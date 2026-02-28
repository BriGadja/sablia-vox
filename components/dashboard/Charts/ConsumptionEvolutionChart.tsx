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
import type { DailyConsumption } from '@/lib/types/consumption'

interface ConsumptionEvolutionChartProps {
  data: DailyConsumption[] | undefined
}

function ConsumptionEvolutionChartInner({ data }: ConsumptionEvolutionChartProps) {
  const chartData = useMemo(
    () =>
      (data || []).map((item) => ({
        date: new Date(item.date).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: 'short',
        }),
        Appels: item.call_cost,
        SMS: item.sms_cost,
        Emails: item.email_cost,
      })),
    [data],
  )

  if (!data || data.length === 0) {
    return (
      <div className="bg-black/20 border border-white/20 rounded-xl p-3 flex flex-col h-full">
        <h3 className="text-sm font-semibold text-white mb-2 flex-shrink-0">
          Evolution de la consommation
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
        Evolution de la consommation
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorSMS" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorEmails" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#a855f7" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="date" stroke="rgba(255,255,255,0.6)" style={{ fontSize: '12px' }} />
          <YAxis
            stroke="rgba(255,255,255,0.6)"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `${value.toFixed(0)}€`}
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
            formatter={(value: number) => [`${value.toFixed(2)} €`, '']}
          />
          <Legend wrapperStyle={{ color: '#fff' }} />
          <Area
            type="monotone"
            dataKey="Appels"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#colorCalls)"
            stackId="1"
          />
          <Area
            type="monotone"
            dataKey="SMS"
            stroke="#14b8a6"
            strokeWidth={2}
            fill="url(#colorSMS)"
            stackId="1"
          />
          <Area
            type="monotone"
            dataKey="Emails"
            stroke="#a855f7"
            strokeWidth={2}
            fill="url(#colorEmails)"
            stackId="1"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export const ConsumptionEvolutionChart = memo(ConsumptionEvolutionChartInner)
