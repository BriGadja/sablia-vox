'use client'

import { memo, useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { MonthlyConsumptionHistory } from '@/lib/types/consumption'

interface MonthlyComparisonChartProps {
  data: MonthlyConsumptionHistory[] | undefined
}

function MonthlyComparisonChartInner({ data }: MonthlyComparisonChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []
    // Sort by month ascending (oldest first)
    return [...data]
      .sort((a, b) => a.month.localeCompare(b.month))
      .map((item) => ({
        month: item.month_label,
        fullMonth: item.month,
        cost: item.total_cost,
        calls: item.total_calls,
        minutes: item.total_minutes,
        sms: item.total_sms,
        emails: item.total_emails,
      }))
  }, [data])

  if (!data || data.length === 0) {
    return (
      <div className="bg-black/20 border border-white/20 rounded-xl p-3 flex flex-col h-full">
        <h3 className="text-sm font-semibold text-white mb-2 flex-shrink-0">Historique mensuel</h3>
        <div className="flex-1 flex items-center justify-center text-white/50 text-sm">
          Aucune donnee disponible
        </div>
      </div>
    )
  }

  return (
    <div className="bg-black/20 border border-white/20 rounded-xl p-3 flex flex-col h-full">
      <h3 className="text-sm font-semibold text-white mb-2 flex-shrink-0">Historique mensuel</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis
            dataKey="month"
            stroke="rgba(255,255,255,0.6)"
            style={{ fontSize: '11px' }}
            tick={{ fill: 'rgba(255,255,255,0.8)' }}
          />
          <YAxis
            stroke="rgba(255,255,255,0.6)"
            style={{ fontSize: '11px' }}
            tickFormatter={(value) => `${value.toFixed(0)}€`}
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
              const payload = props?.payload
              return [
                `${value.toFixed(2)} €`,
                <span key="details" className="text-xs text-white/60">
                  {payload?.calls} appels | {payload?.minutes?.toFixed(0)}min | {payload?.sms} SMS |{' '}
                  {payload?.emails} emails
                </span>,
              ]
            }}
            labelFormatter={(label) => `Mois: ${label}`}
          />
          <Bar dataKey="cost" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Consommation" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export const MonthlyComparisonChart = memo(MonthlyComparisonChartInner)
