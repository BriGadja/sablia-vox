'use client'

import * as m from 'motion/react-m'
import { duration, ease } from '@/lib/motion-tokens'

interface SlideInProps {
  children: React.ReactNode
  direction?: 'left' | 'right'
  delay?: number
  duration?: number
  className?: string
}

export function SlideIn({
  children,
  direction = 'left',
  delay = 0,
  duration: dur = duration.normal,
  className,
}: SlideInProps) {
  return (
    <m.div
      initial={{ opacity: 0, x: direction === 'left' ? -24 : 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: dur, delay, ease: ease.default }}
      className={className}
    >
      {children}
    </m.div>
  )
}
