'use client'

import { type HTMLMotionProps, motion } from 'framer-motion'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface GlassCardProps extends HTMLMotionProps<'div'> {
  hover?: boolean
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, hover = true, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          'relative overflow-hidden rounded-2xl',
          'bg-white/10 dark:bg-white/5 backdrop-blur-md',
          'border border-white/20 dark:border-white/10',
          hover &&
            'hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20',
          className,
        )}
        whileHover={hover ? { scale: 1.02 } : undefined}
        transition={{ duration: 0.3 }}
        {...props}
      >
        {children}
      </motion.div>
    )
  },
)

GlassCard.displayName = 'GlassCard'

export default GlassCard
