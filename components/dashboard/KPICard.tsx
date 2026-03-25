'use client'

import { motion } from 'motion/react'
import { Minus, TrendingDown, TrendingUp } from 'lucide-react'

interface KPICardProps {
  label: string
  value: string | number | undefined
  previousValue?: number
  format?: 'number' | 'currency' | 'percentage' | 'duration' | 'latency'
  decorationColor?: 'blue' | 'emerald' | 'amber' | 'red' | 'violet' | 'teal'
  delay?: number
  compact?: boolean
}

const colorClasses = {
  blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/30',
  emerald: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30',
  amber: 'from-amber-500/20 to-amber-500/5 border-amber-500/30',
  red: 'from-red-500/20 to-red-500/5 border-red-500/30',
  violet: 'from-violet-500/20 to-violet-500/5 border-violet-500/30',
  teal: 'from-teal-500/20 to-teal-500/5 border-teal-500/30',
}

const decorationColors = {
  blue: 'bg-blue-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
  violet: 'bg-violet-500',
  teal: 'bg-teal-500',
}

export function KPICard({
  label,
  value,
  previousValue,
  format = 'number',
  decorationColor = 'blue',
  delay = 0,
  compact = false,
}: KPICardProps) {
  const formatValue = (val: number | string | undefined): string => {
    if (val === undefined || val === null) return '—'
    if (typeof val === 'string') return val

    switch (format) {
      case 'currency':
        return `${val.toFixed(2)}€`
      case 'percentage':
        return `${val.toFixed(1)}%`
      case 'duration': {
        const minutes = Math.floor(val / 60)
        const seconds = val % 60
        return `${minutes}:${seconds.toString().padStart(2, '0')}`
      }
      case 'latency':
        return `${Math.round(val)} ms`
      default:
        return val.toLocaleString('fr-FR')
    }
  }

  const calculateDelta = (): { value: number; trend: 'up' | 'down' | 'neutral' } | null => {
    if (previousValue === undefined || typeof value === 'string' || value === undefined) return null

    const numValue = typeof value === 'number' ? value : parseFloat(value)

    // Si la valeur précédente est 0, on ne peut pas calculer de pourcentage
    if (previousValue === 0) return null

    const change = ((numValue - previousValue) / previousValue) * 100

    if (Math.abs(change) < 0.1) return { value: 0, trend: 'neutral' }

    return {
      value: Math.abs(change),
      trend: change > 0 ? 'up' : 'down',
    }
  }

  const delta = calculateDelta()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`relative overflow-hidden rounded-xl border bg-linear-to-br backdrop-blur-sm ${colorClasses[decorationColor]}`}
    >
      {/* Decoration bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${decorationColors[decorationColor]}`} />

      <div className={compact ? 'p-4' : 'p-4'}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p
              className={`font-medium text-white/60 ${compact ? 'text-xs mb-0.5' : 'text-sm mb-1'}`}
            >
              {label}
            </p>
            <p className={`font-bold text-white ${compact ? 'text-xl' : 'text-2xl'}`}>
              {formatValue(value)}
            </p>
          </div>

          {delta && (
            <div
              className={`flex items-center gap-1 rounded-full font-semibold ${compact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs'} ${
                delta.trend === 'up'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : delta.trend === 'down'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-gray-500/20 text-gray-400'
              }`}
            >
              {delta.trend === 'up' ? (
                <TrendingUp className={compact ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
              ) : delta.trend === 'down' ? (
                <TrendingDown className={compact ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
              ) : (
                <Minus className={compact ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
              )}
              {delta.value > 0 && (
                <span>
                  {delta.trend === 'up' ? '+' : '-'}
                  {delta.value.toFixed(1)}%
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Subtle gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-linear-to-t from-black/10 to-transparent pointer-events-none" />
    </motion.div>
  )
}
