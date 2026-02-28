'use client'

import { memo, useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { ClientConsumptionSummary } from '@/lib/types/consumption'

interface ClientConsumptionChartProps {
  data: ClientConsumptionSummary[] | undefined
}

function ClientConsumptionChartInner({ data }: ClientConsumptionChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []
    return data
      .slice(0, 10) // Top 10
      .map((item) => ({
        name:
          item.client_name.length > 20
            ? item.client_name.substring(0, 20) + '...'
            : item.client_name,
        fullName: item.client_name,
        cost: item.total_cost,
      }))
  }, [data])

  if (!data || data.length === 0) {
    return (
      <div className="bg-black/20 border border-white/20 rounded-xl p-3 flex flex-col h-full">
        <h3 className="text-sm font-semibold text-white mb-2 flex-shrink-0">
          Consommation par client
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
        Consommation par client
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
              return [`${value.toFixed(2)} €`, props?.payload?.fullName || '']
            }}
          />
          <Bar dataKey="cost" fill="#14b8a6" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export const ClientConsumptionChart = memo(ClientConsumptionChartInner)
