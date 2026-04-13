'use client'

import * as m from 'motion/react-m'
import { duration, ease } from '@/lib/motion-tokens'

interface SlideUpProps {
  children: React.ReactNode
  delay?: number
  duration?: number
  className?: string
}

export function SlideUp({
  children,
  delay = 0,
  duration: dur = duration.normal,
  className,
}: SlideUpProps) {
  return (
    <m.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: dur, delay, ease: ease.default }}
      className={className}
    >
      {children}
    </m.div>
  )
}
