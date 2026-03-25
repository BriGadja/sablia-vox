'use client'

import { motion } from 'motion/react'
import { memo, useCallback, useMemo, useState } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatCurrency } from '@/lib/queries/financial'
import type { TimeSeriesDataPoint } from '@/lib/types/financial'

interface FinancialTimeSeriesChartProps {
  data: TimeSeriesDataPoint[]
  isLoading?: boolean
  height?: number
  showRevenue?: boolean
  showCost?: boolean
  showMargin?: boolean
}

// Custom tooltip component
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null

  return (
    <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg p-4 shadow-xl">
      <p className="text-sm font-semibold text-white mb-2">
        {new Date(label).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })}
      </p>
      <div className="space-y-1">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-400">{entry.name}:</span>
            <span className="font-semibold text-white">
              {formatCurrency(entry.value as number)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function FinancialTimeSeriesChartInner({
  data,
  isLoading,
  height = 400,
  showRevenue = true,
  showCost = true,
  showMargin = true,
}: FinancialTimeSeriesChartProps) {
  const [hiddenLines, setHiddenLines] = useState<Set<string>>(new Set())

  // Transform data for Recharts with useMemo
  const chartData = useMemo(
    () =>
      data.map((point) => ({
        date: point.date,
        revenue: point.revenue.total,
        cost: point.cost.total,
        margin: point.margin.total,
      })),
    [data],
  )

  // Toggle line visibility with useCallback - must be before any early returns
  const handleLegendClick = useCallback((dataKey: string) => {
    setHiddenLines((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(dataKey)) {
        newSet.delete(dataKey)
      } else {
        newSet.add(dataKey)
      }
      return newSet
    })
  }, [])

  // Loading state
  if (isLoading) {
    return (
      <div
        className="rounded-xl border border-gray-800/50 bg-black/20 backdrop-blur-sm overflow-hidden"
        style={{ height }}
      >
        <div className="p-6 h-full flex flex-col">
          <div className="h-8 w-64 bg-gray-800/50 rounded animate-pulse mb-4" />
          <div className="flex-1 bg-gray-800/30 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div
        className="rounded-xl border border-gray-800/50 bg-black/20 backdrop-blur-sm overflow-hidden flex items-center justify-center"
        style={{ height }}
      >
        <p className="text-gray-400">Aucune donnée disponible pour cette période</p>
      </div>
    )
  }

  // Determine if compact mode based on height
  const isCompact = height < 350

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-xl border border-gray-800/50 bg-black/20 backdrop-blur-sm overflow-hidden"
      style={{ height }}
    >
      <div className={isCompact ? 'p-3' : 'p-6'}>
        <div className={`flex items-center justify-between ${isCompact ? 'mb-2' : 'mb-6'}`}>
          <h3 className={`font-bold text-white ${isCompact ? 'text-sm' : 'text-xl'}`}>
            Evolution Financiere
          </h3>
          <div className={`flex items-center ${isCompact ? 'gap-2' : 'gap-4'} text-xs`}>
            {showRevenue && (
              <button
                onClick={() => handleLegendClick('revenue')}
                className="flex items-center gap-1 transition-opacity hover:opacity-100"
                style={{
                  opacity: hiddenLines.has('revenue') ? 0.4 : 1,
                }}
              >
                <div className={`rounded-full bg-amber-500 ${isCompact ? 'w-2 h-2' : 'w-3 h-3'}`} />
                <span className="text-gray-300 text-[10px]">Rev</span>
              </button>
            )}
            {showCost && (
              <button
                onClick={() => handleLegendClick('cost')}
                className="flex items-center gap-1 transition-opacity hover:opacity-100"
                style={{
                  opacity: hiddenLines.has('cost') ? 0.4 : 1,
                }}
              >
                <div className={`rounded-full bg-red-500 ${isCompact ? 'w-2 h-2' : 'w-3 h-3'}`} />
                <span className="text-gray-300 text-[10px]">Couts</span>
              </button>
            )}
            {showMargin && (
              <button
                onClick={() => handleLegendClick('margin')}
                className="flex items-center gap-1 transition-opacity hover:opacity-100"
                style={{
                  opacity: hiddenLines.has('margin') ? 0.4 : 1,
                }}
              >
                <div
                  className={`rounded-full bg-emerald-500 ${isCompact ? 'w-2 h-2' : 'w-3 h-3'}`}
                />
                <span className="text-gray-300 text-[10px]">Marge</span>
              </button>
            )}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={isCompact ? height - 50 : height}>
          <LineChart
            data={chartData}
            margin={
              isCompact
                ? { top: 5, right: 10, left: 0, bottom: 5 }
                : { top: 5, right: 30, left: 20, bottom: 5 }
            }
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis
              dataKey="date"
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF', fontSize: isCompact ? 9 : 12 }}
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: 'short',
                })
              }
              interval={isCompact ? 'preserveStartEnd' : 0}
            />
            <YAxis
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF', fontSize: isCompact ? 9 : 12 }}
              tickFormatter={(value) =>
                value >= 1000 ? `${(value / 1000).toFixed(0)}k` : `${value.toFixed(0)}`
              }
              width={isCompact ? 35 : 60}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Revenue Line */}
            {showRevenue && !hiddenLines.has('revenue') && (
              <Line
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#F59E0B"
                strokeWidth={isCompact ? 2 : 3}
                dot={isCompact ? false : { fill: '#F59E0B', r: 4 }}
                activeDot={{ r: isCompact ? 4 : 6 }}
                animationDuration={800}
              />
            )}

            {/* Cost Line */}
            {showCost && !hiddenLines.has('cost') && (
              <Line
                type="monotone"
                dataKey="cost"
                name="Couts"
                stroke="#EF4444"
                strokeWidth={isCompact ? 1.5 : 2}
                dot={isCompact ? false : { fill: '#EF4444', r: 3 }}
                activeDot={{ r: isCompact ? 3 : 5 }}
                animationDuration={800}
                strokeDasharray="5 5"
              />
            )}

            {/* Margin Line */}
            {showMargin && !hiddenLines.has('margin') && (
              <Line
                type="monotone"
                dataKey="margin"
                name="Marge"
                stroke="#10B981"
                strokeWidth={isCompact ? 2 : 3}
                dot={isCompact ? false : { fill: '#10B981', r: 4 }}
                activeDot={{ r: isCompact ? 4 : 6 }}
                animationDuration={800}
              />
            )}
          </LineChart>
        </ResponsiveContainer>

        {/* Summary Stats - Hidden in compact mode */}
        {!isCompact && (
          <div className="mt-6 pt-4 border-t border-gray-800/50">
            <div className="grid grid-cols-3 gap-4 text-sm">
              {showRevenue && (
                <div>
                  <p className="text-gray-400 mb-1">Revenue Moyen</p>
                  <p className="text-amber-400 font-bold">
                    {formatCurrency(
                      chartData.reduce((sum, d) => sum + d.revenue, 0) / chartData.length,
                    )}
                  </p>
                </div>
              )}
              {showCost && (
                <div>
                  <p className="text-gray-400 mb-1">Cout Moyen</p>
                  <p className="text-red-400 font-bold">
                    {formatCurrency(
                      chartData.reduce((sum, d) => sum + d.cost, 0) / chartData.length,
                    )}
                  </p>
                </div>
              )}
              {showMargin && (
                <div>
                  <p className="text-gray-400 mb-1">Marge Moyenne</p>
                  <p className="text-emerald-400 font-bold">
                    {formatCurrency(
                      chartData.reduce((sum, d) => sum + d.margin, 0) / chartData.length,
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

/**
 * Memoized FinancialTimeSeriesChart to prevent unnecessary re-renders
 * Only re-renders when props change
 */
export const FinancialTimeSeriesChart = memo(FinancialTimeSeriesChartInner)
