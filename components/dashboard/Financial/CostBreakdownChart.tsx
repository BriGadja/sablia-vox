'use client'

import { motion } from 'motion/react'
import { memo, useMemo } from 'react'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { formatCurrency, formatPercentage } from '@/lib/queries/financial'
import type { CostBreakdownChartDataPoint, CostBreakdownResponse } from '@/lib/types/financial'

interface CostBreakdownChartProps {
  data: CostBreakdownResponse | undefined
  isLoading?: boolean
  height?: number
}

// Technology colors matching the theme
const TECH_COLORS = {
  stt: '#06b6d4', // cyan
  tts: '#8b5cf6', // violet
  llm: '#f59e0b', // amber
  telecom: '#10b981', // emerald
  dipler_commission: '#ec4899', // pink
  sms: '#3b82f6', // blue
  email: '#6366f1', // indigo
}

// Technology labels
const TECH_LABELS = {
  stt: 'STT (Speech-to-Text)',
  tts: 'TTS (Text-to-Speech)',
  llm: 'LLM (IA Conversationnelle)',
  telecom: 'Telecom (Twilio/SIP)',
  dipler_commission: 'Commission Dipler',
  sms: 'SMS',
  email: 'Email',
}

// Custom tooltip component
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || payload.length === 0) return null

  const data = payload[0].payload as CostBreakdownChartDataPoint

  return (
    <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg p-4 shadow-xl">
      <p className="text-sm font-semibold text-white mb-2">{data.name}</p>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-4 text-xs">
          <span className="text-gray-400">Coût:</span>
          <span className="font-semibold text-white">{formatCurrency(data.value)}</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-xs">
          <span className="text-gray-400">Pourcentage:</span>
          <span className="font-semibold text-white">{formatPercentage(data.percentage)}</span>
        </div>
      </div>
    </div>
  )
}

// Custom label component
function renderCustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percentage }: any) {
  if (percentage < 5) return null // Don't show label for small slices

  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-xs font-semibold"
    >
      {`${percentage.toFixed(0)}%`}
    </text>
  )
}

