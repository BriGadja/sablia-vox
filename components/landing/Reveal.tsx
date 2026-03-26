'use client'

// 'use client' needed: Motion whileInView uses IntersectionObserver (browser API)

// motion.div used directly — bundle impact is zero since Motion is already loaded by dashboard.
// LazyMotion + m.div would require a provider wrapper that complicates the landing page RSC tree.
import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface RevealProps {
  children: ReactNode
  className?: string
  /** Delay in seconds */
  delay?: number
  /** Direction the element slides from */
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  /** Animation duration in seconds */
  duration?: number
}

const offsets = {
  up: { y: 40 },
  down: { y: -40 },
  left: { x: -40 },
  right: { x: 40 },
  none: {},
} as const

export function Reveal({
  children,
  className,
  delay = 0,
  direction = 'up',
  duration = 0.7,
}: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, ...offsets[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}
