'use client'

import { motion } from 'framer-motion'
import { DollarSign, TrendingUp } from 'lucide-react'
import { FinancialViewMode, type FinancialViewToggleProps } from '@/lib/types/financial'

/**
 * FinancialViewToggle Component
 *
 * Toggle switch to alternate between Leasing and Consumption views
 * in the financial dashboard.
 *
 * @param mode - Current view mode ('leasing' | 'consumption')
 * @param onModeChange - Callback when mode changes
 */
export default function FinancialViewToggle({ mode, onModeChange }: FinancialViewToggleProps) {
  const isLeasing = mode === 'leasing'

  return (
    <div className="flex items-center justify-center gap-2 p-1 bg-slate-900/50 backdrop-blur-sm rounded-lg border border-slate-700/50">
      {/* Leasing Button */}
      <button
        onClick={() => onModeChange('leasing')}
        className={`
          relative px-6 py-2.5 rounded-md text-sm font-medium
          transition-all duration-200 ease-in-out
          flex items-center gap-2
          ${isLeasing ? 'text-white' : 'text-slate-400 hover:text-slate-300'}
        `}
      >
        {/* Background highlight for active mode */}
        {isLeasing && (
          <motion.div
            layoutId="activeTab"
            className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-md border border-violet-500/50"
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 30,
            }}
          />
        )}

        {/* Icon */}
        <DollarSign
          className={`
            w-4 h-4 relative z-10
            ${isLeasing ? 'text-violet-400' : 'text-slate-500'}
          `}
        />

        {/* Label */}
        <span className="relative z-10">Revenu</span>
      </button>

      {/* Consumption Button */}
      <button
        onClick={() => onModeChange('consumption')}
        className={`
          relative px-6 py-2.5 rounded-md text-sm font-medium
          transition-all duration-200 ease-in-out
          flex items-center gap-2
          ${!isLeasing ? 'text-white' : 'text-slate-400 hover:text-slate-300'}
        `}
      >
        {/* Background highlight for active mode */}
        {!isLeasing && (
          <motion.div
            layoutId="activeTab"
            className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-md border border-cyan-500/50"
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 30,
            }}
          />
        )}

        {/* Icon */}
        <TrendingUp
          className={`
            w-4 h-4 relative z-10
            ${!isLeasing ? 'text-cyan-400' : 'text-slate-500'}
          `}
        />

        {/* Label */}
        <span className="relative z-10">Consommation</span>

        {/* Badge: Variable margin */}
        {!isLeasing && (
          <span className="relative z-10 px-2 py-0.5 text-xs bg-cyan-500/20 text-cyan-300 rounded-full">
            Usage
          </span>
        )}
      </button>
    </div>
  )
}