function CostBreakdownChartInner({ data, isLoading, height = 400 }: CostBreakdownChartProps) {
  // Transform data for chart
  const chartData = useMemo(() => {
    if (!data) return []

    const items: CostBreakdownChartDataPoint[] = []
    const totalCost = data.total_costs.all_channels

    if (totalCost === 0) return []

    // Add call costs breakdown
    if (data.call_costs.stt > 0) {
      items.push({
        name: TECH_LABELS.stt,
        value: data.call_costs.stt,
        percentage: (data.call_costs.stt / totalCost) * 100,
        color: TECH_COLORS.stt,
      })
    }
    if (data.call_costs.tts > 0) {
      items.push({
        name: TECH_LABELS.tts,
        value: data.call_costs.tts,
        percentage: (data.call_costs.tts / totalCost) * 100,
        color: TECH_COLORS.tts,
      })
    }
    if (data.call_costs.llm > 0) {
      items.push({
        name: TECH_LABELS.llm,
        value: data.call_costs.llm,
        percentage: (data.call_costs.llm / totalCost) * 100,
        color: TECH_COLORS.llm,
      })
    }
    if (data.call_costs.telecom > 0) {
      items.push({
        name: TECH_LABELS.telecom,
        value: data.call_costs.telecom,
        percentage: (data.call_costs.telecom / totalCost) * 100,
        color: TECH_COLORS.telecom,
      })
    }
    if (data.call_costs.dipler_commission > 0) {
      items.push({
        name: TECH_LABELS.dipler_commission,
        value: data.call_costs.dipler_commission,
        percentage: (data.call_costs.dipler_commission / totalCost) * 100,
        color: TECH_COLORS.dipler_commission,
      })
    }

    // Add SMS costs if present
    if (data.sms_costs.total > 0) {
      items.push({
        name: TECH_LABELS.sms,
        value: data.sms_costs.total,
        percentage: (data.sms_costs.total / totalCost) * 100,
        color: TECH_COLORS.sms,
      })
    }

    // Add Email costs if present
    if (data.email_costs.total > 0) {
      items.push({
        name: TECH_LABELS.email,
        value: data.email_costs.total,
        percentage: (data.email_costs.total / totalCost) * 100,
        color: TECH_COLORS.email,
      })
    }

    return items.sort((a, b) => b.value - a.value)
  }, [data])

  // Loading state
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-gray-800/50 bg-black/20 backdrop-blur-sm overflow-hidden"
        style={{ height }}
      >
        <div className="p-6 h-full flex flex-col">
          <div className="h-8 w-64 bg-gray-800/50 rounded animate-pulse mb-4" />
          <div className="flex-1 bg-gray-800/30 rounded animate-pulse" />
        </div>
      </motion.div>
    )
  }

  // Empty state
  if (!data || chartData.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-gray-800/50 bg-black/20 backdrop-blur-sm overflow-hidden flex flex-col items-center justify-center"
        style={{ height }}
      >
        <p className="text-gray-400 mb-2">Aucune donnée de coûts détaillés disponible</p>
        <p className="text-gray-500 text-sm">
          Les coûts détaillés par technologie ne sont pas encore renseignés
        </p>
      </motion.div>
    )
  }

  // Determine if compact mode based on height
  const isCompact = height < 350

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-gray-800/50 bg-black/20 backdrop-blur-sm overflow-hidden"
      style={{ height }}
    >
      <div className={isCompact ? 'p-3' : 'p-6'}>
        <div className={`flex items-center justify-between ${isCompact ? 'mb-2' : 'mb-6'}`}>
          <div>
            <h3 className={`font-bold text-white ${isCompact ? 'text-sm' : 'text-xl'}`}>
              Couts par Technologie
            </h3>
            {!isCompact && (
              <p className="text-sm text-gray-400 mt-1">
                Detail des couts provider par composant technique
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Total</p>
            <p className={`font-bold text-white ${isCompact ? 'text-lg' : 'text-2xl'}`}>
              {formatCurrency(data.total_costs.all_channels)}
            </p>
          </div>
        </div>

        {/* Chart and Details Side by Side in Compact Mode */}
        {isCompact ? (
          <div className="flex gap-3" style={{ height: height - 80 }}>
            {/* Pie Chart - Left Side */}
            <div className="flex-shrink-0" style={{ width: '45%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={70}
                    innerRadius={35}
                    fill="#8884d8"
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={800}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend/Details - Right Side */}
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-1">
                {chartData.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-xs hover:bg-gray-800/30 px-1 py-0.5 rounded transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-gray-300 truncate text-[11px]">
                        {item.name.split(' ')[0]}
                      </span>
                    </div>
                    <span className="font-medium text-white text-[11px]">
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                ))}
              </div>
              {/* Volume Stats */}
              <div className="mt-2 pt-2 border-t border-gray-800/30 grid grid-cols-3 gap-1 text-center">
                <div>
                  <p className="text-[10px] text-gray-500">Appels</p>
                  <p className="text-xs font-semibold text-white">{data.volume.calls}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500">SMS</p>
                  <p className="text-xs font-semibold text-white">{data.volume.sms}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500">Emails</p>
                  <p className="text-xs font-semibold text-white">{data.volume.emails}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Chart */}
            <ResponsiveContainer width="100%" height={height - 120}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={120}
                  innerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => <span className="text-sm text-gray-300">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Cost Details Table */}
            <div className="mt-6 pt-6 border-t border-gray-800/50">
              <h4 className="text-sm font-semibold text-white mb-3">Detail par Technologie</h4>
              <div className="space-y-2">
                {chartData.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm hover:bg-gray-800/30 p-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-gray-300">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-400">{formatPercentage(item.percentage)}</span>
                      <span className="font-semibold text-white w-24 text-right">
                        {formatCurrency(item.value)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Stats */}
            <div className="mt-6 pt-6 border-t border-gray-800/50 grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Appels</p>
                <p className="text-sm font-semibold text-white">
                  {data.volume.calls.toLocaleString('fr-FR')}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">SMS</p>
                <p className="text-sm font-semibold text-white">
                  {data.volume.sms.toLocaleString('fr-FR')}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Emails</p>
                <p className="text-sm font-semibold text-white">
                  {data.volume.emails.toLocaleString('fr-FR')}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  )
}

/**
 * Memoized CostBreakdownChart to prevent unnecessary re-renders
 * Only re-renders when data, isLoading, or height props change
 */
export const CostBreakdownChart = memo(CostBreakdownChartInner)
